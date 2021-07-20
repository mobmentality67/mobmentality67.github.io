log = true;

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
        this.data = [0, 0, 0, 0, 0];
        this.name = this.constructor.name;
        this.useonly = false;
        this.maxdelay = 100;
        this.weaponspell = true;
    }
    dmg() {
        return 0;
    }
    use() {
        this.player.timer = 1500;
        this.player.rage -= this.cost;
        this.timer = this.cooldown * 1000;
    }
    step(a) {
        if (this.timer <= a) {
            this.timer = 0;
            if (log) this.player.log(`${this.name} off cooldown`);
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
        this.refund = false;
        this.threshold = parseInt(spells[0].minrage);
        this.maxdelay = parseInt(spells[0].reaction);
        this.weaponspell = false;
        this.name = 'Mangle';
    }
    dmg() {
        let dmg;
        if (this.player.weaponrng) dmg = rng(this.player.mh.mindmg + this.player.mh.bonusdmg, this.player.mh.maxdmg + this.player.mh.bonusdmg);
        else dmg = avg(this.player.mh.mindmg + this.player.mh.bonusdmg, this.player.mh.maxdmg + this.player.mh.bonusdmg);
        return ((dmg + (this.player.stats.ap / 14) * 2.5) * 1.15 + 155) * this.player.stats.dmgmod;
    }
    canUse() {
        return !this.timer && !this.player.timer && this.cost <= this.player.rage && this.player.rage >= this.threshold;
    }
}

class Swipe extends Spell {
    constructor(player) {
        super(player);
        this.cost = 20 - player.talents.ferocity; 
        this.cooldown = 0;
        this.refund = false;
        this.threshold = parseInt(spells[1].minrage);
        this.maxdelay = parseInt(spells[1].reaction);
        this.priorityap = parseInt(spells[1].priorityap);
        this.maincd = parseInt(spells[1].maincd) * 1000;
    }
    getPriorityAP() {
        return this.priorityap;
    }

    dmg() {
        return ((this.player.stats.ap * 0.07) + 84) * this.player.stats.dmgmod;
    }
    canUse() {
        return !this.timer && !this.player.timer && this.cost <= this.player.rage && (this.player.rage >= this.threshold &&
            (this.player.spells.mangle && this.player.spells.mangle.timer >= this.maincd) &&
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
    }
    dmg() {
        return (31 + this.player.stats.ap / 100) * this.player.stats.dmgmod;
    }
    use() {
        this.player.rage -= this.cost;
        this.player.auras.laceratedot.use();
    }
    canUse() {
        return !this.timer && !this.player.timer && this.cost <= this.player.rage && this.player.rage >= this.threshold &&
            (this.player.spells.mangle && this.player.spells.mangle.timer >= this.maincd) && 
            (!(this.player.spells.swipe && (this.player.stats.ap > spells[1].priorityap)));
    }
}

class Maul extends Spell {
    constructor(player) {
        super(player);
        this.cost = 15 - player.talents.ferocity; 
        this.threshold = parseInt(spells[3].minrage);
        this.maincd = parseInt(spells[3].maincd) * 1000;
        this.name = 'Maul';
        this.bonus = 226;
        this.maxdelay = parseInt(spells[3].reaction);
        this.useonly = true;
    }
    use() {
        this.player.nextswinghs = true;
    }
    canUse() {
        return !this.player.nextswinghs && this.cost <= this.player.rage && (this.player.rage >= this.threshold) &&
            (this.player.spells.mangle && this.player.spells.mangle.timer >= this.maincd);
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
        this.player.timer = 4000;
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
    }
    use() {
        if (this.timer) this.uptime += (step - this.starttimer);
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.player.updateAuras();
        this.player.updateIncAttackTable();
        if (log) this.player.log(`${this.name} applied`);
    }
    step() {
        if (step >= this.timer) {
            this.uptime += (this.timer - this.starttimer);
            this.timer = 0;
            this.firstuse = false;
            this.player.updateAuras();
            this.player.updateIncAttackTable();
            if (log) this.player.log(`${this.name} removed`);
        }
    }
    end() {
        this.uptime += (step - this.starttimer);
        this.timer = 0;
        this.stacks = 0;
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
    }
    step() {
        while (step >= this.nexttick) {
            let dmg = (155 + 5.0 * this.player.stats.ap / 100) * this.player.stats.dmgmod * this.stacks;
            let tickdmg = dmg / 5;
            if (log) this.player.log(`Lacerate tick at ${this.stacks} stacks, ${tickdmg} damage`);
            this.idmg += ~~tickdmg;
            this.totaldmg += ~~tickdmg;
            this.nexttick += 3010;
        }

        if (step >= this.timer) {
            this.uptime += (this.timer - this.starttimer);
            this.timer = 0;
            this.firstuse = false;
            if (log) this.player.log(`Lacerate DOT fell off`);
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
        if (log) this.player.log(`${this.name} applied`);
    }

}

class Pummeler extends Aura {
    constructor(player) {
        super(player);
        this.duration = 30;
        this.mult_stats = { haste: 50 };
        this.name = 'Manual Crowd Pummeler';
    }
    use() {
        this.player.timer = 1500;
        if (this.timer) this.uptime += (step - this.starttimer);
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.player.updateHaste();
        //if (log) this.player.log(`${this.name} applied`);
    }
    step() {
        if (step >= this.timer) {
            this.uptime += (this.timer - this.starttimer);
            this.timer = 0;
            this.firstuse = false;
            this.player.updateHaste();
            if (log) this.player.log(`${this.name} removed`);
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
        this.armor = 200;
        this.stacks = 0;
        this.chance = 5000;
        this.timetoend = 30000;
    }
    use() {
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.stacks = 0;
        //if (log) this.player.log(`${this.name} applied`);
    }
    canUse() {
        return this.firstuse && !this.timer && step >= this.usestep;
    }
    proc() {
        this.stacks = Math.min(this.stacks + 1, 6);
        this.player.updateArmorReduction();
        //if (log) this.player.log(`${this.name} proc`);
    }
    step() {
        if (step >= this.timer) {
            this.uptime += (this.timer - this.starttimer);
            this.timer = 0;
            this.stacks = 0;
            this.firstuse = false;
            this.player.updateArmorReduction();
            //if (log) this.player.log(`${this.name} removed`);
        }
    }
}

class Slayer extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 260 };
        this.name = 'Slayer\'s Crest';
    }
    use() {
        this.player.timer = 1500;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.player.updateAP();
        //if (log) this.player.log(`${this.name} applied`);
    }
    canUse() {
        return this.firstuse && !this.timer && !this.player.timer && !this.player.itemtimer;
    }
}

class Spider extends Aura {
    constructor(player) {
        super(player);
        this.duration = 15;
        this.mult_stats = { haste: 20 };
        this.name = 'Kiss of the Spider';
    }
    use() {
        this.player.timer = 1500;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.player.updateHaste();
        //if (log) this.player.log(`${this.name} applied`);
    }
    canUse() {
        return this.firstuse && !this.timer && !this.player.timer && !this.player.itemtimer;
    }
}

class BloodlustBrooch extends Aura {
    constructor(player) {
        super(player);
        this.duration = 20;
        this.stats = { ap: 278 };
    }
    use() {
        this.player.timer = 2000;
        this.player.itemtimer = this.duration * 1000;
        this.timer = step + this.duration * 1000;
        this.starttimer = step;
        this.player.updateAP();
        //if (log) this.player.log(`${this.name} applied`);
    }
    canUse() {
        return this.firstuse && !this.timer && !this.player.timer && !this.player.itemtimer;
    }
}

