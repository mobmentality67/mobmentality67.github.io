class Player {

    HASTE_RATING_COEFFICIENT = 1/(10*82/52);
    HIT_RATING_COEFFICIENT = 1/(10*82/52);
    EXP_RATING_COEFFICIENT = 1 / 3.9423;
    CRIT_RATING_COEFFICIENT = 1/(14*82/52);
    DODGE_RATING_COEFFICIENT =  1/(12*82/52);
    BOSS_AP = 1930;
    BOSS_ATTACK_COEFFICIENT = 1/2250;

    static getConfig(base) {
        return {
            race: $('select[name="race"]').val(),
            weaponrng: $('select[name="weaponrng"]').val() == "Yes",
            spelldamage: parseInt($('input[name="spelldamage"]').val()),
            target: {
                level: 73,
                basearmor: parseInt($('input[name="targetbasearmor"]').val()),
                armor: parseInt($('input[name="targetbasearmor"]').val()),
                defense: 73 * 5,
                binaryresist: parseInt(10000 - (8300 * (1 - (parseInt($('input[name="targetresistance"]').val()) * 0.15 / 60)))),
            },
            activetank: $('select[name="activetank"]').val() == "Yes",
            bosscrush: $('select[name="bosscrush"]').val() == "Yes",
            bossparryhaste: $('select[name="bossparryhaste"]').val() == "Yes",
            bossdw: $('select[name="bossdw"]').val() == "Yes",
            incswingdamage: parseFloat($('input[name="incswingdamage"]').val()),
            incswingtimer: parseFloat($('input[name="incswingtimer"]').val()),
            inchpslifebloom: parseFloat($('input[name="inchpslifebloom"]').val()),
            incheal: parseFloat($('input[name="incheal"]').val()),
            defensivethreshold: parseFloat($('input[name="defensivethreshold"]').val()),
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
        this.bosscrush = config.bosscrush;
        this.bossparryhaste = config.bossparryhaste;
        this.bossdw = config.bossdw;
        this.incswingdamage = config.incswingdamage;
        this.incswingtimer = config.incswingtimer * 1000;
        this.inchpslifebloom = config.inchpslifebloom;
        this.incheal = config.incheal;
        this.ooc = false;
        this.enableLogging = false;
        this.activemetagem = "";
        this.t4rageproc = false;
        this.t5laceratebonus = false;
        this.drums = 0;
        this.currenthp = 0;
        this.lastlifebloomtick = 0;
        this.bighealtick = 0;
        this.defensivethreshold = config.defensivethreshold;
        this.defensivehpthreshold = 0;
        this.defensivesave = false;
        this.stunned = false;
        this.stuns = [];
        this.laststunend = 0;
        this.base = {
            sta: 0,
            ac: 0,
            def: 0,
            res: 0,
            ap: 210,
            agi: 0,
            str: 0,
            bonusac: 0,
            bonusdmg: 0,
            bonushp: 0,
            incdodge: 0,
            incdodgerating: 0,
            incswingtimer: config.incswingtimer * 1000,
            incswingspeed: config.incswingtimer * 1000,
            incswingdamage: config.incswingdamage,
            inchpslifebloom: config.inchpslifebloom,
            incheal: config.incheal,
            defensivethreshold: config.defensivethreshold,
            bossattackmod: 1.0,
            bossapmod: 320,
            bossattackspeedmod: 1.0,
            incmiss: 4.4,
            hit: 0,
            hitrating: 0,
            crit: 0,
            critrating: 0,
            critbonusmod: 0,
            spellcrit: 4.5,
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
            apmod: 1,
            arpen: 0
        };

        this.updateTimes = [
            [610,  1000], // FF at 1s
            [800,  1000], // CoR at 1s
            [520,  1000], // First sunder at 1.0s
            [520,  2500], // Second sunder at 2.5s
            [520,  4000], // Third sunder at 4.0s
            [520,  5500], // Fourth sunder at 5.5s
            [520,  7000], // Fifth sunder at 7.0s
        ];
        this.debuffarmor = 0;

        this.damageTakenData = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        this.runningtimereduction = 0;

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
        this.addBossSpells();
        this.ooc = new OmenOfClarity(this, this.talents.ooc);


        /* Create non-proc based trinkets */
        this.auras.laceratedot = new LacerateDOT(this);
        if (this.items.includes(9449)) this.auras.pummeler = new Pummeler(this);
        if (this.items.includes(23041)) this.auras.slayer = new Slayer(this);
        if (this.items.includes(22954)) this.auras.spider = new Spider(this);
        if (this.items.includes(29383)) this.auras.bloodlustbrooch = new BloodlustBrooch(this);
        if (this.items.includes(38287)) this.auras.direbrew = new Direbrew(this);
        if (this.items.includes(25937)) this.auras.tablet = new Tablet(this);
        if (this.items.includes(33831)) this.auras.berserkers = new Berserkers(this);
        if (this.items.includes(28121)) this.auras.icon = new Icon(this);
        if (this.items.includes(28288)) this.auras.abacus = new Abacus(this);
        if (this.items.includes(32257)) this.auras.mangleapbuff = new MangleAPBuff(this);
        if (this.items.includes(33509)) this.auras.primalinstinct = new PrimalInstinct(this);
        if (this.items.includes(32501)) this.auras.protectorsvigor = new ProtectorsVigor(this);
        if (this.items.includes(34576)) this.auras.tremendousfortitude = new TremendousFortitude(this);
        if (this.items.includes(34578)) this.auras.tremendousfortitude = new TremendousFortitude(this);
        if (this.items.includes(32658)) this.auras.tenacitydefensive = new TenacityDefensive(this);
        if (this.items.includes(326580000)) this.auras.tenacity = new Tenacity(this);
        if (this.items.includes(28528)) this.auras.timesfavor = new TimesFavor(this);
        if (this.items.includes(34473)) this.auras.evasivemaneuvers = new EvasiveManeuvers(this); 
        if (this.lust) this.auras.bloodlust = new Bloodlust(this);
        if (this.hastepot) this.auras.hastepot = new HastePotion(this);
        if (this.drums) this.auras.drums = new Drums(this);
        this.update();
        this.currenthp = this.stats.maxhp;
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
                this.base.crit += race.crit;
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

    setupTrinket(trinket) {
        /* Setup trinket proc chance, PPM */
        if (trinket.procspell) {
            let proc = {};
            proc.extra = trinket.procextra;
            proc.magicdmg = trinket.magicdmg;
            if (trinket.procspell) {
                let newSpell = eval('new ' + trinket.procspell + '(this)');
                this.auras[trinket.procspell.toLowerCase()] = newSpell;
                proc.spell = newSpell;
            }
            this["trinketproc" + (this.trinketproc1 ? 2 : 1)] = proc;
        }
    }

    setupRing(ring) {
        /* Setup trinket proc chance, PPM */
        if (ring.procspell) {
            let proc = {};
            proc.extra = ring.procextra;
            proc.magicdmg = ring.magicdmg;
            if (ring.procspell) {
                let newSpell = eval('new ' + ring.procspell + '(this)');
                this.auras[ring.procspell.toLowerCase()] = newSpell;
                proc.spell = newSpell;
            }
            this["ringproc" + (this.ringproc1 ? 2 : 1)] = proc;
        }
    }

    setupIdol(idol) {
        /* Setup trinket proc chance, PPM */
        if (idol.procspell) {
            let proc = {};
            if (idol.procspell) {
                let newSpell = eval('new ' + idol.procspell + '(this)');
                this.auras[idol.procspell.toLowerCase()] = newSpell;
                proc.spell = newSpell;
            }
            this["idolproc"] = proc;
        }
    }

    addGear() {
        let trinket1;
        let trinket2;
        let ring1;
        let ring2;
        let idol;

        for (let type in gear) {
            for (let item of gear[type]) {
                if ((this.testItemType == type && this.testItem == item.id) ||
                    (this.testItemType != type && item.selected)) {
                    for (let prop in this.base)
                        this.base[prop] += item[prop] || 0;

                    if (type == "mainhand" || type == "offhand" || type == "twohand")
                        this.addWeapon(item, type);
                    else if (type == "trinket1") {
                        trinket1 = item;
                    }
                    else if (type == "trinket2") {
                        trinket2 = item;
                    }
                    else if (type == "finger1") {
                        ring1 = item;
                    }
                    else if (type == "finger2") {
                        ring2 = item;
                    }
                    else if (type == "ranged") {
                        idol = item;
                    }

                    this.items.push(item.id);
                    this.itemsEquipped[type] = item;
                }
            }
        }

        /* Setup trinket procs, if necessary. Deferred to end to avoid adding a dependency
        on weapons being setup before trinkets (for PPM) */
        if (trinket1) this.setupTrinket(trinket1);
        if (trinket2) this.setupTrinket(trinket2);
        if (ring1) this.setupRing(ring1);
        if (ring2) this.setupRing(ring2);
        if (idol) this.setupIdol(idol);
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
                    for (let prop in this.base) {
                        this.base[prop] += item[prop] || 0;
                    }
                }
            }
        }
    }

    getSockets(item) {
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

    getMetaReq(gem, colors) {

        var reqColors = {
                yellow: 0,
                red: 0,
                blue: 0,
            }

        /* If it's a meta gem, hard-coded requirements for now */
        if (gem && gem.name == 'Relentless Earthstorm Diamond') {
            reqColors.yellow = 2; reqColors.red = 2; reqColors.blue = 2;
        }
        else if (gem && gem.name == 'Powerful Earthstorm Diamond') {
            reqColors.blue = 3;
        }  
        else {
            return false; // Error case
        }

        for (let color in reqColors) {
            if (reqColors[color] > colors[color]) return false;
        }

        return true;

    }


    isYellowGem(color) {
        return color == 'yellow' || color == 'orange' || color == 'green';
    }

    isRedGem(color) {
        return color == 'red' || color == 'orange' || color == 'purple'; 
    }

    isBlueGem(color) {
        return (color == 'blue' || color == 'purple' || color =='green');
    }

    gemColorMatches(itemColors, gem, gemIndex) {
        return (this.isYellowGem(itemColors[gemIndex]) && this.isYellowGem(gem.color)) ||
            (this.isBlueGem(itemColors[gemIndex]) && this.isBlueGem(gem.color)) ||
            (this.isRedGem(itemColors[gemIndex]) && this.isRedGem(gem.color));
    }

    countGem(colors, gem) {
        if (this.isYellowGem(gem.color)) colors['yellow']++;
        if (this.isRedGem(gem.color)) colors['red']++;
        if (this.isBlueGem(gem.color)) colors['blue']++;
    }

    getSocketBonus(item) {
        let socketBonus;
        for (let prop in item) {
            if (prop.includes("socketbonus")) {
                socketBonus = prop; break;
            }
        }
        return socketBonus;
    }

    addGem() {
        let metaGem;
        var gemColors = {
            yellow: 0,
            red: 0,
            blue: 0,
        }

        /* Iterate over each equipped item by slot */
        for (let type in this.itemsEquipped) {
            let gemSlotColors = this.getSockets(this.itemsEquipped[type]);
            let metaGemIndex = gemSlotColors.indexOf('meta');
            let metaGemIndexOffset = 0;
            let numMetaSlots = gemSlotColors.includes("meta");
            let numNormalGemSlots = gemSlotColors.length - numMetaSlots;
            let itemSocketsMatch = gemSlotColors.length != 0;
            /* Remove the meta gem from the gem colors array, if applicable, for socket bonus checks */
            gemSlotColors = gemSlotColors.filter(function(gemColor) {return gemColor != 'meta'});
            let gemsToAddForSlot = Math.min(MAX_GEMS[type], numMetaSlots + numNormalGemSlots);
            let gemsAdded = 0;

            for (let gemType in gem) {
                for (let gemIndex = 0; gemIndex < gemsToAddForSlot; gemIndex++) {
                    if (type == gemType) {
                        for (let itemGem of Object.values(gem[gemType][gemIndex])) {
                            if (itemGem.selected) {
                                gemsAdded++;
                                /* If it's a meta gem, defer adding stats until later to see if it's activated */
                                if (itemGem.color == "meta") {
                                    metaGem = itemGem; metaGemIndexOffset = metaGemIndex + 1; continue;
                                }
                                this.countGem(gemColors, itemGem); // Add gem count to the total gem count array
                                itemSocketsMatch &= this.gemColorMatches(gemSlotColors, itemGem, gemIndex - metaGemIndexOffset);
                                for (let prop in this.base) {
                                    this.base[prop] += itemGem[prop] || 0;
                                }
                            }
                        }
                    }
                }
            }

            if (itemSocketsMatch && (gemsAdded == gemsToAddForSlot)) {
                let prop = this.getSocketBonus(this.itemsEquipped[type]);
                if (prop) {
                    let stat = prop.replace('socketbonus_', '');
                    this.base[stat] += this.itemsEquipped[type][prop]; 
                }
            }
        }

        /* If meta gem req is met, add it */
        if (metaGem && this.getMetaReq(metaGem, gemColors)) {
            this.activemetagem = metaGem.name;
            for (let prop in this.base) {
                this.base[prop] += metaGem[prop] || 0;
            }
        }
        else {
            this.activemetagem = "";
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
                    if (bonus.stats.t6swipebonus) {
                        this.t6swipebonus = true;
                    }
                    if (bonus.stats.t6manglebonus) {
                        this.t6manglebonus = true;
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
                this.base.incmiss += buff.incmiss || 0;
                this.base.incdodgerating += buff.incdodgerating || 0;
                this.base.bonusac += buff.bonusac || 0;
                this.base.bonushp += buff.bonushp || 0;
                this.base.hitrating += buff.hitrating || 0;
                this.base.critrating += buff.critrating || 0;
                this.base.spellcrit += buff.spellcrit || 0;
                this.base.bossapmod += buff.bossapmod || 0;
                this.base.bossattackmod *= (1 + buff.bossattackmod / 100) || 1;
                this.base.bossattackspeedmod *= (1 + buff.bossattackspeedmod / 100) || 1;
                this.base.agimod *= (1 + buff.agimod / 100) || 1;
                this.base.strmod *= (1 + buff.strmod / 100) || 1;
                this.base.dmgmod *= (1 + buff.dmgmod / 100) || 1;
                this.base.stammod *= (1 + buff.stammod / 100) || 1;
                this.base.apmod *= (1 + buff.apmod / 100) || 1;
                this.base.haste *= (1 + buff.haste / 100) || 1;
            }

            /* Special handling for stacks of Ferocious Inspiration */
            if (buff.id == 34460) {
                for (let i = 0; i < buff.count - 1; i++) {
                    this.base.dmgmod *= (1 + buff.dmgmod / 100) || 1;
                }
            }
            /* Special handling for drums, lust, haste pot */
            if (buff.id == 351355 && buff.active) {
                this.drums = buff.active;
            }
            else if (buff.id == 2825) {
                this.lust = buff.active;
            }
            else if (buff.id == 28507) {
                this.hastepot = buff.active;
            }

            if (buff.id == 14169 && buff.active) {
                this.updateTimes.push([475, 18000]); // IEA at 18s (armor diff of IEA - 5 sunders = 475)
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

    addBossSpells() {
        for (let buff of buffs) {
            if (buff.bossability && buff.name != 'Sunwell Radiance') {
                if (buff.active) {
                    this.auras[buff.name.toLowerCase()] = eval(`new ${buff.name}(this)`);
                }
            }

        }
    }

    addStun(stun, start) {
        this.stunned = true;
        this.stuns.push(stun);
        this.laststunend = Math.max(this.laststunend, start + stun.duration);
        this.mh.timer = Math.max(stun.duration * 1000, this.mh.timer); // Delay swing by stun duration
    }

    removeStun(stun) {
        this.stuns = this.stuns.filter(function(value, index, arr) {
            return value != stun;
        });
        if (this.stuns.length == 0) {
            this.stunned = false;
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
        this.lastlifebloomtick = 0;
        this.bighealtick = 0;
        this.died = false;
        this.defensivesave = false;
        for (let s in this.spells) {
            this.spells[s].timer = 0;
            this.spells[s].stacks = 0;
        }
        for (let s in this.auras) {
            this.auras[s].timer = 0;
            this.auras[s].firstuse = true;
            this.auras[s].stacks = 0;
            if (this.auras[s].resetCD) {
                this.auras[s].resetCD();
            }
        }
        if (this.auras.laceratedot) {
            this.auras.laceratedot.idmg = 0;
        }
        this.ooc.reset();
        this.update();
    }
    update() { 
        this.updateStats();
        this.mh.glanceChance = this.getGlanceChance();
        this.mh.miss = this.getMissChance(this.mh);
        this.mh.dodge = this.getDodgeChance(this.mh);
        this.mh.parry = this.getParryChance(this.mh);
        this.mh.block = this.getBlockChance(this.mh);
    }

    updateIncSwingDamage() {
        this.incswingdamage = this.base.incswingdamage;
        let attackModifier = this.stats.bossattackmod; // Percent modifiers like shadow embrace 
        let apModifier = Math.max(this. BOSS_ATTACK_COEFFICIENT * (this.BOSS_AP + this.stats.bossapmod), .858); // AP Debuffs
        this.incswingdamage *= attackModifier * apModifier;
        this.incswingspeed = this.base.incswingspeed * this.stats.bossattackspeedmod;
    }

    updateIncAttackTable() {
        // Incoming attack table constant setup
        // Base dodge - boss suppression + dodge from agi + dodge from dodge rating + dodge from def rating + dodge from talents

        this.stats.incdodge = Math.max(-1.87 + -0.6 + this.stats.agi / 14.7059 + this.stats.incdodgerating * this.DODGE_RATING_COEFFICIENT + 
            this.stats.def * .04 + this.talents.feralswiftnessmod + (this.race == 'Night Elf'), 0);
        this.stats.incmiss = this.base.incmiss + this.stats.def * .04;
        this.stats.inccrit = 5.6 - this.talents.survivalofthefittest - this.stats.def * .04 - this.stats.res / 39.423081398499;
        this.stats.inccrush = this.bosscrush ? 15 : 0;

        /*
        if (log) {
            this.log(`\nUpdated incoming attack table: \nDodge = ${this.stats.incdodge}\nMiss = ${this.stats.incmiss}\nCrit`
                +` =  ${this.stats.inccrit} \nCrush = ${this.stats.inccrush}`);
        }
        */
    }

    updateStats() {
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
        this.stats.maxhp = this.stats.sta * 10 + this.stats.bonushp + 3439; // 3439 assumed as base hp constant
        if (this.race == 'Tauren') this.stats.maxhp = ~~(this.stats.maxhp * 1.05);
        this.defensivehpthreshold = this.stats.maxhp * this.defensivethreshold / 100;
        this.stats.ap += this.stats.str * 2 + this.talents.predatorystrikes / 2.0 * 70 + this.base.aprace;
        this.stats.ap = ~~(this.stats.ap * this.stats.apmod);
        this.stats.crit += this.stats.agi / 25;
        this.crit = this.getCritChance();
        this.stats.armormod *= this.talents.thickhidemod;
        this.stats.def = Math.floor(this.stats.def / 2.3653850351998); // Adjust defense skill for defense rating
        this.stats.haste +=  this.stats.haste * this.stats.hasterating * this.HASTE_RATING_COEFFICIENT / 100; // Add haste from rating
        this.mh.bonusdmg = this.stats.bonusdmg;
        this.updateArmor(); // Update current armor reduction
        this.updateIncSwingDamage(); // Update boss swing speed, damage
        this.updateIncAttackTable(); // Update defensive attack table
        this.updateTargetArmorReduction(); // Update current target's armor reduction 
    }
    
    updateArmor() {
        /* Initial armor setup with multiplier */
        this.stats.ac = (this.base.ac) * (this.stats.armormod);

        /* Calculate agi/buffs armor after armor mod */
        this.stats.ac += this.stats.agi * 2;
        for (let name in this.auras) {
            if (this.auras[name].timer && this.auras[name].stats.ac && this.auras[name].active)
                this.stats.ac += this.auras[name].stats.ac;
        }
        this.stats.ac += this.base.bonusac;
    }

    updateTargetArmorReduction() {
        this.target.armor = Math.max(0, this.target.basearmor - this.stats.arpen - this.debuffarmor);
        this.armorReduction = this.getArmorReduction(this.target.armor, this.level);
    }

    updateTargetArmorForTime(tick) {
        this.updateTimes.forEach((timepair, index)  => {
            if (tick >= timepair[1]) {
                this.debuffarmor += timepair[0];
                this.updateTimes = this.updateTimes.filter(item => item !== timepair);
                this.updateTargetArmorReduction();
            }
        });
    }

    getGlanceReduction(weapon) {
        let diff = this.target.defense - this.stats.skill;
        let low = Math.min(1.4 - 0.05 * diff, 0.91);
        let high = Math.min(1.3 - 0.03 * diff, 0.99);
        if (this.weaponrng) return Math.random() * (high - low) + low;
        else return avg(low, high);
    }
    getGlanceChance() {
        return 24;
    }
    getMissChance(weapon) {
        let diff = this.target.defense - this.stats.skill;
        let miss = 5 + (diff > 10 ? diff * 0.2 : diff * 0.1);
        let missChance = Math.max(miss - this.stats.hit - this.stats.hitrating * this.HIT_RATING_COEFFICIENT + 1, 0);
        return missChance;
    }

    getCritChance() {
        let crit = this.stats.crit + (this.stats.critrating * this.CRIT_RATING_COEFFICIENT) + (this.talents.sharpenedclawsmod || 0) + 
        this.talents.abilitiescrit + // LOTP
        (this.level - this.target.level) * 1 + // Level-based crit suppression
        (this.level - this.target.level) * 0.6; // Boss-based crit suppression
        return Math.max(crit, 0);
    }
    getDodgeChance(weapon) {
        return Math.max((5 + (this.target.defense - this.stats.skill) * 0.1) - 0.25 * Math.floor(this.stats.exp * this.EXP_RATING_COEFFICIENT), 0);
    }

    getParryChance(weapon) {
        if (!this.activetank) {
            return 0;
        }
        else {
            return Math.max(14 - 0.25 * Math.floor(this.stats.exp * this.EXP_RATING_COEFFICIENT), 0);
        }
    }

    getBlockChance(weapon) {
        return this.activetank ? 5 : 0;
    }

    getArmorReduction(armor, attackerlevel) {
        let r = armor / (armor + 400 + 85 * ((5.5 * attackerlevel) - 265.5))
        return r > 0.75 ? 0.75 : r;
    }

    getEHP() {
        // EHP = HP / (armor * weighted attack table)
        let ehp = (this.stats.sta * 10) / (1 - this.getArmorReduction(this.stats.ac, 73)) 
            / (1 - this.stats.incdodge / 100 - this.stats.incmiss / 100 + this.stats.inccrush * 1.5 / 100 + Math.max(0, this.stats.inccrit) * 2 / 100);
        return ehp;
    }

    getHP() {
        return (this.stats.sta * 10);
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

    stepauras(activatedSpells, bossSpells) {

        // Step any active trinket spells
        activatedSpells.forEach((spell) => {
            if (spell.timer) {
                spell.step();
            }
        })

        // Step boss specials
        bossSpells.forEach((spell) => {
            if (spell.timer) {
                spell.step();
            }
        })

        // Step lacerate DOT manually if necessary
        if (this.auras.laceratedot && this.auras.laceratedot.timer) this.auras.laceratedot.step();
    }
    endauras(activatedSpells, bossSpells) {

        // Step any active trinket spells
        activatedSpells.forEach((spell) => {
            if (spell.timer) {
                spell.end();
            }
        })

        // Step any active trinket spells
        bossSpells.forEach((spell) => {
            if (spell.timer) {
                spell.end();
            }
        })

        // End lacerate DOT if applicable
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
        tmp += this.mh.block * 100;  
        if (roll < tmp) return RESULT.BLOCK;
        tmp += this.crit * 100;
        if (roll < tmp) return RESULT.CRIT;
        return RESULT.HIT;
    }
    rollattacktaken() {
        let tmp = 0;
        let roll = rng10k();
        tmp += this.stats.incmiss * 100;
        if (roll < tmp) return RESULT.MISS;
        tmp += this.stats.incdodge * 100
        if (roll < tmp) return RESULT.DODGE;
        tmp += this.stats.inccrush * 100;
        if (roll < tmp) return RESULT.CRUSH;
        tmp += Math.max(0, this.stats.inccrit) * 100;
        if (roll < tmp) return RESULT.CRIT;
        return RESULT.HIT;
    }

    rollspecialtaken() {
        let tmp = 0;
        let roll = rng10k();
        tmp += this.stats.incmiss * 100;
        if (roll < tmp) return RESULT.MISS;
        tmp += this.stats.incdodge * 100
        if (roll < tmp) return RESULT.DODGE;
        return RESULT.HIT;
    }

    rollspell(spell) {
       let roll = rng10k();
       let tmp = Math.max(this.mh.miss, 0) * 100;
       if (roll < tmp) return RESULT.MISS;
       tmp += this.mh.parry * 100;
       if (roll < tmp) return RESULT.PARRY;
       tmp += this.mh.dodge * 100;
       if (roll < tmp) return RESULT.DODGE;
       tmp += this.mh.block * 100; // block
       if (roll < tmp) {
          if (spell.weaponspell || spell.nocrit) return RESULT.BLOCK;
          if (rng10k() < this.crit * 100) return RESULT.BLOCKED_CRIT;
          return RESULT.BLOCK;
       }
       if (spell.nocrit) return RESULT.HIT;
       if (rng10k() < this.crit * 100) return RESULT.CRIT;
       return RESULT.HIT;
    }

    checkParryHaste(result) {

        if (result == RESULT.PARRY && this.bossparryhaste) {
            /* If current boss swing timer > 60% of base timer, haste by 40% */
            if (this.incswingtimer >= .6 * this.incswingspeed) {
                this.incswingtimer = ~~(this.incswingtimer * 0.6);
            }
            /* Otherwise if between 20% and 60% incoming swing timer,
             * swing timer = swing timer - (remaining time - 20% of base swing timer) */
            else if (this.incswingtimer >= .2 * this.incswingspeed) {
                this.incswingtimer -= ~~(this.incswingtimer - .2 * this.incswingspeed);           
            }
            else {
                // No action taken if swing is within 20% of completing
            }
        }
    }

    attackmh(weapon, damage_threat_arr, step) {

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

        let dmg = weapon.dmg(spell);
        procdmg = this.procattack(spell, weapon, result, step);

        if (result == RESULT.GLANCE) {
            dmg *= this.getGlanceReduction(weapon);
        }
        else if (result == RESULT.CRIT) {
            dmg *= this.stats.critdamagemod;
        }

        weapon.use();
        let done = this.dealdamage(dmg, result, weapon, spell);
        let threat = this.attackmhthreat(done, result, weapon, spell);
        let procthreat = procdmg * this.stats.threatmod;
        
        /* Apply boss parry haste if attack was parried */
        this.checkParryHaste(result);

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
        damage_threat_arr[1] = threat + procthreat;
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

    takeheal(tick) {
        /* Handle lifebloom heal */
        let timeDiffLifebloom = Math.floor(tick / 1000) - this.lastlifebloomtick;
        if (timeDiffLifebloom >= 1.0) {
            this.currenthp = Math.min(this.currenthp + timeDiffLifebloom * this.inchpslifebloom, this.stats.maxhp);
            this.lastlifebloomtick = Math.floor(tick / 1000);
        }

        /* Handle holy light style heal */
        let timeDiffBigHeal = tick / 1000 - this.bighealtick / 1000;
        let numHeals = Math.floor(timeDiffBigHeal / 2.5);
        if (numHeals > 0) {
            let remainder = tick % 2500;
            this.currenthp = Math.min(this.currenthp + numHeals * this.incheal, this.stats.maxhp);
            this.bighealtick = tick - remainder;
        }

    }

    getselfarmormod() {
        let selfArmorMod = this.stats.ac / (this.stats.ac + (467.5 * 73 - 22167.5));
        if (selfArmorMod > 0.75) selfArmorMod = 0.75;
        return selfArmorMod;
    }

    takeattack(tick) {
        this.takeheal(tick);
        this.incswingtimer = this.incswingspeed;

        // Roll MH swing 
        let result = this.rollattacktaken();
        let dmg = this.incswingdamage;
        this.damageTakenData[result]++;
        if (result == RESULT.HIT) {
            dmg *= 1.0;
            if (this.enableLogging) this.log(`Boss MH hit for ${dmg}`);
        }
        else if (result == RESULT.CRIT) {
            dmg *= 2.0;
            if (this.enableLogging) this.log(`Boss MH crit for ${dmg}`);
        }
        else if (result == RESULT.CRUSH) {
            dmg *= 1.5;
            if (this.enableLogging) this.log(`Boss MH crushed for ${dmg}`);
        }
        else {
            dmg = 0.0;
            if (this.enableLogging) this.log("Boss MH swing missed");
        }
        let selfArmorMod = this.getselfarmormod();
        dmg = dmg * (1 - selfArmorMod);
        this.addDamageTakenRage(dmg);

        // Roll OH swing if applicable
        if (this.bossdw) {
            let result = this.rollattacktaken();
            let ohdmg = this.incswingdamage * 0.5;
            this.damageTakenData[result]++;
            if (result == RESULT.HIT) {
                ohdmg *= 1.0;
                if (this.enableLogging) this.log(`Boss offhand hit for ${ohdmg}`);
            }
            else if (result == RESULT.CRIT) {
                ohdmg *= 2.0;
                if (this.enableLogging) this.log(`Boss offhand crit for ${ohdmg}`);
            }
            else if (result == RESULT.CRUSH) {
                ohdmg *= 1.5;
                if (this.enableLogging) this.log(`Boss offhand crushed for ${ohdmg}`);
            }
            else {
                ohdmg = 0.0;
                if (this.enableLogging) this.log("Boss offhand swing missed");
            }
            let selfArmorMod = this.getselfarmormod();
            ohdmg = ohdmg * (1 - selfArmorMod);
            dmg += ohdmg;
        }

        this.addDamageTakenRage(dmg);
        return dmg;
    }

    takebossspecial(tick, bossSpells, bossswinglanded) {
        let totalDamage = 0;
        for (let special of bossSpells) {
            let dmg = 0;
            // Use boss ability if off CD
            if (special.canUse(bossswinglanded)) {
                // Roll special if avoidable, reset CD if miss
                let result = RESULT.HIT;
                if (special.avoidable) {
                    result = this.rollspecialtaken()
                }
                if (result == RESULT.HIT) {
                    special.use();
                    dmg = special.damagedone;
                    if (this.enableLogging) this.log(`${special.name} hit for ${dmg}`);
                }
                else {
                    special.resetCD();
                    if (this.enableLogging) this.log(`${special.name} avoided (${result})`);
                }

                this.addDamageTakenRage(dmg);
                totalDamage += dmg;
            }

        }
        return totalDamage;
    }

    updatehealth(damage, activatedSpells) {
        /* Update current HP */
        this.currenthp = this.currenthp - damage;
        let died = false;
        if (this.currenthp <= 0) {
            died = true;
            this.defensivesave = false; // Rule out previously saved life
            if (this.enableLogging) this.log(`Player died`);
        }
        /* If below defensive HP threshold, pop all defensives available */
        else if (this.currenthp <= this.defensivehpthreshold) {
            activatedSpells.forEach(spell => {
                if (spell.defensive && spell.canUse()) {
                    spell.use();
                }
            })
        }
        
        let bonusdefensivehp = 0;
        activatedSpells.forEach(spell => {
                if (spell.defensive && spell.active) {
                    bonusdefensivehp += spell.stats.bonushp;
                }
            })

        /* If current hp is less than added HP from defensives, count a save */
        if (this.currenthp < bonusdefensivehp && !died) {
            this.defensivesave = true;
        }

        return died;
    }

    cast(spell, damage_threat_arr, step) {
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
        procdmg = this.procattack(spell, this.mh, result, step);

        if (result == RESULT.CRIT || result == RESULT.BLOCKED_CRIT) {
            dmg *= this.stats.critdamagemod;
        }

        let done = this.dealdamage(dmg, result, this.mh, spell);
        let threat = this.dealthreat(done, result, spell);
        let procthreat = procdmg * this.stats.threatmod;

       /* Apply boss parry haste if attack was parried */
        this.checkParryHaste(result);

        // Correct result to RESULT.CRIT for crit proc checks, stats
        if (result == RESULT.BLOCKED_CRIT) {
            result = RESULT.CRIT; 
        }

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
        damage_threat_arr[0] = done + procdmg;
        damage_threat_arr[1] = threat + procthreat;
        return damage_threat_arr;
    }
    dealdamage(dmg, result, weapon, spell) {
        let finalDamage = 0;

        if (spell && (spell.name) == 'Faerie Fire') {
            return finalDamage;
        }
        else if (result != RESULT.MISS && result != RESULT.DODGE && result != RESULT.PARRY) {
            dmg *= this.stats.dmgmod;
            dmg *= (1 - this.armorReduction);
            if (result == RESULT.BLOCK || result == RESULT.BLOCKED_CRIT) {
                dmg = Math.max(0, dmg - 54);
            }

            /* If landing a lacerate, also apply the bleed */
            if (spell && spell.name == 'Lacerate') {
                this.auras.laceratedot.use();
            }
            finalDamage = ~~dmg;
        }
        else {
            finalDamage = 0;
        }
        this.addRage(dmg, result, weapon, spell);
        return finalDamage;
    }

    dealthreat(dmg, result, spell) {
        let threat = 0;
        if (spell && spell.name == 'Faerie Fire') {
            threat = 131 * this.stats.threatmod;
        }
        else if (result != RESULT.MISS && result != RESULT.DODGE && result != RESULT.PARRY) {
            if (spell.name == 'Mangle') {
                threat = dmg * this.stats.threatmod * 1.3;
                if (this.t6manglebonus) {
                    threat *= 1.15;
                }
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

    procattack(spell, weapon, result, step) {
        let procdmg = 0;
        if (result != RESULT.MISS && result != RESULT.DODGE && result != RESULT.PARRY) {
            const isCrit = result == RESULT.CRIT || result == RESULT.BLOCKED_CRIT;

            if (isCrit && (this.talents.primalfury == 2 || this.talents.primalfury == 1 && Math.random() < 0.5)) {
                this.rage += 5.0;
                if (this.enableLogging) this.log(`Primal Fury Proc, +5 rage`);
            } 

            /* Check T4 Proc */
            if (this.t4rageproc && rng10k() < 1000) {
                if (log) this.log(`T4 Bloodlust Proc, +10 rage`);
                this.rage += 10.0;
            }

            /* Check Omen of Clarity Proc */
            this.ooc.rollOOC(step, spell);

            const procSlots = [this.trinketproc1, this.trinketproc2, this.ringproc1, this.ringproc2];

            for (const procSlot of procSlots) {
                // If item has a proc and the proc doesn't require a crit or the result is a crit, roll for a proc
                if (procSlot && (!procSlot.spell.requirescrit || result == RESULT.CRIT)) {
                    let chance;
                    if (spell && spell.name != "Maul") chance = procSlot.spell.yellowchance;
                    else chance = procSlot.spell.whitechance;
                    if (Math.random() < chance) {
                        //if (log) this.log("${spell.name} proc");
                        if (procSlot.extra)
                            this.batchedextras += procSlot.extra;
                        if (procSlot.spell.magicdmg) procdmg += this.magicproc(procSlot.spell);
                        if (procSlot.spell && procSlot.spell.canProc()) procSlot.spell.proc();
                    }
                }
            }

            /* Check for Idol of the White Stag Proc */
            if (this.items.includes(32257) && spell && spell.name == "Mangle") {
                this.auras.mangleapbuff.proc();
            }

            /* Check for Idol of Terror proc */
            if (this.items.includes(33509) && spell && spell.name == "Mangle") {
                if (rng10k() < (this.auras.primalinstinct.yellowchance * 10000) && this.auras.primalinstinct.canUse()) {
                    this.auras.primalinstinct.proc();
                }
            }

            /* Check for magical damage proc (i.e. poison vial) */
            if (this.attackproc && rng10k() < this.attackproc.chance) {
                if (this.attackproc.magicdmg) procdmg += this.magicproc(this.attackproc);
                if (this.attackproc.spell) this.attackproc.spell.use();
            }

            /* Check for badge of the swarmguard proc */
            if (this.auras.swarmguard && this.auras.swarmguard.timer && rng10k() < this.auras.swarmguard.chance) {
                this.auras.swarmguard.proc();
            }

            /* Check for dragonbreath chili proc */
            if (this.dragonbreath && rng10k() < 400) {
                procdmg += this.magicproc({ magicdmg: 60, coeff: 1 });
            }
        }

        return procdmg;
    }
    magicproc(proc) {
        let mod;
        let miss = 1700;
        let dmg = proc.magicdmg;
        let dmgrange = proc.magicdmgrange;
        let finaldmg = ~~(Math.random() * dmgrange * 2 + (dmg - dmgrange));
        //if (proc.gcd && this.timer && this.timer < 1500) return 0;
        if (rng10k() < miss) return 0; // Roll for spell miss
        
        // Roll for partial resist 
        let magicRoll = Math.random();
        let tmp = 0.0072;
        if (!mod && magicRoll < tmp) mod = 0.25;
        tmp += .0432;
        if (!mod && magicRoll < tmp) mod = 0.5;
        tmp += .1320;
        if (!mod && magicRoll < tmp) mod = 0.75;
        if (!mod) mod = 1.00;

        // Roll for crit
        if (rng10k() < (this.stats.spellcrit * 100)) mod *= 1.5;
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
            damageTakenData: this.damageTakenData,
        };
    }
    log(msg) {
        if (this.enableLogging) {
            let currentHPPercent = this.currenthp / this.stats.maxhp * 100;
            console.log(`${step.toString().padStart(5,' ')} | ${this.rage.toFixed(2).padStart(6,' ')} | ${currentHPPercent.toFixed(2).padStart(6,' ')} | ${msg}`);
        }
    }
}
