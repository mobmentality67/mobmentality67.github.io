var RESULT = {
    HIT: 0,
    PARRY: 1,
    MISS: 2,
    DODGE: 3,
    CRIT: 4,
    GLANCE: 5,
    CRUSH: 6,
    BLOCK: 7,
    BLOCKED_CRIT: 8
}

var batching = 0;
var step = 0;
var log = false;
var version = 7;

const TYPE = {
    UPDATE: 0,
    FINISHED: 1,
    ERROR: 2,
}

class SimulationWorker {
    constructor(callback_finished, callback_update, callback_error) {
        this.worker = new Worker('./dist/js/sim-worker.js');
        this.worker.onerror = (...args) => {
            callback_error(...args);
            this.worker.terminate();
        };
        this.worker.onmessage = (event) => {
            const [type, ...args] = event.data;
            switch (type) {
                case TYPE.UPDATE:
                    callback_update(...args);
                    break;
                case TYPE.FINISHED:
                    callback_finished(...args);
                    this.worker.terminate();
                    break;
                case TYPE.ERROR:
                    callback_error(...args);
                    this.worker.terminate();
                    break;
                default:
                    callback_error(`Unexpected type: ${type}`);
                    this.worker.terminate();
            }
        };
    }

    start(params) {
        params.globals = getGlobalsDelta();
        this.worker.postMessage(params);
        this.totalIterations = params.sim.iterations;

    }
}

class SimulationWorkerParallel {
    constructor(threads, callback_finished, callback_update, callback_error) {
        this.threads = threads;
        this.callback_finished = callback_finished;
        this.callback_update = callback_update;
        this.states = [...Array(this.threads)];
        this.workers = this.states.map((_, i) => new SimulationWorker(
            data => { this.states[i] = { status: 1, data }; this.update(); },
            (iteration, data) => { this.states[i] = { status: 0, iteration, data }; this.update(); },
            error => { if (!this.error) { this.error = error; callback_error(error); } },
        ));
    }

    update() {
        if (this.error) return;
        const completed = this.states.reduce((count, state) => count + (state && state.status || 0), 0);
        if (completed >= this.states.length) {
            const result = this.states[0].data;
            this.states.slice(1).forEach(({data}) => {
                result.iterations += data.iterations;
                result.totaldmg += data.totaldmg;
                result.totalthreat += data.totalthreat;
                result.totalduration += data.totalduration;
                result.totaldamagetaken += data.totaldamagetaken;
                result.totaldeaths += data.totaldeaths;
                result.totaldefensivesaves += data.totaldefensivesaves;
                result.mindps = Math.min(result.mindps, data.mindps);
                result.maxdps = Math.min(result.maxdps, data.maxdps);
                result.mintps = Math.min(result.mintps, data.mintps);
                result.maxtps = Math.min(result.maxtps, data.maxtps);
                result.mindtps = Math.min(result.mindtps, data.mindtps);
                result.maxdtps = Math.min(result.maxdtps, data.maxdtps);
                result.sumdps += data.sumdps;
                result.sumdps2 += data.sumdps2;
                result.sumthreat += data.sumthreat;
                result.sumthreat2 += data.sumthreat2;
                result.pullvariancemet += data.pullvariancemet;
                result.starttime = Math.min(result.starttime, data.starttime);
                result.endtime = Math.min(result.endtime, data.endtime);
                if (result.spread && data.spread) {
                    for (let i in data.spread) {
                        result.spread[i] = (result.spread[i] || 0) + data.spread[i];
                    }
                }
                if (result.player && data.player) {
                    for (let id in data.player.auras) {
                        const src = data.player.auras[id], dst = result.player.auras[id];
                        if (!dst) {
                            result.player.auras[id] = src;
                        } else {
                            dst.uptime += src.uptime;
                            if (src.totaldmg) {
                                dst.totaldmg = (dst.totaldmg || 0) + src.totaldmg;
                            }
                        }
                    }
                    for (let id in data.player.spells) {
                        const src = data.player.spells[id], dst = result.player.spells[id];
                        if (!dst) {
                            result.player.spells[id] = src;
                        } else {
                            dst.totaldmg += src.totaldmg;
                            dst.totalthreat += src.totalthreat;
                            for (let i = 0; i < src.data.length; ++i) {
                                dst.data[i] += src.data[i];
                            }
                        }
                    }
                    function mergeWeapon(dst, src) {
                        if (dst) {
                            dst.totaldmg += src.totaldmg;
                            dst.totalprocdmg += src.totalprocdmg;
                            dst.totalthreat += src.totalthreat;
                            for (let i = 0; i < src.data.length; ++i) {
                                dst.data[i] += src.data[i];
                            }
                            return dst;
                        } else {
                            return src;
                        }
                    }
                    result.ehp = player.getEHP().toFixed(2);
                    result.player.mh = mergeWeapon(result.player.mh, data.player.mh);
                }
            });
            this.callback_finished(result);
        } else {
            let iteration = 0;
            const data = { iterations: this.iterations, totalthreat:0, totaldamagetaken:0, totaldmg: 0, totalduration: 0, totaldeaths: 0, totaldefensivesaves: 0};
            this.states.forEach(state => {
                if (!state) return;
                iteration += (state.status ? state.data.iterations : state.iteration);
                data.totaldmg += state.data.totaldmg;
                data.totalthreat += state.data.totalthreat;
                data.totaldamagetaken += state.data.totaldamagetaken;
                data.totalduration += state.data.totalduration;
                data.totaldeaths += state.data.totaldeaths;
                data.totaldefensivesaves += state.data.totaldefensivesaves;
            });
            this.callback_update(iteration, data);
        }
    }

    start(params) {
        params.globals = getGlobalsDelta();
        this.iterations = params.sim.iterations;
        this.totalIterations = params.sim.iterations;
        let remain = params.sim.iterations;
        this.workers.forEach((worker, i) => {
            const current = Math.round(remain / (this.workers.length - i));
            remain -= current;
            worker.start({...params, sim: {...params.sim, iterations: current, totalIterations: params.sim.iterations}});
        });
    }
}

class Simulation {
    static getConfig() {
        return {
            timesecsmin: parseInt($('input[name="timesecsmin"]').val()),
            timesecsmax: parseInt($('input[name="timesecsmax"]').val()),
            executeperc: parseInt($('input[name="executeperc"]').val()),
            startrage: parseInt($('input[name="startrage"]').val()),
            iterations: parseInt($('input[name="simulations"]').val()),
            activetank: ($('input[name="activetank"]').val()) == "Yes",
            bosscrush: ($('input[name="bosscrush"]').val()) == "Yes",
            bossparryhaste: ($('input[name="bossparryhaste"]').val()) == "Yes",
            bossdw: ($('input[name="bossdw"]').val()) == "Yes",
            incswingdamage: parseFloat($('input[name="incswingdamage"]').val()),
            incswingtimer: parseFloat($('input[name="incswingtimer"]').val()),
            priorityap: parseInt(spells[1].priorityap),
            pullvariancethreshold: parseFloat($('input[name="pullvariancethreshold"]').val()),
            pullvariancetime: parseFloat($('input[name="pullvariancetime"]').val()),
            pullvariancemdthreat: parseFloat($('input[name="pullvariancemdthreat"]').val()),
            inchpslifebloom: parseFloat($('input[name="inchpslifebloom"]').val()),
        };
    }
    constructor(player, callback_finished, callback_update, config) {
        if (!config) config = Simulation.getConfig();
        this.player = player;
        this.timesecsmin = config.timesecsmin;
        this.timesecsmax = config.timesecsmax;
        this.executeperc = config.executeperc;
        this.startrage = config.startrage;
        this.iterations = config.iterations;
        this.activetank = config.activetank;
        this.bosscrush = config.bosscrush;
        this.bossparryhaste = config.bossparryhaste;
        this.bossdw = config.bossdw;
        this.incswingdamage = config.incswingdamage;
        this.pullvariancethreshold = config.pullvariancethreshold;
        this.pullvariancetime = config.pullvariancetime * 1000;
        this.pullvariancemdthreat = config.pullvariancemdthreat;
        this.pullvariancemet = 0;
        this.idmg = 0;
        this.ithreat = 0;
        this.totaldmg = 0;
        this.totalthreat = 0;
        this.totaldamagetaken = 0;
        this.totalduration = 0;
        this.totaldeaths = 0;
        this.totaldefensivesaves = 0;
        this.mindps = 99999;
        this.maxdps = 0;
        this.mintps = 99999;
        this.maxtps = 0;
        this.mindtps = 9999999999;
        this.maxdtps = 0;
        this.sumdps = 0;
        this.sumdps2 = 0;
        this.sumthreat = 0;
        this.sumthreat2 = 0;
        this.maxcallstack = Math.min(Math.floor(this.iterations / 10), 1000);
        this.starttime = 0;
        this.endtime = 0;
        this.cb_update = callback_update;
        this.cb_finished = callback_finished;
        this.spread = [];
        this.tpsspread = [];
        this.priorityap = parseInt(spells[1].priorityap);

        if (config.totalIterations == 1) {
            log = true;
            player.enableLogging = true;
        }
        else {
            log = false;
        }
    }
    startSync() {
        this.starttime = new Date().getTime();
        let iteration;
        for (iteration = 1; iteration <= this.iterations; ++iteration) {
            this.run();
            if (iteration % this.maxcallstack == 0) {
                this.update(iteration);
            }
        }
        this.endtime = new Date().getTime();
        this.finished();
    }
    startAsync() {
        this.starttime = new Date().getTime();
        this.runAsync(1);
    }
    runAsync(iteration) {
        this.run();
        if (iteration == this.iterations) {
            this.endtime = new Date().getTime();
            this.finished();
        } else if (iteration % this.maxcallstack == 0) {
            this.update(iteration);
            setTimeout(() => this.runAsync(iteration + 1), 0);
        } else {
            this.runAsync(iteration + 1);
        }
    }
    run() {
        step = 0;
        this.idmg = 0;
        this.ithreat = 0;
        this.idamagetaken = 0;
        let player = this.player;
        player.reset(this.startrage);
        this.maxsteps = rng(this.timesecsmin * 1000, this.timesecsmax * 1000);
        this.duration = this.maxsteps / 1000;
        let delayedspell, delayedheroic;
        let spellcheck = false;
        let next = 0;
        let damageDone = 0;
        let threatDone = 0;
        let died = false;
        let bossswinglanded = false;
        var damage_threat = [0, 0];
        /* If weapon RNG is enabled, randomize first swing time [0, 1s) */
        if (this.player.weaponrng) {
            player.mh.timer = (~~rng10k() / 10) | 0;
        }

        let activatedSpells = [
            player.auras.slayer,
            player.auras.spider,
            player.auras.bloodlustbrooch,
            player.auras.direbrew,
            player.auras.tablet,
            player.auras.madness,
            player.auras.berserkers,
            player.auras.pummeler,
            player.auras.abacus,
            player.auras.swarmguard,
            player.auras.icon,
            player.auras.dst,
            player.auras.band,
            player.auras.hourglass,
            player.auras.tsunami,
            player.auras.shard,
            player.auras.sliver,
            player.auras.bloodlust,
            player.auras.hastepot,
            player.auras.pummeler,
            player.auras.tenacity,
            player.auras.squawks,
            player.auras.mangleapbuff,
            player.auras.primalinstinct,
            player.auras.protectorsvigor,
            player.auras.tremendousfortitude,
            player.auras.tenacitydefensive,
            player.auras.timesfavor,
            player.auras.evasivemaneuvers
        ];

        let bossSpells = [
            player.auras.stomp
        ];

        /* Remove spells/auras that don't exist in this run */
        activatedSpells = activatedSpells.filter(aura => aura);
        bossSpells = bossSpells.filter(aura => aura);

        if (log) console.log(' TIME |   RAGE | EVENT');


        /* Pop lust if active */
        if (player.auras.bloodlust) {
            player.cast(player.auras.bloodlust, damage_threat);
        }  

        /* Pop haste pot if active */
        if (player.auras.hastepot) {
            player.cast(player.auras.hastepot, damage_threat);
        }  

        /* Pop chicken if active */
        if (player.auras.squawks) {
            player.cast(player.auras.squawks, damage_threat);
        } 

        // Manually check once for pre-pop trinkets to avoid artifically delaying on-pull spells
        if (player.itemsEquipped.trinket1 && player.itemsEquipped.trinket1.usespell) {
            let trinket1Spell = activatedSpells.filter(spell => spell.constructor.name == player.itemsEquipped.trinket1.usespell)[0];
            player.cast(trinket1Spell, damage_threat);
        }
        if (player.itemsEquipped.trinket2 && player.itemsEquipped.trinket2.usespell) {
            let trinket2Spell = activatedSpells.filter(spell => spell.constructor.name == player.itemsEquipped.trinket2.usespell)[0];
            if (trinket2Spell.canUse()) {
                player.cast(trinket2Spell, damage_threat);
            }
        }     

        // Manually check if Maul should be queued with starting rage
        if (player.spells.maul && player.spells.maul.canUse()) {
            player.nextswinghs = true;
        }   

        while (step < this.maxsteps) {

            // Check debuffs
            player.updateTargetArmorForTime(step);

            // Attack boss
            if (player.mh.timer <= 0) {
                /* Step timers for active spells */
                player.stepauras(activatedSpells, bossSpells);
                damage_threat = player.attackmh(player.mh, damage_threat, step);
                damageDone = damage_threat[0];
                threatDone = damage_threat[1];
                this.idmg += damageDone;
                this.ithreat += threatDone;
                spellcheck = true;
            }

            // Incoming attack
            if (player.activetank && player.incswingtimer <= 0) {
                /* Take boss auto-attack */
                let damageTaken = player.takeattack(step);
                this.idamagetaken += damageTaken;
                if (damageTaken) {
                    bossswinglanded = true;
                }
                if (!died) {
                   died = player.updatehealth(damageTaken, activatedSpells); 
                }

                /* Check boss specials */
                damageTaken = player.takebossspecial(step, bossSpells, bossswinglanded);
                this.idamagetaken += damageTaken;
                if (!died) {
                   died = player.updatehealth(damageTaken, activatedSpells); 
                }

                spellcheck = true;
            }

            // Spells
            if (spellcheck && !player.spelldelay) {

                // Use a trinket if possible
                delayedspell = null;
                activatedSpells.forEach(spell => {
                    if (spell.canUse() && spell.activeUse && !spell.defensive) {
                        player.spelldelay = 1;
                        delayedspell = spell;
                    }
                })
                
                // Otherwise use a spell
                if (!delayedspell) {
                    if (player.spells.faeriefire && player.spells.faeriefire.canUse()) { player.spelldelay = 1; delayedspell = player.spells.faeriefire; }
                    else if (player.spells.mangle && player.spells.mangle.canUse()) { player.spelldelay = 1; delayedspell = player.spells.mangle; }
                    else if (player.spells.lacerate && player.spells.lacerate.canUse()) { player.spelldelay = 1; delayedspell = player.spells.lacerate; }
                    else if (player.spells.swipe && player.spells.swipe.canUse()) { player.spelldelay = 1; delayedspell = player.spells.swipe; }
                }

                if (log && player.spelldelay) player.log(`Preparing ${delayedspell.name}`);
                if (player.heroicdelay) spellcheck = false;
            }

            // Maul
            if (spellcheck && !player.heroicdelay) {
                if (player.spells.maul && player.spells.maul.canUse()) { player.heroicdelay = 1; delayedheroic = player.spells.maul; }

                if (log && player.heroicdelay) player.log(`Preparing ${delayedheroic.name}`);

                spellcheck = false;
            }

            // Cast spells
            if (player.spelldelay && delayedspell && player.spelldelay > delayedspell.maxdelay) {

                // Prevent casting HS and other spells at the exact same time
                if (player.heroicdelay && delayedheroic && player.heroicdelay > delayedheroic.maxdelay)
                    player.heroicdelay = delayedheroic.maxdelay - 49;
                if (delayedspell.canUse()) {
                    /* Step timers for active spells */
                    player.stepauras(activatedSpells, bossSpells);
                    damage_threat = player.cast(delayedspell, damage_threat, step);
                    this.idmg += damage_threat[0];
                    this.ithreat += damage_threat[1];
                    player.spelldelay = 0;
                    spellcheck = true;
                }
                else {
                    player.spelldelay = 0;
                }
            }

            // Cast Maul
            if (player.heroicdelay && delayedheroic && player.heroicdelay > delayedheroic.maxdelay) {
                if (delayedheroic.canUse()) {
                    // TODO: idmg, threat not  recorded here?
                    player.cast(delayedheroic, damage_threat);
                    player.heroicdelay = 0;
                    spellcheck = true;
                }
                else {
                    player.heroicdelay = 0;
                }
            }
          
            // Process next step
            if (!player.mh.timer || (!player.spelldelay && spellcheck) || (!player.heroicdelay && spellcheck)) { next = 0; continue; }
            next = player.mh.timer;
            if (player.spelldelay && (delayedspell.maxdelay - player.spelldelay) < next) next = delayedspell.maxdelay - player.spelldelay + 1;
            if (player.heroicdelay && (delayedheroic.maxdelay - player.heroicdelay) < next) next = delayedheroic.maxdelay - player.heroicdelay + 1;
            if (player.timer && player.timer < next) next = player.timer;
            if (player.activetank && player.incswingtimer && player.incswingtimer < next) next = player.incswingtimer;
            if (player.itemtimer && player.itemtimer < next) next = player.itemtimer;

            if (player.spells.mangle && player.spells.mangle.timer && player.spells.mangle.timer < next) next = player.spells.mangle.timer;
            if (player.spells.lacerate && player.spells.lacerate.timer && player.spells.lacerate.timer < next) next = player.spells.lacerate.timer;
            if (player.spells.swipe && player.spells.swipe.timer && player.spells.swipe.timer < next) next = player.spells.swipe.timer;

            if (next == 0) { debugger; break; } // Something went wrong!

            // Check if next is going to exceed pull variance and record current results if so 
            if (step < this.pullvariancetime && (step + next) >= this.pullvariancetime) {
                if (this.ithreat + this.pullvariancemdthreat > this.pullvariancethreshold ) {
                    this.pullvariancemet++;
                }
            }

            step += next;
            player.mh.step(next);
            if (player.timer && player.steptimer(next) && !player.spelldelay) spellcheck = true;
            if (player.incswingtimer && stepincswingtimer(next, player, log)) spellcheck = true;
            if (player.itemtimer && player.stepitemtimer(next) && !player.spelldelay) spellcheck = true;
            if (player.spelldelay) player.spelldelay += next;
            if (player.heroicdelay) player.heroicdelay += next;

            if (player.spells.mangle && player.spells.mangle.timer && !player.spells.mangle.step(next) && !player.spelldelay) spellcheck = true;
            if (player.spells.lacerate && player.spells.lacerate.timer && !player.spells.lacerate.step(next) && !player.spelldelay) spellcheck = true;
            if (player.spells.swipe && player.spells.swipe.timer && !player.spells.swipe.step(next) && !player.spelldelay) spellcheck = true;
        }

        // Fight done
        player.endauras(activatedSpells, bossSpells);
        player.currenthp = player.stats.maxhp;

        if (player.auras.laceratedot && player.spells.lacerate) {
            this.idmg += player.auras.laceratedot.idmg;
            let threat = player.dealthreat(player.auras.laceratedot.idmg, RESULT.HIT, player.auras.laceratedot);
            this.ithreat += threat;
            player.spells.lacerate.totalthreat += threat;
        }
        this.totaldmg += this.idmg;
        this.totalthreat += this.ithreat;
        this.totaldamagetaken += this.idamagetaken;
        this.totalduration += this.duration;
        if (died) {
            this.totaldeaths++;
        }
        else if (player.defensivesave) {
            this.totaldefensivesaves++;
        }
        
        this.ehp = this.player.getEHP();
        let dps = this.idmg / this.duration;
        let tps = this.ithreat / this.duration;
        let dtps = this.idamagetaken / this.duration;
        if (dps < this.mindps) this.mindps = dps;
        if (dps > this.maxdps) this.maxdps = dps;
        if (tps < this.mintps) this.mintps = tps;
        if (tps > this.maxtps) this.maxtps = tps;
        if (dtps < this.mindtps) this.mindtps = dtps;
        if (dtps > this.maxdtps) this.maxdtps = dtps;
        this.sumdps += dps;
        this.sumdps2 += dps * dps;
        this.sumthreat += tps;
        this.sumthreat2 += tps * tps;
        dps = Math.round(dps);
        tps = Math.round(tps);
        if (!this.spread[dps]) this.spread[dps] = 1;
        else this.spread[dps]++;
        if (!this.tpsspread[tps]) this.tpsspread[tps] = 1;
        else this.tpsspread[tps]++;
    }
    update(iteration) {
        if (this.cb_update) {
            this.cb_update(iteration, {
                iterations: this.iterations,
                totaldmg: this.totaldmg,
                totalthreat: this.totalthreat,
                totaldamagetaken: this.totaldamagetaken,
                totalduration: this.totalduration,
                totaldeaths: this.totaldeaths,
                totaldefensivesaves: this.totaldefensivesaves,
                ehp: this.player.getEHP(),
            });
        }
    }
    finished() {
        if (this.cb_finished) {
            this.cb_finished({
                iterations: this.iterations,
                totaldmg: this.totaldmg,
                totalthreat: this.totalthreat,
                totaldamagetaken: this.totaldamagetaken,
                totalduration: this.totalduration,
                totaldeaths: this.totaldeaths,
                totaldefensivesaves: this.totaldefensivesaves,
                mindps: this.mindps,
                maxdps: this.maxdps,
                mintps: this.mintps,
                maxtps: this.maxtps,
                mindtps: this.mindtps,
                maxdtps: this.maxdtps,
                sumdps: this.sumdps,
                sumdps2: this.sumdps2,
                sumthreat: this.sumthreat,
                sumthreat2: this.sumthreat2,
                pullvariancemet: this.pullvariancemet,
                starttime: this.starttime,
                endtime: this.endtime,
                ehp: this.ehp
            });
        }
    }
}

function stepincswingtimer(a, player, log) {
    if (player.incswingtimer <= a) {
        player.incswingtimer = 0;
        return true;
    }
    else {
        player.incswingtimer -= a;
        return false;
    }
}

function rng(min, max) {
    return ~~(Math.random() * (max - min + 1) + min);
}

function rng10k() {
    return ~~(Math.random() * 10000);
}

function rng100() {
    return ~~(Math.random() * 100);
}

function avg(min, max) {
    return (min + max) / 2;
}
