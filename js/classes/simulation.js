var RESULT = {
    HIT: 0,
    MISS: 1,
    DODGE: 2,
    CRIT: 3,
    GLANCE: 4
}

var batching = 0;
var step = 0;
var log = false;
var version = 4;

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
                result.mindps = Math.min(result.mindps, data.mindps);
                result.maxdps = Math.min(result.maxdps, data.maxdps);
                result.mintps = Math.min(result.mintps, data.mintps);
                result.maxtps = Math.min(result.maxtps, data.maxtps);
                result.sumdps += data.sumdps;
                result.sumdps2 += data.sumdps2;
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
                            for (let i = 0; i < src.data.length; ++i) {
                                dst.data[i] += src.data[i];
                            }
                        }
                    }
                    function mergeWeapon(dst, src) {
                        if (dst) {
                            dst.totaldmg += src.totaldmg;
                            dst.totalprocdmg += src.totalprocdmg;
                            for (let i = 0; i < src.data.length; ++i) {
                                dst.data[i] += src.data[i];
                            }
                            return dst;
                        } else {
                            return src;
                        }
                    }
                    result.player.mh = mergeWeapon(result.player.mh, data.player.mh);
                }
            });
            this.callback_finished(result);
        } else {
            let iteration = 0;
            const data = { iterations: this.iterations, totaldmg: 0, totalduration: 0 };
            this.states.forEach(state => {
                if (!state) return;
                iteration += (state.status ? state.data.iterations : state.iteration);
                data.totaldmg += state.data.totaldmg;
                data.totalthreat += state.data.totalthreat;
                data.totalduration += state.data.totalduration;
            });
            this.callback_update(iteration, data);
        }
    }

    start(params) {
        params.globals = getGlobalsDelta();
        this.iterations = params.sim.iterations;
        let remain = params.sim.iterations;
        this.workers.forEach((worker, i) => {
            const current = Math.round(remain / (this.workers.length - i));
            remain -= current;
            worker.start({...params, sim: {...params.sim, iterations: current}});
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
            priorityap: parseInt(spells[1].priorityap),
            batching: parseInt($('select[name="batching"]').val()),
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
        batching = config.batching;
        this.idmg = 0;
        this.ithreat = 0;
        this.totaldmg = 0;
        this.totalthreat = 0;
        this.totalduration = 0;
        this.mindps = 99999;
        this.maxdps = 0;
        this.mintps = 99999;
        this.maxtps = 0;
        this.sumdps = 0;
        this.sumdps2 = 0;
        this.sumthreat = 0;
        this.maxcallstack = Math.min(Math.floor(this.iterations / 10), 1000);
        this.starttime = 0;
        this.endtime = 0;
        this.cb_update = callback_update;
        this.cb_finished = callback_finished;
        this.spread = [];
        this.tpsspread = [];
        this.priorityap = parseInt(spells[1].priorityap);

        if (this.iterations == 1) log = true;
        else log = false;
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
        let player = this.player;
        player.reset(this.startrage);
        this.maxsteps = rng(this.timesecsmin * 1000, this.timesecsmax * 1000);
        this.duration = this.maxsteps / 1000;
        this.executestep = this.maxsteps - parseInt(this.maxsteps * (this.executeperc / 100));
        let delayedspell, delayedheroic;
        let spellcheck = false;
        let next = 0;
        let damageDone = 0;
        let threatDone = 0;
        var damage_threat = [0, 0];

        // item steps
        let itemdelay = 0;
        if (player.auras.slayer) { this.slayerstep = Math.max(this.maxsteps - itemdelay - 20000, 0); itemdelay += 20000; }
        if (player.auras.spider) { this.spiderstep = Math.max(this.maxsteps - itemdelay - 15000, 0); itemdelay += 15000; }
        if (player.auras.bloodlustbrooch) { this.broochstep = Math.max(this.maxsteps - itemdelay - 20000, 0); itemdelay += 20000; }
        if (player.auras.pummeler) { this.pummelstep = Math.max(this.maxsteps - itemdelay - 30000, 0); itemdelay += 30000; }

        if (player.auras.swarmguard) { player.auras.swarmguard.usestep = Math.max(this.maxsteps - player.auras.swarmguard.timetoend, 0); }


        if (log) console.log(' TIME |   RAGE | EVENT');

        while (step < this.maxsteps) {

            // Attacks
            if (player.mh.timer <= 0) {
                damage_threat = player.attackmh(player.mh, damage_threat);
                damageDone = damage_threat[0];
                threatDone = damage_threat[1];
                this.idmg += damageDone;
                this.ithreat += threatDone;
                spellcheck = true;
            }

            // Spells
            if (spellcheck && !player.spelldelay) {

                // No GCD
                if (player.auras.swarmguard && player.auras.swarmguard.canUse()) { player.spelldelay = 1; delayedspell = player.auras.swarmguard; }
                
                // GCD spells
                else if (player.auras.slayer && player.auras.slayer.canUse() && step > this.slayerstep) { player.spelldelay = 1; delayedspell = player.auras.slayer; }
                else if (player.auras.spider && player.auras.spider.canUse() && step > this.spiderstep) { player.spelldelay = 1; delayedspell = player.auras.spider; }
                else if (player.auras.bloodlustbrooch && player.auras.bloodlustbrooch.canUse() && step > this.brooochstep) { player.spelldelay = 1; delayedspell = player.auras.bloodlustbrooch; }
                else if (player.auras.pummeler && player.auras.pummeler.canUse() && step > this.pummelstep) { player.spelldelay = 1; delayedspell = player.auras.pummeler; }

                // Normal phase
                else if (player.spells.faeriefire && player.spells.faeriefire.canUse()) { player.spelldelay = 1; delayedspell = player.spells.faeriefire; }
                else if (player.spells.mangle && player.spells.mangle.canUse()) { player.spelldelay = 1; delayedspell = player.spells.mangle; }
                else if (player.spells.lacerate && player.spells.lacerate.canUse()) { player.spelldelay = 1; delayedspell = player.spells.lacerate; }
                else if (player.spells.swipe && player.spells.swipe.canUse()) { player.spelldelay = 1; delayedspell = player.spells.swipe; }

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
                    damage_threat = player.cast(delayedspell, damage_threat);
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
            if (player.itemtimer && player.itemtimer < next) next = player.itemtimer;

            if (player.spells.mangle && player.spells.mangle.timer && player.spells.mangle.timer < next) next = player.spells.mangle.timer;
            if (player.spells.lacerate && player.spells.lacerate.timer && player.spells.lacerate.timer < next) next = player.spells.lacerate.timer;
            if (player.spells.swipe && player.spells.swipe.timer && player.spells.swipe.timer < next) next = player.spells.swipe.timer;

            if (next == 0) { debugger; break; } // Something went wrong!
            step += next;
            player.mh.step(next);
            if (player.timer && player.steptimer(next) && !player.spelldelay) spellcheck = true;
            if (player.itemtimer && player.stepitemtimer(next) && !player.spelldelay) spellcheck = true;
            if (player.spelldelay) player.spelldelay += next;
            if (player.heroicdelay) player.heroicdelay += next;

            if (player.spells.mangle && player.spells.mangle.timer && !player.spells.mangle.step(next) && !player.spelldelay) spellcheck = true;
            if (player.spells.lacerate && player.spells.lacerate.timer && !player.spells.lacerate.step(next) && !player.spelldelay) spellcheck = true;
            if (player.spells.swipe && player.spells.swipe.timer && !player.spells.swipe.step(next) && !player.spelldelay) spellcheck = true;
        }

        // Fight done
        player.endauras();

        if (player.auras.laceratedot) {
            this.idmg += player.auras.laceratedot.idmg;
            this.ithreat += player.auras.laceratedot.idmg * 0.50;
            player.spells.lacerate.totalthreat += player.auras.laceratedot.idmg * 0.50;

        }
        this.totaldmg += this.idmg;
        this.totalthreat += this.ithreat;
        this.totalduration += this.duration;
        let dps = this.idmg / this.duration;
        let tps = this.ithreat / this.duration;
        if (dps < this.mindps) this.mindps = dps;
        if (dps > this.maxdps) this.maxdps = dps;
        if (tps < this.mintps) this.mintps = tps;
        if (tps > this.maxtps) this.maxtps = tps;
        this.sumdps += dps;
        this.sumdps2 += dps * dps;
        this.sumthreat += tps;
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
                totalduration: this.totalduration,
            });
        }
    }
    finished() {
        if (this.cb_finished) {
            this.cb_finished({
                iterations: this.iterations,
                totaldmg: this.totaldmg,
                totalthreat: this.totalthreat,
                totalduration: this.totalduration,
                mindps: this.mindps,
                maxdps: this.maxdps,
                mintps: this.mintps,
                maxtps: this.maxtps,
                sumdps: this.sumdps,
                sumdps2: this.sumdps2,
                sumthreat: this.sumthreat,
                starttime: this.starttime,
                endtime: this.endtime,
            });
        }
    }
}

function rng(min, max) {
    return ~~(Math.random() * (max - min + 1) + min);
}

function rng10k() {
    return ~~(Math.random() * 10000);
}

function avg(min, max) {
    return (min + max) / 2;
}
