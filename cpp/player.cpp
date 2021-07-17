#include "player.h"
#include "bindings.h"
#include "items.h"
#include "buffs.h"
#include "talents.h"

Player::Player( Simulation& sim, const Config& cfg, const Talents& talents_ )
    : simulation( sim )
    , talents( talents_ )
{
    race = cfg.player.race;
    weaponrng = cfg.player.weaponrng != 0;
    spelldamage = cfg.player.spelldamage;
    if ( cfg.player.enchType == 1 )
    {
        testEnch = cfg.player.testId;
        testEnchType = cfg.player.testType;
    }
    else if ( cfg.player.enchType == 2 )
    {
        testTempEnch = cfg.player.testId;
        testTempEnchType = cfg.player.testType;
    }
    else if ( cfg.player.enchType == 3 )
    {
        if ( cfg.player.testType == 0 )
        {
            base.ap += cfg.player.testId;
        }
        else if ( cfg.player.testType == 1 )
        {
            base.crit += cfg.player.testId;
        }
        else if ( cfg.player.testType == 2 )
        {
            base.hit += cfg.player.testId;
        }
        else if ( cfg.player.testType == 3 )
        {
            base.str += cfg.player.testId;
        }
    }
    else
    {
        testItem = cfg.player.testId;
        testItemType = cfg.player.testType;
    }
    target = cfg.target;
    base.skill[0] = level * 5;
    base.skill[1] = level * 5;
    base.skill[2] = level * 5;
    base.skill[3] = level * 5;
    base.skill[4] = level * 5;
    base.skill[5] = level * 5;

    addRace();
    addGear();
    addSets();
    addEnchants();
    addTempEnchants();
    addBuffs();
    addSpells();

    if ( includes( items, 9449 ) ) auras.emplace<Pummeler>( *this );
    if ( includes( items, 23041 ) ) auras.emplace<Slayer>( *this );
    if ( includes( items, 22954 ) ) auras.emplace<Spider>( *this );
    if ( includes( items, 29383 ) ) auras.emplace<BloodlustBrooch>( *this );
    if ( includes( items, 21670 ) ) auras.emplace<Swarmguard>( *this );

    update();
}

void Player::addRace()
{
    auto& info = races[race];
    base.aprace = info.ap;
    base.ap += info.ap;
    base.str += info.str;
    base.agi += info.agi;
    for ( int i = 0; i < NUM_WEAPON_TYPES; ++i )
    {
        base.skill[i] += info.skill[i];
    }
}

void Player::addGear()
{
    for ( int type = 0; type < NUM_ITEM_SLOTS; ++type )
    {
        for ( auto& item : Items[type] )
        {
            if ( testItemType == type ? testItem == item.id : item.selected )
            {
                base.str += item.stats.str;
                base.agi += item.stats.agi;
                base.ap += item.stats.ap;
                base.crit += item.stats.crit;
                base.hit += item.stats.hit;
                for ( int i = 0; i < NUM_WEAPON_TYPES; ++i )
                {
                    base.skill[i] += item.stats.skill[i];
                }

                if ( type == ITEM_MAINHAND || type == ITEM_OFFHAND || type == ITEM_TWOHAND )
                {
                    addWeapon( item, type );
                }

                if ( item.proc.chance )
                {
                    auto& proc = attackproc.emplace_back();
                    proc.chance = item.proc.chance * 100;
                    proc.magicdmg = item.proc.magicdmg;
                    proc.extra = item.proc.extra;
                    if ( item.proc.spell )
                    {
                        proc.spell = &item.proc.spell( *this );
                    }
                }

                items.push_back( item.id );
            }
        }
    }
}

void Player::addWeapon( Item& item, int type )
{
    Enchant* ench = nullptr;
    Enchant* tempench = nullptr;

    for ( auto& item : Enchants[type] )
    {
        if ( item.temp )
        {
            if ( testTempEnchType == type ? testTempEnch == item.id : item.selected )
            {
                tempench = &item;
            }
        }
        else
        {
            if ( testEnchType == type ? testEnch == item.id : item.selected )
            {
                ench = &item;
            }
        }
    }

    if ( type == ITEM_MAINHAND )
    {
        mh.emplace( *this, item, ench, tempench, false, false );
    }
    else if ( type == ITEM_TWOHAND )
    {
        mh.emplace( *this, item, ench, tempench, false, true );
    }
}

void Player::addEnchants()
{
    for ( int type = 0; type < NUM_ITEM_SLOTS; ++type )
    {
        for ( auto& item : Enchants[type] )
        {
            if ( !item.temp && ( testEnchType == type ? testEnch == item.id : item.selected ) )
            {
                base.str += item.stats.str;
                base.agi += item.stats.agi;
                base.ap += item.stats.ap;
                base.crit += item.stats.crit;
                if ( item.stats.haste )
                {
                    base.haste *= 1.0 + ( double )item.stats.haste / 100.0;
                }
            }
        }
    }
}

void Player::addTempEnchants()
{
    for ( int type = 0; type < NUM_ITEM_SLOTS; ++type )
    {
        if ( ( type == ITEM_MAINHAND || type == ITEM_TWOHAND ) )
        {
            continue;
        }
        for ( auto& item : Enchants[type] )
        {
            if ( item.temp && ( testTempEnchType == type ? testTempEnch == item.id : item.selected ) )
            {
                base.str += item.stats.str;
                base.agi += item.stats.agi;
                base.ap += item.stats.ap;
                base.crit += item.stats.crit;
                if ( item.stats.haste )
                {
                    base.haste *= 1.0 + ( double )item.stats.haste / 100.0;
                }
            }
        }
    }
}

void Player::addSets()
{
    for ( auto& set : Sets )
    {
        int counter = 0;
        for ( int id : set.items )
        {
            if ( id && includes( items, id ) )
            {
                counter += 1;
            }
        }
        if ( !counter )
        {
            continue;
        }
        for ( auto& bonus : set.bonuses )
        {
            if ( bonus.count && counter >= bonus.count )
            {
                base.ap += bonus.stats.ap;
                base.hit += bonus.stats.hit;
                base.crit += bonus.stats.crit;
                base.skill[1] += bonus.stats.skill_1;
                if ( bonus.stats.dmgmod )
                {
                    base.dmgmod *= 1.0 + 0.01 * ( double )bonus.stats.dmgmod;
                }

                if ( bonus.proc.chance )
                {
                    auto& proc = attackproc.emplace_back();
                    proc.chance = bonus.proc.chance * 100;
                    proc.spell = &bonus.proc.spell( *this );
                }
            }
        }
    }
}

void Player::addBuffs()
{
    for ( auto& buff : Buffs )
    {
        if ( buff.active )
        {
            int apbonus = 0;
            if ( buff.id == 27578 || buff.id == 23563 )
            {
                int shoutap = buff.stats.ap;
                apbonus = shoutap - buff.stats.ap;
            }

            base.ap += buff.stats.ap + apbonus;
            base.agi += buff.stats.agi;
            base.str += buff.stats.str;
            base.crit += buff.stats.crit;
            base.hit += buff.stats.hit;
            base.spellcrit += buff.stats.spellcrit;
            if ( buff.stats.agimod ) base.agimod *= 1.0 + 0.01 * ( double )buff.stats.agimod;
            if ( buff.stats.strmod ) base.strmod *= 1.0 + 0.01 * ( double )buff.stats.strmod;
            if ( buff.stats.dmgmod ) base.dmgmod *= 1.0 + 0.01 * ( double )buff.stats.dmgmod;
            if ( buff.stats.haste ) base.haste *= 1.0 + 0.01 * ( double )buff.stats.haste;
        }
    }
}

void Player::addSpells()
{
    if ( Mangle::options.active ) spells.emplace<Mangle>( *this );
    if ( Lacerate::options.active ) spells.emplace<Lacerate>( *this );
    if ( Swipe::options.active ) spells.emplace<Swipe>( *this );
    if ( FaerieFire::options.active ) spells.emplace<FaerieFire>( *this );
    if ( Maul::options.active ) spells.emplace<Maul>( *this );
}

void Player::reset( double rage_ )
{
    rage = rage_;
    timer = 0;
    itemtimer = 0;
    dodgetimer = 0;
    spelldelay = 0;
    heroicdelay = 0;
    mh->timer = 0;
    extraattacks = 0;
    batchedextras = 0;
    nextswinghs = false;
    nextswingcl = false;

    spells.for_each( []( Spell& spell )
    {
        spell.timer = 0;
        spell.stacks = 0;
    } );
    auras.for_each( []( Aura& aura )
    {
        aura.timer = 0;
        aura.firstuse = true;
        aura.stacks = 0;
    } );

    update();
}

void Player::update()
{
    updateAuras();
    updateArmorReduction();

    mh->glanceChance = getGlanceChance( *mh );
    mh->miss = getMissChance( *mh );
    mh->dwmiss = mh->miss;
    mh->dodge = getDodgeChance( *mh );
}

void Player::updateAuras()
{
    stats = base;
    auras.for_each( [this]( Aura& aura )
    {
        if ( aura.timer )
        {
            stats.str += aura.stats.str;
            stats.ap += aura.stats.ap;
            stats.crit += aura.stats.crit;
            stats.hit += aura.stats.hit;

            if ( aura.mult_stats.haste ) stats.haste *= 1.0 + 0.01 * ( double )aura.mult_stats.haste;
            if ( aura.mult_stats.dmgmod ) stats.dmgmod *= 1.0 + 0.01 * ( double )aura.mult_stats.dmgmod;
            if ( aura.mult_stats.apmod ) stats.apmod *= 1.0 + 0.01 * ( double )aura.mult_stats.apmod;
        }
    } );
    stats.str = int( ( double )stats.str * stats.strmod );
    stats.agi = int( ( double )stats.agi * stats.agimod );
    stats.ap += stats.str * 2;
    crit = getCritChance();

    if ( stats.apmod != 1.0 )
    {
        stats.ap += int( double( base.aprace + stats.str * 2 ) * ( stats.apmod - 1.0 ) );
    }
}

void Player::updateStrength()
{
    stats.str = base.str;
    stats.ap = base.ap;
    auras.for_each( [this]( Aura& aura )
    {
        if ( aura.timer )
        {
            stats.str += aura.stats.str;
            stats.ap += aura.stats.ap;
        }
    } );
    stats.str = int( ( double )stats.str * stats.strmod );
    stats.ap += stats.str * 2;
    if ( stats.apmod != 1.0 )
    {
        stats.ap += int( double( base.aprace + stats.str * 2 ) * ( stats.apmod - 1.0 ) );
    }
}

void Player::updateAP()
{
    stats.ap = base.ap;
    auras.for_each( [this]( Aura& aura )
    {
        if ( aura.timer )
        {
            stats.ap += aura.stats.ap;
        }
    } );
    stats.ap += stats.str * 2;
    if ( stats.apmod != 1.0 )
    {
        stats.ap += int( double( base.aprace + stats.str * 2 ) * ( stats.apmod - 1.0 ) ) * (talents.heartofthewild * .02);
    }
}

void Player::updateHaste()
{
    stats.haste = base.haste;
    if ( auto aura = auras.ptr<Pummeler>(); aura && aura->timer )
    {
        stats.haste *= 1.0 + 0.01 * ( double )aura->mult_stats.haste;
    }
    if ( auto aura = auras.ptr<Spider>(); aura && aura->timer )
    {
        stats.haste *= 1.0 + 0.01 * ( double )aura->mult_stats.haste;
    }
}

void Player::updateBonusDmg()
{
    mh->bonusdmg = mh->basebonusdmg;
}

void Player::updateArmorReduction()
{
    target.armor = target.basearmor;
    if ( auto aura = auras.ptr<Swarmguard>(); aura && aura->timer )
    {
        target.armor = std::max( target.armor - aura->armor * aura->stacks, 0 );
    }
    armorReduction = getArmorReduction();
}

void Player::updateDmgMod()
{
    stats.dmgmod = base.dmgmod;
    auras.for_each( [this]( Aura& aura )
    {
        if ( aura.timer && aura.mult_stats.dmgmod )
        {
            stats.dmgmod *= 1.0 + 0.01 * ( double )aura.mult_stats.dmgmod;
        }
    } );
}

double Player::getGlanceReduction( Weapon& weapon )
{
    // This still appears to be true for TBC against previous expectations
    int diff = target.defense - stats.skill[weapon.type];
    double low = std::min( 1.3 - 0.05 * diff, 0.91 );
    double high = std::min( 1.2 - 0.03 * diff, 0.99 );
    if ( weaponrng )
    {
        return randreal() * ( high - low ) + low;
    }
    else
    {
        return ( low + high ) / 2.0;
    }
}

int Player::getGlanceChance( Weapon& weapon )
{
    return 1000 + ( target.defense - std::min( level * 5, stats.skill[weapon.type] ) ) * 200;
}

int Player::getMissChance( Weapon& weapon )
{
    int diff = target.defense - stats.skill[weapon.type];
    int miss = 500 + ( diff > 10 ? diff * 20 : diff * 10 );
    miss -= ( diff > 10 ? stats.hit - 1 : stats.hit ) * 100;
    return miss;
}

int Player::getDWMissChance( Weapon& weapon )
{
    int diff = target.defense - stats.skill[weapon.type];
    int miss = 500 + ( diff > 10 ? diff * 20 : diff * 10 );
    miss = miss * 4 / 5 + 2000;
    miss -= ( diff > 10 ? stats.hit - 1 : stats.hit ) * 100;
    return miss;
}

int Player::getCritChance()
{
    // Find this comment
    return std::max( 0, 100 * ( stats.crit + talents.sharpenedclawsmod + 5 * talents.lotp * 5) + (100 / 25) * stats.agi + 160 * ( level - target.level ) );
}

int Player::getDodgeChance( Weapon& weapon )
{
    return 500 + ( target.defense - stats.skill[weapon.type] ) * 10;
}

double Player::getArmorReduction()
{
    double r = ( double )target.armor / ( ( double )target.armor + 400.0 + 85.0 * level );
    return std::min( r, 0.75 );
}

void Player::addRage( double dmg, Result result, Weapon& weapon, Spell* spell )
{
    if ( spell )
    {
        if ( result == RESULT_MISS || result == RESULT_DODGE )
        {
            rage += spell->refund ? ( double )spell->cost * 0.8 : 0;
        }
    }
    else
    {
        if ( result == RESULT_DODGE )
        {
            rage += ((( dmg / 274.7) * 7.5 + (mh->speed * 3.5)) / 2) * 0.75;
        }
        else if ( result != RESULT_MISS )
        {
            double factor = result == RESULT_CRIT ? 7.0 : 3.5;
            rage += (( dmg / 274.7) * 7.5 + (mh->speed * factor)) / 2;
        }
    }
    if ( rage > 100.0 )
    {
        rage = 100.0;
    }
}

bool Player::steptimer( int a )
{
    timer = std::max( 0, timer - a );
    return timer == 0;
}

bool Player::stepitemtimer( int a )
{
    itemtimer = std::max( 0, itemtimer - a );
    return itemtimer == 0;
}

bool Player::stepdodgetimer( int a )
{
    dodgetimer = std::max( 0, dodgetimer - a );
    return dodgetimer == 0;
}

void Player::stepauras()
{

    if ( auto* aura = auras.ptr<Slayer>(); aura && aura->firstuse && aura->timer ) aura->step();
    if ( auto* aura = auras.ptr<Spider>(); aura && aura->firstuse && aura->timer ) aura->step();
    if ( auto* aura = auras.ptr<BloodlustBrooch>(); aura && aura->firstuse && aura->timer ) aura->step();
    if ( auto* aura = auras.ptr<Pummeler>(); aura && aura->firstuse && aura->timer ) aura->step();
    if ( auto* aura = auras.ptr<Swarmguard>(); aura && aura->firstuse && aura->timer ) aura->step();
   
    if ( auto* aura = auras.ptr<LacerateDOT>(); aura && aura->timer ) aura->step();
}

void Player::endauras()
{
    if ( auto* aura = auras.ptr<Slayer>(); aura && aura->firstuse && aura->timer ) aura->end();
    if ( auto* aura = auras.ptr<Spider>(); aura && aura->firstuse && aura->timer ) aura->end();
    if ( auto* aura = auras.ptr<BloodlustBrooch>(); aura && aura->firstuse && aura->timer ) aura->end();
    if ( auto* aura = auras.ptr<Pummeler>(); aura && aura->firstuse && aura->timer ) aura->end();
    if ( auto* aura = auras.ptr<Swarmguard>(); aura && aura->firstuse && aura->timer ) aura->end();
    
    if ( auto* aura = auras.ptr<LacerateDOT>(); aura && aura->timer ) aura->end();
}

Result Player::rollweapon( Weapon& weapon )
{
    int roll = rng10k();
    roll -= std::max( nextswinghs ? weapon.miss : weapon.dwmiss, 0 );
    if ( roll < 0 ) return RESULT_MISS;
    roll -= weapon.dodge;
    if ( roll < 0 ) return RESULT_DODGE;
    roll -= weapon.glanceChance;
    if ( roll < 0 ) return RESULT_GLANCE;
    roll -= crit + weapon.crit * 100;
    if ( roll < 0 ) return RESULT_CRIT;
    return RESULT_HIT;
}

Result Player::rollspell( Spell& spell )
{
    int roll = rng10k();
    roll -= std::max( mh->miss, 0 );
    if ( roll < 0 ) return RESULT_MISS;
    if ( spell.canDodge )
    {
        roll -= mh->dodge;
        if ( roll < 0 ) return RESULT_DODGE;
    }
    if ( spell.nocrit ) return RESULT_HIT;
    if ( !spell.weaponspell )
    {
        roll = rng10k();
    }
    roll -= crit + mh->crit * 100;
    if ( roll < 0 ) return RESULT_CRIT;
    return RESULT_HIT;
}

int Player::attackmh( Weapon& weapon )
{
    stepauras();

    Spell* spell = nullptr;
    int bonus = 0;
    Result result;

    if ( nextswinghs )
    {
        nextswinghs = false;
        if ( auto* ptr = spells.ptr<Maul>(); ptr && ptr->cost <= rage )
        {
            result = rollspell( *ptr );
            spell = ptr;
            bonus = ptr->bonus;
            rage -= spell->cost;
        }
        else
        {
            result = rollweapon( weapon );
        }
    }
    else
    {
        result = rollweapon( weapon );
    }

    double dmg = weapon.dmg( bonus );
    int procdmg = procattack( spell, weapon, result );

    if ( result == RESULT_DODGE )
    {
        dodgetimer = 5000;
    }
    if ( result == RESULT_GLANCE )
    {
        dmg *= getGlanceReduction( weapon );
    }
    if ( result == RESULT_CRIT )
    {
        dmg *= 2.0 + ( talents.predatoryinstincts * 5.0 );
        proccrit();
    }

    weapon.use();
    int done = dealdamage( dmg, result, weapon, spell );
    if ( spell )
    {
        spell->totaldmg += done;
        spell->data[result] += 1;
    }
    else
    {
        weapon.totaldmg += done;
        weapon.data[result] += 1;
    }
    weapon.totalprocdmg += procdmg;

    //std::cout << simulation.step << " Main hand: " << done << " + " << procdmg << std::endl;

    return done + procdmg;
}

int Player::cast( Castable* castable )
{
    stepauras();

    castable->use();
    if ( castable->useonly ) return 0;
    auto* spell = dynamic_cast<Spell*>( castable );
    if ( !spell ) return 0; // Shouldn't happen

    double dmg = spell->dmg() * mh->modifier;
    Result result = rollspell( *spell );
    int procdmg = procattack( spell, *mh, result );

    if ( result == RESULT_DODGE )
    {
        dodgetimer = 5000;
    }
    if ( result == RESULT_CRIT )
    {
        dmg *= 2.0 + talents.sharpenedclawsmod;
        proccrit();
    }

    int done = dealdamage( dmg, result, *mh, spell );
    spell->data[result] += 1;
    spell->totaldmg += done;
    mh->totalprocdmg += procdmg;

    //std::cout << simulation.step << " " << castable->name() << ": " << done << " + " << procdmg << std::endl;

    return done + procdmg;
}

int Player::dealdamage( double dmg, Result result, Weapon& weapon, Spell* spell )
{
    if ( result != RESULT_MISS && result != RESULT_DODGE )
    {
        dmg *= stats.dmgmod;
        dmg *= 1.0 - armorReduction;
        addRage( dmg, result, weapon, spell );
        return int( dmg );
    }
    else
    {
        addRage( dmg, result, weapon, spell );
        return 0;
    }
}

void Player::proccrit()
{
    if (talents.primalfury) {
        rage += 5.0;
    }
}

int Player::procattack( Spell* spell, Weapon& weapon, Result result )
{
    int procdmg = 0;
    if ( result != RESULT_MISS && result != RESULT_DODGE )
    {
        for ( auto& proc : attackproc )
        {
            if ( rng10k() < proc.chance )
            {
                if ( proc.extra ) batchedextras += proc.extra;
                if ( proc.magicdmg ) procdmg += magicproc( proc );
                if ( proc.spell ) proc.spell->use();
            }
        }
        if ( auto* ptr = auras.ptr<Swarmguard>(); ptr && ptr->timer && rng10k() < ptr->chance )
        {
            ptr->proc();
        }
    }
    if ( !spell || dynamic_cast<Maul*>( spell )  )
    {
        // Formerly flurry, leaving this here in case this can be converted to DST procs
    }
    return procdmg;
}

int Player::magicproc( Proc& proc )
{
    double mod = 1.0;
    int miss = 1700;
    int dmg = proc.magicdmg;
    //if ( proc.gcd && timer && timer < 1500 ) return 0;
    if ( proc.binaryspell ) miss = target.binaryresist;
    else mod *= target.mitigation;
    if ( rng10k() < miss ) return 0;
    if ( rng10k() < stats.spellcrit * 100 ) mod *= 1.5;
    if ( proc.coeff ) dmg += spelldamage;
    return int( ( double )dmg * mod );
}

int Player::physproc( int dmg )
{
    int roll = rng10k();
    roll -= std::max( mh->miss, 0 );
    if ( roll < 0 ) return 0;
    roll -= mh->dodge;
    if ( roll < 0 )
    {
        dodgetimer = 5000;
        dmg = 0;
    }
    roll = rng10k();
    if ( roll < crit + mh->crit * 100 ) dmg *= 2;
    return int( ( double )dmg * stats.dmgmod * mh->modifier );
}
