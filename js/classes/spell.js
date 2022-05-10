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
        let dmg = ((this.player.stats.ap * 0.07) + bonusdamage);
        if (this.player.t6swipebonus) {
            dmg *= 1.15;
        }
        return dmg;
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
        this.laceraterefreshtime = parseInt(spells[2].laceraterefreshtime);
    }
    dmg() {
        let bonusdmg = 31;
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
                this.player.auras.laceratedot && this.player.auras.laceratedot.stacks == 5 && (this.player.auras.laceratedot.timer - step) > this.laceraterefreshtime));
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
        this.globals = 1;
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
        this.defensive = false;
    }
    proc() {
        return this.use();
    }
    canProc() {
        return this.canUse();
    }
    use() {
        if (this.timer) this.uptime += step - this.starttimer;
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
           this.uptime += step - this.starttimer;
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
        this.dmg = 0;
    }
    step() {
        while (step >= this.nexttick) {
            let tickdmg = 1.3 * this.dmg; // Assume mangle is up
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
        if (this.timer) this.uptime += step - this.starttimer;
        this.stacks = Math.min(this.stacks + 1, 5);
        this.dmg = ((31 + this.player.stats.ap / 100) + (this.player.t5laceratebonus * 3)) * this.stacks;
        if (!this.nexttick || this.nextTick == 0) {
            this.nexttick = step + 3000;
        }
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        if (this.player.enableLogging) this.player.log(`${this.name} applied`);
    }

    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
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
        if (this.timer) this.uptime += step - this.starttimer;
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
        return this.firstuse && !this.timer && !this.player.timer && !this.player.itemtimer && this.player.stunned == false;
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
        return (step >= this.timer) && !this.active && this.player.stunned == false;
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

class Sliver extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 0 };
        this.stacks = 0;
        this.whitechance = .10;
        this.yellowchance = .10;
        this.timetoend = 20000;
        this.cooldown = 45 * 1000;
        this.active = false;
        this.spelldelay = 0;
    }
    canUse() {
        return (step >= this.timer || this.active);
    }
    proc() {
        /* If activation proc, set up the stacks and duration */
        if (this.active == false) {
            this.timer = step + this.duration * 1000;
            this.starttimer = step;
            this.stacks = 0;
            this.active = true;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} activated `);
            /* Proc rate for AP is 100% after activating */
            this.whitechance = 1;
            this.yellowchance = 1;
        }

        this.stacks = Math.min(this.stacks + 1, 10);
        this.stats.ap = this.stacks * 44;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} proc -- AP at ${this.player.stats.ap}`);
    }

    step() {
        if (step >= this.timer && this.active) {
            this.uptime += (this.timer - this.starttimer);
            this.stats.ap = 0;
            this.timer = this.starttimer + this.cooldown;
            this.stacks = 0;
            this.firstuse = false;
            this.player.updateStats();
            this.active = false;
            /* Drop proc rate back to 10% for re-activation */
            this.whitechance = .1;
            this.yellowchance = .1;
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed -- AP at ${this.player.stats.ap}`);
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
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
    }
    step() {
         if (step > this.timer && this.active) {
            this.stats.arpen = 0;
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Haste: ${this.player.stats.haste}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
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
            this.uptime += step - this.starttimer;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Aura ${this.name} removed. Haste dropped from: ${oldHaste} to ${this.player.stats.haste}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active;
    }
}

class Drums extends Aura {
    constructor(player) {
        super(player);
        this.duration = 30; // Assume only 15 seconds of squawk have fallen off on pull (generous)
        this.stats = { hasterating: 80};
        this.cooldown = 9999999999;
        this.name = 'Greater Drums of Battle';
        this.active = false;
        this.spelldelay = 0;
    }
    use() {
        let oldHaste;
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
            this.uptime += step - this.starttimer;
            this.player.log(`Aura ${this.name} removed. Haste dropped from: ${oldHaste} to ${this.player.stats.haste}`);
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
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
        if (this.active) this.uptime += step - this.starttimer;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} proc removed -- target armor at ${this.player.target.armor}`);
        }
    }
    canUse() {
        return (step >= this.timer);
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
    }
}

class Direbrew extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 278 };
        this.name = 'Dire Drunkard';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Haste: ${this.player.stats.haste}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.player.itemtimer && !this.active && this.player.stunned == false;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active;
    }
}

class Band extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.stats = { ap: 160 };
        this.name = 'Band of the Eternal Champion';
        this.cooldown = 60 * 1000;
        this.active = false;
        this.requirescrit = false;
        this.ppm = 1;
        this.whitechance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.swingspeed);
        this.yellowchance = this.player.mh.getProcChanceFromPPM(this.ppm, this.player.mh.speed);
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Aura ${this.name} applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Aura ${this.name} removed. AP: ${this.player.stats.ap}`);
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
            this.uptime += step - this.starttimer;
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active;
    }
}

class Shard extends Aura {

    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 230 };
        this.name = 'Shard of Contempt';
        this.cooldown = 45 * 1000;
        this.active = false;
        this.requirescrit = true;
        this.whitechance = .10;
        this.yellowchance = .10;
    }
    use() {
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
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active;
    }
}

class Tenacity extends Aura {

    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { agi: 150 };
        this.name = 'Badge of Tenacity';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.activeUse = true;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. Agility: ${this.player.stats.agi}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Agility: ${this.player.stats.agi}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active && this.player.stunned == false;
    }
}

class TenacityDefensive extends Aura {

    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { agi: 150 };
        this.name = 'Badge of Tenacity';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.spelldelay = this.duration;
        this.defensive = true;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Trinket ${this.name} applied. Agility: ${this.player.stats.agi}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Trinket ${this.name} removed. Agility: ${this.player.stats.agi}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active && this.player.stunned == false;
    }
}

class MangleAPBuff extends Aura {

    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 94 };
        this.name = 'Mangle AP Buff';
        this.cooldown = 0;
        this.active = false;
    }
    use() {
        this.timer = step + this.duration * 1000;
        if (this.active) this.uptime += step - this.starttimer;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Idol Of the White Stag applied. AP: ${this.player.stats.ap}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Idol Of the White Stag removed. AP: ${this.player.stats.ap}`);
        }
    }
    canUse() {
        return (step >= this.timer);
    }
    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
    }
}

class PrimalInstinct extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.stats = { agi: 65 };
        this.name = 'Primal Instinct';
        this.cooldown = 10 * 1000;
        this.active = false;
        this.yellowchance = .50;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Idol of Terror (Mangle) applied via. Agility: ${this.player.stats.agi}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = step;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Idol of Terror (Mangle) removed. Agility: ${this.player.stats.agi}`);
        }
    }
    canUse() {
        return (step >= this.timer);
    }
    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
    }
}

class ProtectorsVigor extends Aura {

    constructor(player) {
        super(player);
        this.duration = 20;
        this.name = 'Protector\'s Vigor';
        this.cooldown = 180 * 1000;
        this.active = false;
        this.stats = { bonushp: 1750 };
        this.activeuse = true;
        this.defensive = true;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        this.player.currenthp += 1750;
        if (this.player.enableLogging) this.player.log(`Protector's Vigor applied. Current HP: ${this.player.currenthp} / ${this.player.stats.maxhp}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Protector's Vigor removed. Current HP: ${this.player.currenthp} / ${this.player.stats.maxhp}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active && this.player.stunned == false;
    }
    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
    }
}

class TremendousFortitude extends Aura {

    constructor(player) {
        super(player);
        this.duration = 15;
        this.name = 'Tremendous Fortitude';
        this.cooldown = 180 * 1000;
        this.active = false;
        this.stats = { bonushp: 1750 };
        this.activeuse = true;
        this.defensive = true;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        this.player.currenthp += 1750;
        if (this.player.enableLogging) this.player.log(`Tremendous Fortitude applied. Current HP: ${this.player.currenthp} / ${this.player.stats.maxhp}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Tremendous Fortitude removed. Current HP: ${this.player.currenthp} / ${this.player.stats.maxhp}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active && this.player.stunned == false;
    }
    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
    }
}

class TimesFavor extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.name = 'Time\'s Favor';
        this.cooldown = 120 * 1000;
        this.active = false;
        this.stats = { incdodgerating: 300 };
        this.activeuse = true;
        this.defensive = true;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Time's Favor applied. Dodge rating: ${this.player.stats.incdodgerating}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Time's Favor removed. Dodge rating: ${this.player.stats.incdodgerating}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active && this.player.stunned == false;
    }
    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
    }
}

class EvasiveManeuvers extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.name = 'Evasive Maneuvers';
        this.cooldown = 30 * 1000;
        this.active = false;
        this.stats = { incdodgerating: 152 };
        this.defensive = true;
        this.player = player;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;
        this.player.updateStats();
        if (this.player.enableLogging) this.player.log(`Evasive Maneuvers applied. Dodge rating: ${this.player.stats.incdodgerating}`);
    }
    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) this.player.log(`Evasive Maneuvers removed. Dodge rating: ${this.player.stats.incdodgerating}`);
        }
    }
    canUse() {
        return (step >= this.timer) && !this.active && ((this.player.currenthp / this.player.stats.maxhp) < .35);
    }
    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 0;
        this.stacks = 0;
        this.active = false;
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

/* -------- Boss Spells ---------- */

class Stomp_Toggle extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.name = 'Stomp (Toggle)';
        this.cooldown = 30 * 1000;
        this.active = false;
        this.stats = { ac: 0};
        this.avoidable = false;
        this.baseDamage = 20000;
        this.rngrange = 0.05;
        this.physical = true;
        this.timer = 27.5 + Math.random() * 5;
        this.damagedone = 0;

        this.healonswap = false;
        this.healafter = false;
    }
    use() {
        // Divide the tank segment into 36 second splits
        let tankSegment = step % 36000;
        // Stomp duration is full unless about to tank swap or you just tank swapped
        if (tankSegment < 12000) { 
            this.duration = 2;
            this.healonswap = true;
            this.healafter = true;
        }
        else if (tankSegment < 24000) {
            this.duration = 2;
            this.healonswap = true;
            this.healafter = true;
        }
        else if (tankSegment < 28000) {
            this.duration = 2;
            this.healonswap = true;
            this.healafter = true;
        }
        else {
            this.duration = (36000 - tankSegment) / 1000;
            this.healonswap = false;
            this.healafter = true;
        }

        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;

        this.damagedone = this.rollDamage();
        this.stats.ac = -0.5 * (this.player.base.ac) * (this.player.stats.armormod);
        this.player.updateStats();
        if (this.player.enableLogging) 
            this.player.log(`Stomp applied for ${this.duration}s (tank segment ${tankSegment}). Armor: ${this.player.stats.ac}`);
        if (this.healonswap) {
            this.player.currenthp = this.player.stats.maxhp;
            this.player.log(`Other tank taking over after stomp, full heal`);
        }
    }

    rollDamage() {
        let damage = this.baseDamage;
        if (this.player.weaponrng) {
            damage = this.baseDamage * (1 - this.rngrange) + Math.random() * this.baseDamage * this.rngrange * 2; 
        }

        return damage * (1 - this.player.getselfarmormod())
    }

    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown + Math.random() * 2000;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            this.player.removeStun(this);
            if (this.player.enableLogging) 
                this.player.log(`Stomp removed. Armor: ${this.player.stats.ac}`);
            if (this.healafter) {
                this.player.currenthp = this.player.stats.maxhp;
                this.player.log(`Tank swapping back after stomp, full heal`);
            }
        }
    }

    canUse(bossswinglanded) {
        return (step >= this.timer) && !this.active;
    }

    resetCD() {
        this.active = false;
        this.timer = step + this.cooldown + Math.random() * 2000;
        this.starttimer = step;
    }

    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 27.5 + Math.random() * 5;
        this.active = false;
    }
}

class Stomp_Full extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.name = 'Stomp (Full)';
        this.cooldown = 30 * 1000;
        this.active = false;
        this.stats = { ac: 0};
        this.avoidable = false;
        this.baseDamage = 20000;
        this.rngrange = 0.05;
        this.physical = true;
        this.timer = 0;
        this.damagedone = 0;

    }
    use() {
        // Divide the tank segment into 36 second splits
        let tankSegment = step % 36000;
        // Stomp duration is full unless about to tank swap or you just tank swapped
        if (tankSegment < 24000) {
            this.duration = 10;
        }
        else {
            this.duration = (36000 - tankSegment) / 1000;
        }

        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;

        this.damagedone = this.rollDamage();
        this.stats.ac = -0.5 * (this.player.base.ac) * (this.player.stats.armormod);
        this.player.updateStats();
        if (this.player.enableLogging) 
            this.player.log(`Stomp applied for ${this.duration}s. Armor: ${this.player.stats.ac}`);
    }

    rollDamage() {
        let damage = this.baseDamage;
        if (this.player.weaponrng) {
            damage = this.baseDamage * (1 - this.rngrange) + Math.random() * this.baseDamage * this.rngrange * 2; 
        }

        return damage * (1 - this.player.getselfarmormod())
    }

    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown + Math.random() * 2000;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            this.player.removeStun(this);
            if (this.player.enableLogging) 
                this.player.log(`Stomp removed. Armor: ${this.player.stats.ac}`);
        }
    }

    canUse(bossswinglanded) {
        return (step >= this.timer) && !this.active;
    }

    resetCD() {
        this.active = false;
        this.timer = step + this.cooldown + Math.random() * 2000;
        this.starttimer = step;
    }

    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 27.5 + Math.random() * 5;
        this.active = false;
    }
}

class Cleave extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.name = 'Cleave';
        this.cooldown = 11 * 1000;
        this.active = false;
        this.stats = { ac: 0};
        this.activeuse = true;
        this.avoidable = true;
        this.baseDamage = player.incswingdamage + 1750;
        this.rngrange = 0.05;
        this.physical = true;
        this.timer = 0;
        this.damagedone = 0;
        this.uptime = 0;
    }    

    use() {
        this.damagedone = this.rollDamage();
        this.resetCD();
        this.uptime = 0;
    }

    rollDamage() {
        let damage = 0;
        if (this.duration) {
            damage = this.baseDamage;
            if (this.player.weaponrng) {
                damage = this.baseDamage * (1 - this.rngrange) + Math.random() * this.baseDamage * this.rngrange * 2; 
            }
        }
        return damage * (1 - this.player.getselfarmormod())
    }

    canUse(bossswinglanded) {
        return (step >= this.timer);
    }

    resetCD() {
        this.timer = step + this.cooldown + Math.random() * 2000;
    }

    end() {
        this.timer = 0;
    }
}

class Corrosion extends Aura {

    constructor(player) {
        super(player);
        this.duration = 10;
        this.name = 'Corrosion';
        this.cooldown = 32 * 1000;
        this.airphasedelay = 90 * 1000;
        this.active = false;
        this.mult_stats = { bossattackmod: 100 };
        this.avoidable = false;
        this.baseDamage = 10000;
        this.rngrange = 0.05;
        this.physical = false;
        this.timer = 32 + Math.random() * 5;
        this.damagedone = 0;
        this.usagecount = 0;

    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.active = true;

        this.damagedone = this.rollDamage();
        this.player.updateStats();
        this.usagecount++;
        if (this.player.enableLogging) 
            this.player.log(`Corrosion hit for ${this.damagedone}, applied for ${this.duration}s, Boss attack mod: ${this.player.stats.bossattackmod}`);

    }

    rollDamage() {
        let damage = this.baseDamage * (1 - this.rngrange) + Math.random() * this.baseDamage * this.rngrange * 2; 
        return damage;
    }

    step() {
        if (step > this.timer && this.active) {
            this.active = false;
            this.timer = this.starttimer + this.cooldown + Math.random() * 2000;
            this.player.updateStats();
            this.uptime += step - this.starttimer;
            if (this.player.enableLogging) 
                this.player.log(`Corrosion removed, Boss attack mod: ${this.player.stats.bossattackmod}`);

        }
    }

    canUse(bossswinglanded) {
        return (step >= this.timer) && !this.active;
    }

    resetCD() {
        this.active = false;
        this.timer = step + this.cooldown + Math.random() * 2000;
        // Add an additional 90s delay for air phase
        if (this.usagecount % 2) {
            this.timer += this.airphasedelay;
        }
        this.starttimer = step;
    }

    end() {
        if (this.active) {
           this.uptime += step - this.starttimer;
        }
        this.timer = 27.5 + Math.random() * 5;
        this.active = false;
    }
}
