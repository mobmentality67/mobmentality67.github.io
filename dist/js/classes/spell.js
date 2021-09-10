class Spell {
    constructor(player) {
        this.timer = 0;
        this.cost = 0;
        this.cooldown = 0;
        this.player = player;
        this.refund = true;
        this.canDodge = true;
        this.totaldmg = 0;
        this.totalthreat = 0;
        this.data = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.name = this.constructor.name;
        this.useonly = false;
        this.maxdelay = 100; 
        this.weaponspell = true;
        this.oocspell = false;
    }
    dmg() {
        return 0;
    }
    use() {
        this.player.timer = 1500;
        
        this.timer = this.cooldown * 1000;

        if (this.player.ooc.isActive() == false) {
            this.player.rage -= this.cost;
        }
        else {
            this.player.ooc.consumeOOC(this);
        }
    }
    proc() {
        return this.use();
    }
    canProc() {
        return this.canUse();
    }
    step(a) {
        if (this.timer <= a) {
            this.timer = 0;
            if (this.player.enableLogging) this.player.log(`${this.name} off cooldown`);
        }
        else {
            this.timer -= a;
        }
        return this.timer;
    }
    canUse() {
        return this.timer == 0 && this.cost <= this.player.rage;
    }
}

class Mangle extends Spell {
    constructor(player) {
        super(player);
        this.cost = 20 - player.talents.ferocity;   
        this.cooldown = 6;
        this.maxdelay = parseInt(spells[0].reaction);
        this.name = 'Mangle';
        this.weaponspell = true;
    }
    dmg() {
        let dmg;
        let bonusdmg = this.player.items.includes(28064) ? 155 + 52 : 155;
        if (this.player.weaponrng) dmg = rng(this.player.mh.mindmg + this.player.mh.bonusdmg, this.player.mh.maxdmg + this.player.mh.bonusdmg);
        else dmg = avg(this.player.mh.mindmg + this.player.mh.bonusdmg, this.player.mh.maxdmg + this.player.mh.bonusdmg);
        return ((dmg + (this.player.stats.ap / 14) * 2.5) * 1.15 + bonusdmg);
    }
    canUse() {
        return !this.timer && !this.player.timer && this.cost <= this.player.rage;
    }
}

class Swipe extends Spell {
    constructor(player) {
        super(player);
        this.cost = 20 - player.talents.ferocity; 
        this.cooldown = 0;
        this.threshold = parseInt(spells[1].minrage);
        this.maxdelay = parseInt(spells[1].reaction);
        this.priorityap = parseInt(spells[1].priorityap);
        this.maincd = parseInt(spells[1].maincd) * 1000;
        this.weaponspell = false;
        this.refund = false;
    }
    getPriorityAP() {
        return this.priorityap;
    }

    dmg() {
        let bonusdamage = this.player.items.includes(23198) ? 84 + 10 : 84;
        return ((this.player.stats.ap * 0.07) + bonusdamage);
    }
    canUse() {
        return !this.timer && !this.player.timer && this.cost <= this.player.rage && (!this.player.spells.mangle || this.player.spells.mangle.timer > 1000) && 
            (this.player.rage >= this.threshold ||
            (!this.player.spells.mangle || this.player.spells.mangle.timer >= this.maincd) &&
            ((!this.player.spells.lacerate || (this.player.stats.ap > this.priorityap))));
    }
}

class Lacerate extends Spell {
    constructor(player) {
        super(player);
        this.cost = 15 - player.talents.shreddingattacks;
        this.cooldown = 0;
        this.threshold = parseInt(spells[2].minrage);
        this.maincd = parseInt(spells[2].maincd) * 1000;
        this.maxdelay = parseInt(spells[2].reaction);
        this.weaponspell = false;
    }
    dmg() {
        let bonusdmg = this.player.t5laceratebonus ? 31 + 15 : 31;
        return (bonusdmg + this.player.stats.ap / 100);
    }
    use() {
        this.player.timer = 1500;
        if (this.player.ooc.isActive() == false) {
            this.player.rage -= this.cost;
        }
        else {
            this.player.ooc.consumeOOC(this);
        }
    }
    canUse() {
        return !this.timer && !this.player.timer && this.cost <= this.player.rage && 
            (!this.player.spells.mangle || this.player.spells.mangle.timer > 0) && (this.player.rage >= this.threshold ||
            (!this.player.spells.mangle || this.player.spells.mangle.timer >= this.maincd)) && 
            (!(this.player.spells.swipe && (this.player.stats.ap > spells[1].priorityap) && 
                this.player.auras.laceratedot && this.player.auras.laceratedot.stacks == 5 && (this.player.auras.laceratedot.timer - step) > 5000));
    }
}

class Maul extends Spell {
    constructor(player) {
        super(player);
        this.cost = 15 - player.talents.ferocity; 
        this.threshold = parseInt(spells[3].minrage);
        this.maincd = parseInt(spells[3].maincd) * 1000;
        this.name = 'Maul';
        this.bonus = this.player.items.includes(23198) ? 176 + 50 : 176;
        this.maxdelay = parseInt(spells[3].reaction);
        this.useonly = true;
    }
    use(step) {
        this.player.nextswinghs = true;
    }
    canUse() {
        return !this.player.nextswinghs && this.cost <= this.player.rage && ((this.player.rage >= this.threshold) ||
            (!this.player.spells.mangle || this.player.spells.mangle.timer >= this.maincd));
    }
}

class FaerieFire extends Spell {
    constructor(player) {
        super(player);
        this.cost = 0;
        this.globals = parseInt(spells[4].globals);
        this.maxdelay = parseInt(spells[4].reaction);
        this.stacks = 0;
        this.nocrit = true;
        this.name = 'Faerie Fire';
    }
    use() {
        this.player.timer = 1500;
        this.player.rage -= this.cost;
        this.stacks++;
    }
    canUse() {
        return !this.player.timer && this.stacks < this.globals && this.cost <= this.player.rage;
    }
}

class Aura {
    constructor(player) {
        this.timer = 0;
        this.starttimer = 0;
        this.stats = {};
        this.mult_stats = {};
        this.player = player;
        this.firstuse = true;
        this.duration = 0;
        this.stacks = 0;
        this.uptime = 0;
        this.name = this.constructor.name;
        this.maxdelay = 100;
        this.useonly = true;
        this.active = false;
        this.requirescrit = false;
    }
    proc() {
        return this.use();
    }
    canProc() {
        return this.canUse();
    }
    use() {
        if (this.timer) this.uptime += (step - this.starttimer);
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`${this.name} applied`);
        this.active = true;
    }
    step() {
        if (step >= this.timer) {
            this.uptime += (this.timer - this.starttimer);
            this.timer = 0;
            this.firstuse = false;
            this.player.updateStats();
            if (this.player.enableLogging) this.player.log(`${this.name} removed`);
            this.active = false;
        }
    }
    end() {
        if (this.active) {
           this.uptime += (step - this.starttimer);
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
    }
}

class LacerateDOT extends Aura {
    constructor(player) {
        super(player);
        this.duration = 15;
        this.name = 'Lacerate DOT';
        this.idmg = 0;
        this.totaldmg = 0;
        this.lasttick = 0;
        this.stacks = 0;
        this.starttimer = 0;
        this.nexttick = 0;
    }
    step() {
        while (step >= this.nexttick) {
            let dmg = (31 + this.player.stats.ap / 100) * this.stacks;
            let tickdmg = 1.3 * dmg; // Assume mangle is up
            if (this.player.enableLogging) this.player.log(`Lacerate tick at ${this.stacks} stacks, ${tickdmg} damage`);
            this.idmg += ~~tickdmg;
            this.totaldmg += ~~tickdmg;
            this.nexttick += 3010;
        }

        if (step >= this.timer) {
            this.uptime += (this.timer - this.starttimer);
            this.timer = 0;
            this.firstuse = false;
            if (this.player.enableLogging) this.player.log(`Lacerate DOT fell off`);
        }
    }
    use() {
        if (this.timer) this.uptime += (step - this.starttimer);
        this.stacks = Math.min(this.stacks + 1, 5);
        if (!this.nexttick || this.nextTick == 0) {
            this.nexttick = step + 3000;
        }
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        if (this.player.enableLogging) this.player.log(`${this.name} applied`);
    }

    end() {
        if (this.active) {
           this.uptime += (step - this.starttimer);
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
        this.nexttick = 0;
        this.timer = 0;
        this.starttimer = 0;
    }

}

class Pummeler extends Aura {
    constructor(player) {
        super(player);
        this.duration = 90;
        this.stats = { hasterating: 500 };
        this.name = 'Manual Crowd Pummeler';
        this.activeUse = true;
    }
    use() {
        this.player.timer = 0;
        if (this.timer) this.uptime += (step - this.starttimer);
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`${this.name} applied`);
    }
    step() {
        if (step >= this.timer) {
            this.uptime += (this.timer - this.starttimer);
            this.timer = this.starttimer + this.cooldown;
            this.firstuse = false;
            this.player.updateStats();
            this.active = false;
            if (this.player.enableLogging) this.player.log(`${this.name} removed`);
        }
    }
    canUse() {
        return this.firstuse && !this.timer && !this.player.timer && !this.player.itemtimer;
    }
}

class Swarmguard extends Aura {
    constructor(player) {
        super(player);
        this.duration = 30;
        this.stats = { arpen: 0 };
        this.stacks = 0;
        this.ppm = 10;
        this.whitechance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.swingspeed);
        this.yellowchance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.speed);
        this.timetoend = 30000;
        this.cooldown = 180 * 1000;
        this.active = false;
        this.spelldelay = 0;
        this.activeUse = true;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.stacks = 0;
        this.active = true;
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} activated `);
    }
    canUse() {
        return (step >= this.timer) && !this.active;
    }
    proc() {
        this.stacks = Math.min(this.stacks + 1, 6);
        this.stats.arpen = this.stacks * 200;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} proc -- target armor at ${this.player.target.armor}`);
    }
    canProc() {
        return this.active;
    }
    step() {
        if (step >= this.timer && this.active) {
            this.uptime += (this.timer - this.starttimer);
            this.stats.arpen = 0;
            this.timer = this.starttimer + this.cooldown;
            this.stacks = 0;
            this.firstuse = false;
            this.player.updateStats();
            this.active = false;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed -- target armor at ${this.player.target.armor}`);
        }
    }
}

class Icon extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.cooldown = 120 * 1000;
        this.timetoend = 20000;
        this.active = false;
        this.stats = { arpen: 0 };
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.player.itemtimer = this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.stats.arpen = 600;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} activated. Target armor at ${this.player.target.armor}`);
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
    step() {
         if (step > this.timer && this.active) {
            this.stats.arpen = 0;
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Target armor at ${this.player.target.armor}`);
         }
    }
}

class Romulos extends Aura {
    constructor(player) {
        super(player);
        this.whitechance = .5;
        this.yellowchance = .5;
        this.cooldown = 0;
        this.ppm = 1;
        this.whitechance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.swingspeed);
        this.yellowchance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.speed);
        this.magicdmg = 277;
        this.magicdmgrange = 55;
    }
    use() {
       if (this.player.enableLogging) this.player.log(`Trinket ${this.name} procced. `);
    }
    canUse() {
        return true;
    }
    step() {}
}

class Spider extends Aura {
    constructor(player) {
        super(player);
        this.duration = 15;
        this.stats = { hasterating: 200 };
        this.cooldown = 120 * 1000;
        this.name = 'Kiss of the Spider';
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.player.timer = 0;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. Haste: ${this.player.stats.haste}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Haste: ${this.player.stats.haste}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class Bloodlust extends Aura {
    constructor(player) {
        super(player);
        this.duration = 40;
        this.mult_stats = { haste: 30 };
        this.cooldown = 9999999999;
        this.name = 'Bloodlust';
        this.active = false;
        this.spelldelay = 0;
    }
    use() {
        let oldHaste;
        this.player.timer = 0;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        if (this.player.enableLogging) oldHaste = this.player.stats.haste;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Aura ${this.name} applied. Haste raised from: ${oldHaste} to ${this.player.stats.haste}`);
    }
    step() {
        if (step > this.timer && this.active) {
            let oldHaste;
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            if (this.player.enableLogging) oldHaste = this.player.stats.haste;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Aura ${this.name} removed. Haste dropped from: ${oldHaste} to ${this.player.stats.haste}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class HastePotion extends Aura {
    constructor(player) {
        super(player);
        this.duration = 15;
        this.stats = { hasterating: 400 };
        this.cooldown = 9999999999;
        this.name = 'Haste Potion';
        this.active = false;
        this.spelldelay = 0;
    }
    use() {
        let oldHaste;
        this.player.timer = 0;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        if (this.player.enableLogging) oldHaste = this.player.stats.haste;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Aura ${this.name} applied. Haste raised from: ${oldHaste} to ${this.player.stats.haste}`);
    }
    step() {
        if (step > this.timer && this.active) {
            let oldHaste;
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            if (this.player.enableLogging) oldHaste = this.player.stats.haste;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Aura ${this.name} removed. Haste dropped from: ${oldHaste} to ${this.player.stats.haste}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class Slayer extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 260 };
        this.name = 'Slayer\'s Crest';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.player.timer = 0;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class Madness extends Aura {

    constructor(player) {
        super(player);
        this.name = 'Madness of the Betrayer';
        this.duration = 10;
        this.stats = { arpen: 300 };
        this.ppm = 1;
        this.whitechance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.swingspeed);
        this.yellowchance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.speed);
        this.cooldown = 0;
        this.active = false;
        this.spelldelay = 0;
    }
    use() {
        this.player.timer = 0;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} proc -- target armor at ${this.player.target.armor}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} proc removed -- target armor at ${this.player.target.armor}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active;
    }
}

class Berserkers extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 360 };
        this.name = 'Berserker\'s Call';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.player.timer = 0;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class BloodlustBrooch extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 278 };
        this.name = 'Bloodlust Brooch';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.player.timer = 0;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class Tablet extends Aura {
    constructor(player) {
        super(player);
        this.duration = 15;
        this.stats = { ap: 140 };
        this.name = 'Terokkar Tablet of Precision';
        this.cooldown = 90 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.player.timer = 0;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class Abacus extends Aura {
    constructor(player) {
        super(player);
        this.duration = 10;
        this.stats = { hasterating: 260 };
        this.name = 'Abacus of Violent Odds';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.player.timer = 0;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. Haste: ${this.player.stats.haste}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Haste: ${this.player.stats.haste}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class Hourglass extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.stats = { ap: 300 };
        this.name = 'Hourglass of the Unraveller';
        this.cooldown = 50 * 1000;
        this.active = false;
        this.requirescrit = true;
        this.whitechance = .10;
        this.yellowchance = .10;
    }
    use() {
        this.player.timer = 0;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active;
    }
}

class DST extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.stats = { hasterating: 325 };
        this.name = 'Dragonspine Trophy';
        this.cooldown = 20 * 1000;
        this.active = false;
        this.ppm = 1;
        this.whitechance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.swingspeed);
        this.yellowchance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.speed);
    }
    use() {
        this.player.timer = 0;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. Haste: ${this.player.stats.haste}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Haste: ${this.player.stats.haste}`);
        }
    }

    canUse() {
        return (step >= this.timer) && !this.active;
    }
}

class Tsunami extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.stats = { ap: 340 };
        this.name = 'Tsunami Talisman';
        this.cooldown = 45 * 1000;
        this.active = false;
        this.requirescrit = true;
        this.whitechance = .10;
        this.yellowchance = .10;
    }
    use() {
        this.player.timer = 0;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += (step - this.starttimer);
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active;
    }
}

class OmenOfClarity {

    constructor(player, oocTalent) {
        this.player = player;
        this.talented = oocTalent;
        this.active = false;
        this.lastProcStep = -10;
    }

    reset() {
        this.active = false;
        this.lastProcStep = -10;
    }

    isActive() {
        return this.active;
    }

    rollOOC(step, spell) {
        if (this.talented && (step - 10000 >= this.lastProcStep)) {
            let oocroll = rng10k();
            if (oocroll > 9000) {
                this.active = true;
                if (this.player.enableLogging) this.player.log(`Procced Omen of Clarity`);
                this.lastProcStep = step;
                if (spell) {
                    spell.oocspell = true;
                }
            }
        }
    }

    consumeOOC(spell) {
        if (this.talented && this.active) {
            this.active = false;
            if (spell) {
                spell.oocspell = true;
            }
            if (this.player.enableLogging) this.player.log(`Consumed Omen of Clarity`);
        }
    }

    finishOOCUse(spell) {
        spell.oocspell = false;
    }

}
