var WEAPONTYPE = {
    MACE: 0,
    SWORD: 1,
    DAGGER: 2,
    AXE: 3,
    FIST: 4,
    POLEARM: 5,
    STAFF: 6,
    OFF_HAND: 7
}

class Weapon {
    constructor(player, item, enchant, tempenchant) {
        this.player = player;
        this.name = item.name;
        this.mindmg = 130 - 27; // Hard coded min/max bear swing damage for now
        this.maxdmg = 130 + 27; // Does not include modifier from Naturalist
        this.type = item.type;
        this.speed = item.speed;
        this.timer = 0;
        this.swingspeed = 2.5;
        this.crit = 0;
        this.basebonusdmg = 0;
        this.bonusdmg = 0;
        this.type = WEAPONTYPE[item.type.toUpperCase()] || 0;
        this.parry = 0;
        this.totaldmg = 0;
        this.totalthreat = 0;
        this.totalprocdmg = 0;
        this.data = [0,0,0,0,0,0,0,0];
        
        if (this.player.items.includes(21189))
            this.basebonusdmg += 4;

        this.bonusdmg = this.basebonusdmg;
    }
    dmg(maul) {
        let dmg;
        if (this.player.weaponrng) dmg = rng(this.mindmg + this.bonusdmg, this.maxdmg + this.bonusdmg) + (this.player.stats.ap / 14) * this.swingspeed;
        else dmg = avg(this.mindmg + this.bonusdmg, this.maxdmg + this.bonusdmg) + (this.player.stats.ap / 14) * this.swingspeed;
        if (maul) dmg += maul.bonus;
        return dmg;
    }
    avgdmg() {
        let dmg = ((this.mindmg + this.bonusdmg + this.maxdmg + this.bonusdmg)/2) + (this.player.stats.ap / 14) * this.swingspeed;
        dmg *= this.player.stats.dmgmod * (1 - this.player.armorReduction);
        return dmg;
    }
    use() {
        this.timer = Math.round(this.swingspeed * 1000 / this.player.stats.haste);
        
    }
    step(next) {
        this.timer -= next;
    }
}