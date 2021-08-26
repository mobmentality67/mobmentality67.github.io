class Player {
    static getConfig(base) {
        return {
            race: $('select[name="race"]').val(),
            weaponrng: $('select[name="weaponrng"]').val() == "Yes",
            spelldamage: parseInt($('input[name="spelldamage"]').val()),
            target: {
                level: parseInt($('input[name="targetlevel"]').val()),
                basearmor: parseInt($('input[name="targetarmor"]').val()),
                armor: parseInt($('input[name="targetarmor"]').val()),
                defense: parseInt($('input[name="targetlevel"]').val()) * 5,
                binaryresist: parseInt(10000 - (8300 * (1 - (parseInt($('input[name="targetresistance"]').val()) * 0.15 / 60)))),
            },
            activetank: $('select[name="activetank"]').val() == "Yes",
            incswingdamage: parseFloat($('input[name="incswingdamage"]').val()),
            incswingtimer: parseFloat($('input[name="incswingtimer"]').val()),
        };
    }
    constructor(testItem, testType, enchtype, config) {
        if (!config) config = Player.getConfig();
        this.rage = 0;
        this.level = 70;
        this.timer = 0;
        this.itemtimer = 0;
        this.extraattacks = 0;
        this.batchedextras = 0;
        this.nextswinghs = false;
        this.nextswingcl = false;
        this.race = config.race;
        this.weaponrng = config.weaponrng;
        this.spelldamage = config.spelldamage;
        this.target = config.target;
        this.activetank = config.activetank;
        this.incswingdamage = config.incswingdamage;
        this.incswingtimer = config.incswingtimer * 1000;
        this.ooc = false;
        this.enableLogging = false;
        this.base = {
            sta: 0,
            ac: 0,
            def: 0,
            res: 0,
            ap: 210,
            agi: 0,
            str: 0,
            bonusac: 0,
            incdodge: 0,
            incdodgerating: 0,
            incswingtimer: config.incswingtimer * 1000,
            incmiss: 0,
            hit: 0,
            hitrating: 0,
            crit: 0,
            critrating: 0,
            critbonusmod: 0,
            spellcrit: 0,
            exp: 0,
            skill: this.level * 5,
            haste: 1,
            hasterating: 0,
            stammod: 1.25,
            armormod: 5.0,
            strmod: 1,
            agimod: 1,
            dmgmod: 1,
            threatmod: 1,
            apmod: 1
        };
        if (enchtype == 1) {
            this.testEnch = testItem;
            this.testEnchType = testType;
        }
        else if (enchtype == 2) {
            this.testTempEnch = testItem;
            this.testTempEnchType = testType;
        }
        else if (enchtype == 3) {
            this.log(`Test type = ${testType}`);
            if (testType == 0) {
                this.base.ap += testItem;
            }
            else if (testType == 1) {
                this.base.crit += testItem;
            }
            else if (testType == 2) {
                this.base.hit += testItem;
            }
            else if (testType == 3) {
                this.base.str += testItem;
            }
            else if (testType == 4) {
                this.base.agi += testItem;
            }
            else if (testType == 5) {
                this.base.hasterating += testItem;
            }
        }
        else if (enchtype == 4) {
            this.testTempEnch = testItem;
            this.testTempEnchType = testType;
        }
        else {
            this.testItem = testItem;
            this.testItemType = testType;
        }
        this.stats = {};
        this.auras = {};
        this.spells = {};
        this.items = [];
        this.itemsEquipped = [];
        this.addRace();
        this.addTalents();
        this.addGear();
        if (!this.mh) return;
        this.addSets();
        this.addEnchants();
        this.addTempEnchants();
        this.addGem();
        this.addBuffs();
        this.addSpells();
        this.ooc = new OmenOfClarity(this, this.talents.ooc);


        this.auras.laceratedot = new LacerateDOT(this);
        if (this.items.includes(9449)) this.auras.pummeler = new Pummeler(this);
        if (this.items.includes(23041)) this.auras.slayer = new Slayer(this);
        if (this.items.includes(22954)) this.auras.spider = new Spider(this);
        if (this.items.includes(29383)) this.auras.bloodlustbrooch = new BloodlustBrooch(this);
        if (this.items.includes(21670)) this.auras.swarmguard = new Swarmguard(this);
        if (this.items.includes(28288)) this.auras.abacus = new Abacus(this);
        if (this.lust) this.auras.bloodlust = new Bloodlust(this);
        this.update();
    }

    addRace() {
        for (let race of races) {
            if (race.name == this.race) {
                this.base.aprace = race.ap;
                this.base.ap += race.ap;
                this.base.str += race.str;
                this.base.agi += race.agi;
                this.base.sta += race.sta;
                this.base.critrating += race.critrating;
            }
        }
    }

    addTalents() {
        this.talents = {};
        for (let tree in talents) {
            for (let talent of talents[tree].t) {
                this.talents = Object.assign(this.talents, talent.aura(talent.c));
            }
        }
    }

    addGear() {
        for (let type in gear) {
            for (let item of gear[type]) {
                if ((this.testItemType == type && this.testItem == item.id) ||
                    (this.testItemType != type && item.selected)) {
                    for (let prop in this.base)
                        this.base[prop] += item[prop] || 0;

                    if (type == "mainhand" || type == "offhand" || type == "twohand")
                        this.addWeapon(item, type);
                   
                    if (item.procchance && (type == "trinket1" || type == "trinket2")) {
                        let proc = {};
                        proc.chance = item.procchance * 100;
                        proc.extra = item.procextra;
                        proc.magicdmg = item.magicdmg;
                        if (item.procspell) {
                            this.auras[item.procspell.toLowerCase()] = eval('new ' + item.procspell + '(this)');
                            proc.spell = this.auras[item.procspell.toLowerCase()];
                        }
                        this["trinketproc" + (this.trinketproc1 ? 2 : 1)] = proc;
                    }

                    this.items.push(item.id);
                    this.itemsEquipped[type] = item;
                }
            }
        }
    }
    addWeapon(item, type) {

        let ench, tempench;
        for (let item of enchant[type]) {
            if (item.temp) continue;
            if (this.testEnchType == type && this.testEnch == item.id) ench = item;
            else if (this.testEnchType != type && item.selected) ench = item;
        }
        for (let item of enchant[type]) {
            if (!item.temp) continue;
            if (this.testTempEnchType == type && this.testTempEnch == item.id) tempench = item;
            else if (this.testTempEnchType != type && item.selected) tempench = item;
        }

        if (type == "mainhand")
            this.mh = new Weapon(this, item, ench, tempench, false, false);

        if (type == "twohand")
            this.mh = new Weapon(this, item, ench, tempench, false, true);

    }
    addEnchants() {
        for (let type in enchant) {
            for (let item of enchant[type]) {
                if (item.temp) continue;
                if ((this.testEnchType == type && this.testEnch == item.id) ||
                    (this.testEnchType != type && item.selected)) {

                    for (let prop in this.base) {
                        if (prop == 'haste')
                            this.base.haste *= item.haste || 1;
                        else if (prop == 'hasterating')
                            this.base.hasterating += item.hasterating || 0;
                        else
                            this.base[prop] += item[prop] || 0;
                    }
                }
            }
        }
    }
    addTempEnchants() {
        for (let type in enchant) {
            for (let item of enchant[type]) {
                if (!item.temp) continue;
                if ((this.testTempEnchType == type && this.testTempEnch == item.id) ||
                    (this.testTempEnchType != type && item.selected)) {
                }
            }
        }
    }

    getSockets(item) {
        let MAX_GEM_SLOTS = 3;
        let base = "socket";
        let gemSlots = [];
        let i = 0;
        for (let property in item) {
            if (String(property).includes(base)) {
                if (item[base + "" + i]) {
                    gemSlots[i] = (item[base + "" + i]);
                    i++;
                }
            }
        }
        return gemSlots;
    }

    addGem() {
        /* Iterate over each equipped item by slot */
        for (let type in this.itemsEquipped) {
            let gemSlots = this.getSockets(this.itemsEquipped[type]);
            let numMetaSlots = gemSlots.includes("meta");
            let numNormalGemSlots = gemSlots.length - numMetaSlots;

            /* Get selected gems (meta, normal) */
            let normalGem;
            let metaGem;

            for (let gemType in gem) {
                {
                    if (type == gemType) {
                        for (let item of gem[gemType]) {
                            if (item.selected) {
                                if (item.meta) {
                                    metaGem = item;
                                }
                                else {
                                    normalGem = item;
                                }
                            }
                        }
                    }
                }
            }

            /* Add meta gem stats */
            if (numMetaSlots == 1 && metaGem) {
                for (let prop in this.base) {
                    this.base[prop] += metaGem[prop] || 0;
                }
            }
            /* Add normal gem stats for each normal gem slot  */
            if (normalGem) {
                for (let i = 0; i < numNormalGemSlots; i++) {
                    for (let prop in this.base) {
                        this.base[prop] += normalGem[prop] || 0;
                    }
                }
            }
        }
    }
    addSets() {
        for (let set of sets) {
            let counter = 0;
            for (let item of set.items)
                if (this.items.includes(item))
                    counter++;
            if (counter == 0)
                continue;
            for (let bonus of set.bonus) {
                if (counter >= bonus.count) {
                    for (let prop in bonus.stats)
                        this.base[prop] += bonus.stats[prop] || 0;
                    if (bonus.stats.procspell) {
                        this.attackproc = {};
                        this.attackproc.chance = bonus.stats.procchance * 100;
                        this.auras[bonus.stats.procspell.toLowerCase()] = eval('new ' + bonus.stats.procspell + '(this)');
                        this.attackproc.spell = this.auras[bonus.stats.procspell.toLowerCase()];
                    }
                    if (bonus.stats.t4rageproc) {
                        this.t4rageproc = true;
                    }
                   if (bonus.stats.t5laceratebonus) {
                        this.t5laceratebonus = true;
                    }
                }
            }
        }
    }
    addBuffs() {
        for (let buff of buffs) {
            if (buff.active) {
                this.base.sta += buff.sta || 0;
                this.base.ac += buff.ac || 0;
                this.base.ap += (buff.ap || 0);
                this.base.agi += buff.agi || 0;
                this.base.res += buff.res || 0;
                this.base.def += buff.def || 0;
                this.base.str += buff.str || 0;
                this.base.crit += buff.crit || 0;
                this.base.hit += buff.hit || 0;
                this.base.bonusac += buff.bonusac || 0;
                this.base.hitrating += buff.hitrating || 0;
                this.base.spellcrit += buff.spellcrit || 0;
                this.base.agimod *= (1 + buff.agimod / 100) || 1;
                this.base.strmod *= (1 + buff.strmod / 100) || 1;
                this.base.dmgmod *= (1 + buff.dmgmod / 100) || 1;
                this.base.stammod *= (1 + buff.stammod / 100) || 1;
                this.base.haste *= (1 + buff.haste / 100) || 1;
            }

            /* Special handling for stacks of Ferocious Inspiration */
            if (buff.id == 34460) {
                for (let i = 0; i < buff.count - 1; i++) {
                    this.base.dmgmod *= (1 + buff.dmgmod / 100) || 1;
                }
            }

            if (buff.id == 2825) {
                this.lust = buff.active;
            }
        }
    }
    addSpells() {
        for (let spell of spells) {
            if (spell.active) {
                if (spell.aura) this.auras[spell.classname.toLowerCase()] = eval(`new ${spell.classname}(this)`);
                else this.spells[spell.classname.toLowerCase()] = eval(`new ${spell.classname}(this)`);
            }
        }
    }
    reset(rage) {
        this.rage = rage;
        this.timer = 0;
        this.itemtimer = 0;
        this.spelldelay = 0;
        this.heroicdelay = 0;
        this.mh.timer = 0;
        this.extraattacks = 0;
        this.batchedextras = 0;
        this.nextswinghs = false;
        this.nextswingcl = false;
        for (let s in this.spells) {
            this.spells[s].timer = 0;
            this.spells[s].stacks = 0;
        }
        for (let s in this.auras) {
            this.auras[s].timer = 0;
            this.auras[s].firstuse = true;
            this.auras[s].stacks = 0;
        }
        if (this.auras.laceratedot) {
            this.auras.laceratedot.idmg = 0;
        }
        this.ooc.reset();
        this.update();
    }
    update() { 
        this.updateAuras();
        this.updateArmorReduction();
        this.mh.glanceChance = this.getGlanceChance();
        this.mh.miss = this.getMissChance(this.mh);
        this.mh.dodge = this.getDodgeChance(this.mh);
        this.mh.parry = this.getParryChance(this.mh);
        this.updateIncAttackTable();
    }
    updateIncAttackTable() {
        // Incoming attack table constant setup
        // Agi dodge + dodge rating + def rating
        this.stats.incdodge = this.stats.agi / 14.7059 + this.stats.incdodgerating / 18.9231 + this.stats.def * .04; 
        if (this.race == 'Night Elf') this.stats.incdodge += 1;
   `  `   // 4.4 base miss + miss from defense rating
        this.stats.incmiss = 4.4 + this.stats.def * .04;
        this.stats.inccrit = Math.max(0, 5.6 - this.talents.survivalofthefittest - this.stats.def * .04 - this.stats.res * 0.025381);
        this.stats.inccrush = 15;

        // if (log) {
        //     this.log(`\nUpdated incoming attack table: \nDodge = ${this.stats.incdodge}\nMiss = ${this.stats.incmiss}\nCrit`
        //         +` =  ${this.stats.inccrit} \nCrush = ${this.stats.inccrush}`);
        // }
    }

    updateAuras() {
        for (let prop in this.base)
            this.stats[prop] = this.base[prop];
        for (let name in this.auras) {
            if (this.auras[name].active) {
                for (let prop in this.auras[name].stats)
                    this.stats[prop] += this.auras[name].stats[prop];
                for (let prop in this.auras[name].mult_stats)
                    this.stats[prop] *= (1 + this.auras[name].mult_stats[prop] / 100);
            }
        }
        this.stats.dmgmod *= 1 + this.talents.naturalistmod;
        this.stats.threatmod *= 1 + (0.3 + this.talents.feralinstinctmod); // Dire bear form threat = 1.3x + .15 from feral instincts
        this.stats.strmod *= (1 + this.talents.survivalofthefittest * .01);
        this.stats.agimod *= (1 + this.talents.survivalofthefittest * .01);   
        this.stats.stammod *= 1 + this.talents.survivalofthefittest * .01;
        this.stats.stammod *= 1 + this.talents.heartofthewild * .04;
        this.stats.critdamagemod = 2 * (1 + this.stats.critbonusmod) * (1 + this.talents.predatoryinstincts * .02);

        this.stats.str = ~~(this.stats.str * this.stats.strmod);
        this.stats.agi = ~~(this.stats.agi * this.stats.agimod);
        this.stats.sta = ~~(this.stats.sta * this.stats.stammod);
        this.stats.ap += this.stats.str * 2 + this.talents.predatorystrikes / 2.0 * 70 + this.base.aprace;
        this.stats.crit += this.stats.agi / 25;
        this.crit = this.getCritChance();
        this.stats.armormod *= this.talents.thickhidemod;
        this.updateArmor();
        this.stats.def = Math.floor(this.stats.def / 2.3654); // Adjust defense skill for defense rating
        this.stats.haste = this.base.haste + this.base.hasterating / 15.8 / 100; 
    }
    updateStrength() {
        this.stats.str = this.base.str;
        this.stats.ap = this.base.ap;
        
        for (let name in this.auras) {
            if (this.auras[name].timer) {
                if (this.auras[name].stats.str)
                    this.stats.str += this.auras[name].stats.str;
                if (this.auras[name].stats.ap)
                    this.stats.ap += this.auras[name].stats.ap;
            }
        }
        this.stats.str = ~~(this.stats.str * this.stats.strmod);
        this.stats.ap += this.stats.str * 2 + this.talents.predatorystrikes / 2.0 * 70 + this.base.aprace;
    }
    updateAP() {
        if (log)  
        {
            this.log(`Updating AP... before, Crit = ${this.crit}, AP = ${this.stats.ap}`);
        }
        this.stats.ap = this.base.ap;
        for (let name in this.auras) {
            if (this.auras[name].active && this.auras[name].stats.ap)
                this.stats.ap += this.auras[name].stats.ap;
        }
        this.stats.ap += this.stats.str * 2 + this.talents.predatorystrikes / 2.0 * 70 + this.base.aprace;
        if (log)  
        {
            this.log(`Updating AP... after, Crit = ${this.crit}, AP = ${this.stats.ap}`);
        }

    }

    updateArmor() {
        /* Initial armor setup with multiplier */
        this.stats.ac = (this.base.ac) * (this.stats.armormod);

        /* Calculate agi/buffs armor after armor mod */
        this.stats.ac += this.stats.agi * 2;
        for (let name in this.auras) {
            if (this.auras[name].timer && this.auras[name].stats.ac)
                this.stats.ac += this.auras[name].stats.ac;
        }
        this.stats.ac += this.base.bonusac;
    }

    updateHaste() {
        this.stats.haste = this.base.haste;
        this.stats.hasterating = this.base.hasterating;

        /* Apply additive haste */
        if (this.auras.pummeler && this.auras.pummeler.active)
            this.stats.hasterating += this.auras.pummeler.mult_stats.rating;
        if (this.auras.spider && this.auras.spider.active)
            this.stats.hasterating += this.auras.spider.mult_stats.rating;
        if (this.auras.abacus && this.auras.abacus.active)
            this.stats.hasterating += this.auras.abacus.mult_stats.rating;
        if (this.auras.dst && this.auras.dst.active)
            this.stats.hasterating += this.auras.dst.mult_stats.rating;

        /* Apply multiplicative haste */
        this.stats.haste += this.stats.hasterating / 15.8 / 100;
        if (this.auras.bloodlust && this.auras.bloodlust.active)
            this.stats.haste *= 1.3;
    }
    updateBonusDmg() {
        let bonus = 0;
        if (this.auras.zeal && this.auras.zeal.timer)
            bonus += this.auras.zeal.stats.bonusdmg;
        if (this.auras.zandalarian && this.auras.zandalarian.timer)
            bonus += this.auras.zandalarian.stats.bonusdmg;
        this.mh.bonusdmg = this.mh.basebonusdmg + bonus;
    }
    updateArmorReduction() {
        this.target.armor = this.target.basearmor;
        if (this.auras.annihilator && this.auras.annihilator.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.annihilator.stacks * this.auras.annihilator.armor), 0);
        if (this.auras.rivenspike && this.auras.rivenspike.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.rivenspike.stacks * this.auras.rivenspike.armor), 0);
        if (this.auras.bonereaver && this.auras.bonereaver.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.bonereaver.stacks * this.auras.bonereaver.armor), 0);
        if (this.auras.swarmguard && this.auras.swarmguard.timer)
            this.target.armor = Math.max(this.target.armor - (this.auras.swarmguard.stacks * this.auras.swarmguard.armor), 0);
        this.armorReduction = this.getArmorReduction(this.target.armor, this.target.level);
    }
    updateDmgMod() {
        this.stats.dmgmod = this.base.dmgmod;
        for (let name in this.auras) {
            if (this.auras[name].timer && this.auras[name].mult_stats.dmgmod)
                this.stats.dmgmod *= (1 + this.auras[name].mult_stats.dmgmod / 100);
        }
        this.stats.dmgmod *= this.talents.naturalistmod;
    }
    getGlanceReduction(weapon) {
        let diff = this.target.defense - this.stats.skill;
        let low = Math.min(1.4 - 0.05 * diff, 0.91);
        let high = Math.min(1.3 - 0.03 * diff, 0.99);
        if (this.weaponrng) return Math.random() * (high - low) + low;
        else return avg(low, high);
    }
    getGlanceChance() {
        return 25;
    }
    getMissChance(weapon) {
        let diff = this.target.defense - this.stats.skill;
        let miss = 5 + (diff > 10 ? diff * 0.2 : diff * 0.1);
        let missChance = Math.max(miss - this.stats.hit - this.stats.hitrating / 15.77 + 1, 0);
        return missChance;
    }

    getCritChance() {
        let crit = this.stats.crit + (this.stats.critrating / 22.1) + (this.talents.sharpenedclawsmod || 0) + 
        this.talents.abilitiescrit + // LOTP
        (this.level - this.target.level) * 1 + // Level-based crit suppression
        (this.level - this.target.level) * 0.6; // Boss-based crit suppression
        return Math.max(crit, 0);
    }
    getDodgeChance(weapon) {
        return Math.max((5 + (this.target.defense - this.stats.skill) * 0.1) - this.stats.exp / 15.77, 0);
    }

    getParryChance(weapon) {
        if (!this.activetank) {
            return 0;
        }
        else {
            return Math.max(14 - this.stats.exp / 15.77, 0);
        }
    }

    getArmorReduction(armor, attackerlevel) {
        let r = armor / (armor + 400 + 85 * ((5.5 * attackerlevel) - 265.5))
        return r > 0.75 ? 0.75 : r;
    }

    getEHP() {
        // EHP = HP / (armor * weighted attack table)
        let ehp = (this.stats.sta * 10) / (1 - this.getArmorReduction(this.stats.ac, 73)) 
            / (1 - this.stats.incdodge / 100 - this.stats.incmiss / 100 + this.stats.inccrush * 1.5 / 100 + this.stats.inccrit * 2 / 100);
        return ehp;
    }

    addRage(dmg, result, weapon, spell) {
        let rageAdded;
        let factor;
        if (spell) {
            if (result == RESULT.MISS || result == RESULT.DODGE || result == RESULT.PARRY) {
                rageAdded = spell.refund ? spell.cost * 0.8 : 0;
                if (!spell.oocspell) {
                    this.rage += rageAdded;
                }
                else {
                    rageAdded = 0;
                    this.ooc.finishOOCUse(spell);
                }
                if (this.enableLogging) {
                    let logText = (result == RESULT.MISS) ? `missed. ` : (result == RESULT.DODGE) ? `was dodged. ` : `was parried. `;
                    logText += `Refunded ${rageAdded} rage`;
                    this.log(`Cast ${spell.name}, attack ${logText}. At ${parseFloat(this.rage).toFixed(2)} rage.`);
                }
            }
            else {
                rageAdded = 0;

                let critText = "";
                if (result == RESULT.CRIT) critText = " (crit)";
                if (log) this.log(`Cast ${spell.name} for ${dmg}${critText}. At ${parseFloat(this.rage).toFixed(2)} rage.`);
            }
            this.ooc.finishOOCUse(spell);
        }
        else {
            /* 100% "pity" rage gain on dodge / parry */
            if (result == RESULT.DODGE || result == RESULT.PARRY) {
                factor = 3.5;
                let pityDamage = weapon.avgdmg();
                rageAdded = ((pityDamage / 274.7) * 7.5 + weapon.swingspeed * factor) / 2;

                /* Log the pity rage received if requested */
                let logText = (result == RESULT.MISS) ? `missed. ` : (result == RESULT.DODGE) ? `was dodged` : `was parried`;
                if (this.enableLogging) this.log(`White attack ${logText}. Pity damage: ${pityDamage}, added ${rageAdded} rage. At ${parseFloat(this.rage).toFixed(2)} rage.`);
            }
            /* Normal white swing rage gain formula */
            else if (result != RESULT.MISS) {

                factor = result == RESULT.CRIT ? 7.0 : 3.5;
                rageAdded = (dmg / 274.7 * 7.5 + weapon.swingspeed * factor) / 2;

                /* Log the white swing damage if requested */
                let critText = "";
                if (result == RESULT.CRIT) critText = " (crit)";
                if (this.enableLogging) this.log(`White swung for ${dmg}${critText}, added ${rageAdded} rage. At ${parseFloat(this.rage).toFixed(2)} rage.`);
            }
            /* No rage gained on miss */
            else {
                rageAdded = 0;
            }
            this.rage += rageAdded;
        }
        if (this.rage > 100) this.rage = 100;
    }
    addDamageTakenRage(dmg) {
        let rageAdded = dmg / 274.7 * 2.5; 
        this.rage += rageAdded;
        if (this.rage > 100) this.rage = 100;
        if (this.enableLogging)  
        {
            this.log(`Received swing for ${dmg.toFixed(2)}, added ${rageAdded.toFixed(2)} rage. At ${parseFloat(this.rage).toFixed(2)} rage.`);
        }
    }
    steptimer(a) {
        if (this.timer <= a) {
            this.timer = 0;
            //if (log) this.log('Global CD off');
            return true;
        }
        else {
            this.timer -= a;
            return false;
        }
    }
    stepitemtimer(a) {
        if (this.itemtimer <= a) {
            this.itemtimer = 0;
            if (this.enableLogging) this.log('Item CD off');
            return true;
        }
        else {
            this.itemtimer -= a;
            return false;
        }
    }

    stepauras() {

        if (this.auras.slayer && this.auras.slayer.firstuse && this.auras.slayer.timer) this.auras.slayer.step();
        if (this.auras.spider && this.auras.spider.firstuse && this.auras.spider.timer) this.auras.spider.step();
        if (this.auras.bloodlustbrooch && this.auras.bloodlustbrooch.firstuse && this.auras.bloodlustbrooch.timer) this.auras.bloodlustbrooch.step();
        if (this.auras.pummeler && this.auras.pummeler.firstuse && this.auras.pummeler.timer) this.auras.pummeler.step();
        if (this.auras.abacus && this.auras.abacus.firstuse && this.auras.abacus.timer) this.auras.abacus.step();
        if (this.auras.swarmguard && this.auras.swarmguard.firstuse && this.auras.swarmguard.timer) this.auras.swarmguard.step();
        if (this.auras.dst && this.auras.dst.firstuse && this.auras.dst.timer) this.auras.dst.step();
        if (this.auras.hourglass && this.auras.hourglass.firstuse && this.auras.hourglass.timer) this.auras.hourglass.step();
        if (this.auras.tsunami && this.auras.tsunami.firstuse && this.auras.tsunami.timer) this.auras.tsunami.step();
        if (this.auras.bloodlust && this.auras.bloodlust && this.auras.bloodlust.timer) this.auras.bloodlust.step();

        if (this.auras.laceratedot && this.auras.laceratedot.timer) this.auras.laceratedot.step();
    }
    endauras() {

        if (this.auras.slayer && this.auras.slayer.firstuse && this.auras.slayer.timer) this.auras.slayer.end();
        if (this.auras.spider && this.auras.spider.firstuse && this.auras.spider.timer) this.auras.spider.end();
        if (this.auras.bloodlustbrooch && this.auras.bloodlustbrooch.firstuse && this.auras.bloodlustbrooch.timer) this.auras.bloodlustbrooch.end();
        if (this.auras.abacus && this.auras.abacus.firstuse && this.auras.abacus.timer) this.auras.abacus.end();
        if (this.auras.pummeler && this.auras.pummeler.firstuse && this.auras.pummeler.timer) this.auras.pummeler.end();
        if (this.auras.swarmguard && this.auras.swarmguard.firstuse && this.auras.swarmguard.timer) this.auras.swarmguard.end();
        if (this.auras.dst && this.auras.dst.firstuse && this.auras.dst.timer) this.auras.dst.end();
        if (this.auras.hourglass && this.auras.hourglass.firstuse && this.auras.hourglass.timer) this.auras.hourglass.end();
        if (this.auras.tsunami && this.auras.tsunami.firstuse && this.auras.tsunami.timer) this.auras.tsunami.end();
        if (this.auras.bloodlust && this.auras.bloodlust.timer) this.auras.bloodlust.end();

        if (this.auras.laceratedot && this.auras.laceratedot.timer) this.auras.laceratedot.end();

    }
    rollweapon(weapon) {
        let tmp = 0;
        let roll = rng10k();
        tmp += Math.max(weapon.miss, 0) * 100;
        if (roll < tmp) return RESULT.MISS;
        tmp += weapon.parry * 100;
        if (roll < tmp) return RESULT.PARRY;
        tmp += weapon.dodge * 100;
        if (roll < tmp) return RESULT.DODGE;
        tmp += weapon.glanceChance * 100;
        if (roll < tmp) return RESULT.GLANCE;
        tmp += (this.crit + weapon.crit) * 100;
        if (roll < tmp) return RESULT.CRIT;
        return RESULT.HIT;
    }
    rollattacktaken() {
        let tmp = 0;
        let roll = rng10k();
        tmp += (4.4 + this.stats.def * 0.04) * 100;
        if (roll < tmp) return RESULT.MISS;
        tmp += (3.19 + this.stats.incdodge) * 100
        if (roll < tmp) return RESULT.DODGE;
        tmp += 15.0 * 100;
        if (roll < tmp) return RESULT.CRUSH;
        tmp += this.stats.inccrit;
        if (roll < tmp) return RESULT.CRIT;
        return RESULT.HIT;
    }
    rollspell(spell) {
        let tmp = 0;
        let roll = rng10k();
        tmp += Math.max(this.mh.miss, 0) * 100;
        if (roll < tmp) return RESULT.MISS;
        tmp += this.mh.parry * 100;
        if (roll < tmp) return RESULT.PARRY;
        tmp += this.mh.dodge * 100;
        if (roll < tmp) return RESULT.DODGE;
        if (!spell.weaponspell) {
            roll = rng10k();
            tmp = 0;
        }
        else {
            /* If a weapon-based spell is blocked, it can't crit */
            tmp += 5 * 100;
            if (roll < tmp) {
                return RESULT.BLOCK;
            }
            /* Otherwise, if not blocked, re-roll for crit like other attacks */
            else {
                roll = rng10k();
                tmp = 0;
            }
        }
        let crit = this.crit + this.mh.crit;
        tmp += crit * 100;
        if (roll < tmp && !spell.nocrit) return RESULT.CRIT;
        return RESULT.HIT;
    }
    attackmh(weapon, damage_threat_arr, step) {
        this.stepauras();

        let spell = null;
        let procdmg = 0;
        let result;

        if (this.nextswinghs) {
            this.nextswinghs = false;
            if (this.spells.maul && this.spells.maul.cost <= this.rage) {
                result = this.rollspell(this.spells.maul);
                spell = this.spells.maul;
                if (this.ooc.isActive() == false) {
                    this.rage -= spell.cost;
                }
                else {
                    this.ooc.consumeOOC(spell);
                }
            }
            else {
                result = this.rollweapon(weapon);
            }
        }
        else {
            result = this.rollweapon(weapon);
        }

        this.ooc.rollOOC(step, spell);

        let dmg = weapon.dmg(spell);
        procdmg = this.procattack(spell, weapon, result);

        if (result == RESULT.GLANCE) {
            dmg *= this.getGlanceReduction(weapon);
        }
        else if (result == RESULT.BLOCK) {
            dmg = Math.max(dmg - 54, 0);
        }
        else if (result == RESULT.CRIT) {
            dmg *= this.stats.critdamagemod;
            this.proccrit();
        }

        weapon.use();
        let done = this.dealdamage(dmg, result, weapon, spell);
        let threat = this.attackmhthreat(done, result, weapon, spell);
        
        if (spell) {
            spell.totaldmg += done;
            spell.totalthreat += threat;
            spell.data[result]++;
        }
        else {
            weapon.totaldmg += done;
            weapon.totalthreat += threat;
            weapon.data[result]++;
        }
        weapon.totalprocdmg += procdmg;
        //if (log) this.log(`${spell ? spell.name + ' for' : 'Main hand attack for'} ${done + procdmg} (${Object.keys(RESULT)[result]})`);
        damage_threat_arr[0] = done + procdmg;
        damage_threat_arr[1] = threat;
        return damage_threat_arr;
    }

    attackmhthreat(damage, result, weapon, spell) {
        let threat = 0;
        if (spell) {
            threat = this.dealthreat(damage, result, spell);
        }
        else if (result != RESULT.MISS && result != RESULT.DODGE && result != RESULT.PARRY) {
            threat = damage * this.stats.threatmod;
        }
        return threat;
    }

    takeattack() {
        this.incswingtimer = this.base.incswingtimer;
        let result = this.rollattacktaken();
        let dmg = this.incswingdamage;
        if (result == RESULT.HIT) {
            dmg *= 1.0;
            if (this.enableLogging) this.log(`Boss hit for ${dmg}`);
        }
        else if (result == RESULT.CRIT) {
            dmg *= 2.0;
            if (this.enableLogging) this.log(`Boss crit for ${dmg}`);
        }
        else if (result == RESULT.CRUSH) {
            dmg *= 1.5;
            if (this.enableLogging) this.log(`Boss crushed for ${dmg}`);
        }
        else {
            dmg = 0.0;
            if (this.enableLogging) this.log("Boss swing missed");
            return 0;
        }
        dmg = dmg * (1 - this.stats.ac / (this.stats.ac + (467.5 * 73 - 22167.5)));
        this.addDamageTakenRage(dmg);
        return dmg;
    }

    cast(spell, damage_threat_arr, step) {
        this.stepauras();
        spell.use(step);
        if (spell.useonly) { 
            //if (log) this.log(`${spell.name} used`);
            damage_threat_arr[0] = 0;
            damage_threat_arr[1] = 1;
            return damage_threat_arr; 
        }
        let procdmg = 0;
        let dmg = spell.dmg();
        let result = this.rollspell(spell);
        procdmg = this.procattack(spell, this.mh, result);

        if (result == RESULT.CRIT) {
            dmg *= this.stats.critdamagemod;
            this.proccrit();
        }
        else if (result == RESULT.BLOCK) {
            dmg -= 54;
        }

        let done = this.dealdamage(dmg, result, this.mh, spell);
        let threat = this.dealthreat(done, result, spell);

        /* Manually override FF results with new roll */
        if (spell && (spell.name != 'Faerie Fire')) {
            spell.data[result]++;
        }
        else {
            let roll = rng10k();
            if (rng10k() < 1700) {
                result = RESULT.MISS;
                threat = 0;
            }
            else {
                result = RESULT.HIT;
            }
            spell.data[result]++;
        }

        spell.totaldmg += done;
        spell.totalthreat += threat;
        this.mh.totalprocdmg += procdmg;
        //if (log) this.log(`${spell.name} for ${done + procdmg} (${Object.keys(RESULT)[result]}).`);
        damage_threat_arr[0] = done;
        damage_threat_arr[1] = threat;
        return damage_threat_arr;
    }
    dealdamage(dmg, result, weapon, spell) {
        if (spell && (spell.name) == 'Faerie Fire') {
            return 0;
        }
        else if (result != RESULT.MISS && result != RESULT.DODGE && result != RESULT.PARRY) {
            dmg *= this.stats.dmgmod;
            dmg *= (1 - this.armorReduction);
            this.addRage(dmg, result, weapon, spell);

            /* If landing a lacerate, also apply the bleed */
            if (spell && spell.name == 'Lacerate') {
                this.auras.laceratedot.use();
            }

            return ~~dmg;
        }
        else {
            this.addRage(null, result, weapon, spell);
            return 0;
        }
    }

    dealthreat(dmg, result, spell) {
        let threat = 0;
        if (spell && spell.name == 'Faerie Fire') {
            threat = 131 * this.stats.threatmod;
        }
        else if (result != RESULT.MISS && result != RESULT.DODGE && result != RESULT.PARRY) {
            if (spell.name == 'Mangle') {
                threat = dmg * this.stats.threatmod * 1.3;
            }
            else if (spell.name == 'Swipe') {
                threat = dmg * this.stats.threatmod;
            }
            else if (spell.name == 'Lacerate') {
                threat = (dmg * 0.5 + 267) * this.stats.threatmod;
            }
            else if (spell.name == 'Maul') {
                threat = (dmg + 344) * this.stats.threatmod;
            }
            else if (spell.name == 'Lacerate DOT') {
                threat = dmg * 0.5 * this.stats.threatmod;
            }
            else {
                this.log(`Unknown spell for threat -- =  + ${spell.name}`);
            }
        }
        return threat;
    }

    proccrit() {
        if (this.talents.primalfury / 2.0 + 1 > rng10k() / 10000.0 + 1) {
            this.rage += 5.0;
            if (this.enableLogging) this.log(`Primal Fury Proc, +5 rage`);
        } 
    }
    procattack(spell, weapon, result) {
        let procdmg = 0;
        if (result != RESULT.MISS && result != RESULT.DODGE && result != RESULT.PARRY) {
            if (this.t4rageproc && rng10k() < 1000) {
                if (log) this.log(`T4 Bloodlust Proc, +10 rage`);
                this.rage += 10.0;
            }
            // If trinket 1 has a proc and the proc doesn't require a crit or the result is a crit, roll for a proc
            if (this.trinketproc1 && (!this.trinketproc1.spell.requirescrit || result == RESULT.CRIT) && rng10k() < this.trinketproc1.chance) {
                //if (log) this.log(`Trinket 1 proc`);
                if (this.trinketproc1.extra)
                    this.batchedextras += this.trinketproc1.extra;
                if (this.trinketproc1.magicdmg) procdmg += this.magicproc(this.trinketproc1);
                if (this.trinketproc1.spell && this.trinketproc1.spell.canUse()) this.trinketproc1.spell.use();
            }
            // If trinket 2 has a proc and the proc doesn't require a crit or the result is a crit, roll for a proc
            if (this.trinketproc2 && (!this.trinketproc2.spell.requirescrit || result == RESULT.CRIT) && rng10k() < this.trinketproc2.chance) {
                //if (log) this.log(`Trinket 2 proc`);
                if (this.trinketproc2.extra)
                    this.batchedextras += this.trinketproc2.extra;
                if (this.trinketproc2.magicdmg) procdmg += this.magicproc(this.trinketproc2);
                if (this.trinketproc2.spell && this.trinketproc2.spell.canUse()) this.trinketproc2.spell.use();
            }
            if (this.attackproc && rng10k() < this.attackproc.chance) {
                if (this.attackproc.magicdmg) procdmg += this.magicproc(this.attackproc);
                if (this.attackproc.spell) this.attackproc.spell.use();
                //if (log) this.log(`Misc proc`);
            }

            if (this.auras.swarmguard && this.auras.swarmguard.timer && rng10k() < this.auras.swarmguard.chance) {
                this.auras.swarmguard.proc();
            }

            if (this.dragonbreath && rng10k() < 400) {
                procdmg += this.magicproc({ magicdmg: 60, coeff: 1 });
            }
        }

        return procdmg;
    }
    magicproc(proc) {
        let mod = 1;
        let miss = 1700;
        let dmg = proc.magicdmg;
        //if (proc.gcd && this.timer && this.timer < 1500) return 0;
        if (proc.binaryspell) miss = this.target.binaryresist;
        else mod *= 24;
        if (rng10k() < miss) return 0;
        if (rng10k() < (this.stats.spellcrit * 100)) mod *= 1.5;
        if (proc.coeff) dmg += this.spelldamage * proc.coeff;
        return ~~(dmg * mod);
    }
    physproc(dmg) {
        let tmp = 0;
        let roll = rng10k();
        tmp += Math.max(this.mh.miss, 0) * 100;
        if (roll < tmp) dmg = 0;
        tmp += this.mh.dodge * 100;
        if (roll < tmp) { dmg = 0; }
        roll = rng10k();
        let crit = this.crit + this.mh.crit;
        if (roll < (crit * 100)) dmg *= 2;
        return dmg * this.stats.dmgmod;
    }
    serializeStats() {
        return {
            auras: this.auras,
            spells: this.spells,
            mh: this.mh,
        };
    }
    log(msg) {
        if (this.enableLogging) {
            console.log(`${step.toString().padStart(5,' ')} | ${this.rage.toFixed(2).padStart(6,' ')} | ${msg}`);
        }
    }
}
