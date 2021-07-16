var WEAPONTYPE = {
    MACE: 0,
    SWORD: 1,
    DAGGER: 2,
    AXE: 3,
    FIST: 4,
    POLEARM: 5,
    STAFF: 6
}

class Weapon {
    constructor(player, item, enchant, tempenchant, offhand, twohand) {
        this.player = player;
        this.name = item.name;
        this.mindmg = item.mindmg;
        this.maxdmg = item.maxdmg;
        this.type = item.type;
        this.modifier = player.talents.naturalistmod;
        this.speed = item.speed;
        this.timer = 0;
        this.normspeed = 2.5;
        this.offhand = offhand;
        this.twohand = twohand;
        this.crit = 0;
        this.basebonusdmg = 0;
        this.bonusdmg = 0;
        this.type = WEAPONTYPE[item.type.toUpperCase()] || 0;
        this.totaldmg = 0;
        this.totalprocdmg = 0;
        this.data = [0,0,0,0,0];
        
        if (this.player.items.includes(21189))
            this.basebonusdmg += 4;

        this.bonusdmg = this.basebonusdmg;
    }
    dmg(maul) {
        let dmg;
        if (this.player.weaponrng) dmg = rng(this.mindmg + this.bonusdmg, this.maxdmg + this.bonusdmg) + (this.player.stats.ap / 14) * this.speed;
        else dmg = avg(this.mindmg + this.bonusdmg, this.maxdmg + this.bonusdmg) + (this.player.stats.ap / 14) * this.speed;
        if (maul) dmg += maul.bonus;
        return dmg * this.modifier;
    }
    avgdmg() {
        let dmg = ((this.mindmg + this.bonusdmg + this.maxdmg + this.bonusdmg)/2) + (this.player.stats.ap / 14) * this.normSpeed;
        dmg *= this.modifier * this.player.stats.dmgmod * (1 - this.player.armorReduction);
        return dmg;
    }
    use() {
        this.timer = Math.round(this.speed * 1000 / this.player.stats.haste);
    }
    step(next) {
        this.timer -= next;
    }
}