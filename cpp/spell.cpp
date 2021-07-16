#include "spell.h"
#include "player.h"
#include "simulation.h"
#include "talents.h"
#include <cmath>

static bool testMainCd( Player& player, int maincd )
{
    return ( player.spells.has<Mangle>() && player.spells.get<Mangle>().timer >= maincd * 1000 );
}

// Spell

void Spell::use()
{
    player.timer = 1500;
    player.rage -= cost;
    timer = cooldown * 1000;
}

bool Spell::canUse() const
{
    return timer == 0 && cost <= player.rage;
}

// Mangle
decltype( Mangle::options ) Mangle::options;

double Mangle::dmg() const
{
    double dmg = ( player.weaponrng ? ( double )rng( player.mh->mindmg, player.mh->maxdmg ) : double( player.mh->mindmg + player.mh->maxdmg ) / 2.0 );
    return dmg + 155.0 + double( player.mh->bonusdmg ) + ( ( double )player.stats.ap / 14.0 ) * player.mh->normSpeed * 1.15;
}

bool Mangle::canUse() const
{
    return Spell::canUse() && player.timer == 0;
}


// Swipe
decltype( Swipe::options ) Swipe::options;

double Swipe::dmg() const
{
    return double (player.mh->dmg() + 55);
}

bool Swipe::canUse() const
{
    return Spell::canUse() && player.timer == 0 && player.rage >= options.minrage;
}

// Maul
decltype( Maul::options ) Maul::options;

Maul::Maul( Player& player_ )
    : Spell( player_ )
{
    cost = 15 - player_.talents.ferocity;
    bonus = 226;
    useonly = true;
    maxdelay = options.reaction;
}

void Maul::use()
{
    player.nextswinghs = true;
}

bool Maul::canUse() const
{
    return !player.nextswinghs && cost <= player.rage && ( player.rage >= options.minrage || testMainCd( player, options.maincd ) );
}

// Faerie Fire
decltype( FaerieFire::options ) FaerieFire::options;

FaerieFire::FaerieFire( Player& player_ )
    : Spell( player_ )
{
    cost = 0;
    maxdelay = options.reaction;
}

void FaerieFire::use()
{
    Spell::use();
    stacks += 1;
}

bool FaerieFire::canUse() const
{
    return Spell::canUse() && stacks < options.globals;
}


// Lacerate
decltype( Lacerate::options ) Lacerate::options;

Lacerate::Lacerate( Player& player_ )
    : Spell( player_ )
{
    cost = 15 - player_.talents.shreddingattacks;
    maxdelay = options.reaction;
}

bool Lacerate::canUse() const
{
    return Spell::canUse() && player.rage >= options.minrage;
}


// Aura

Aura::Aura( Player& player_ )
    : Aura( player_, &Player::updateAuras )
{
}

void Aura::use()
{
    if ( timer )
    {
        uptime += player.simulation.step - starttimer;
    }
    timer = player.simulation.step + duration * 1000;
    starttimer = player.simulation.step;
    ( player.*updateFunc )( );
}

int Aura::step()
{
    if ( player.simulation.step >= timer )
    {
        uptime += timer - starttimer;
        timer = 0;
        firstuse = false;
        ( player.*updateFunc )( );
    }
    return timer;
}

void Aura::end()
{
    uptime += player.simulation.step - starttimer;
    timer = 0;
    stacks = 0;
}

HitAura::HitAura( Player& player_ ) : Aura( player_, &Player::update ) {}
StrengthAura::StrengthAura( Player& player_ ) : Aura( player_, &Player::updateStrength ) {}
HasteAura::HasteAura( Player& player_ ) : Aura( player_, &Player::updateHaste ) {}
AttackPowerAura::AttackPowerAura( Player& player_ ) : Aura( player_, &Player::updateAP ) {}
DmgModAura::DmgModAura( Player& player_ ) : Aura( player_, &Player::updateDmgMod ) {}
BonusDmgAura::BonusDmgAura( Player& player_ ) : Aura( player_, &Player::updateBonusDmg ) {}
ArmorReductionAura::ArmorReductionAura( Player& player_ ) : Aura( player_, &Player::updateArmorReduction ) {}

// Lacerate

void LacerateDOT::use()
{
    if ( timer )
    {
        uptime += player.simulation.step - starttimer;
    }
    //nexttick = player.simulation.step + 3000;
    timer = player.simulation.step + duration * 1000;
    starttimer = player.simulation.step;
    if (stacks < 5) {
        stacks++;
    }
}

int LacerateDOT::step()
{
    while ( player.simulation.step >= nexttick )
    {
        double dmg = (31 + player.stats.ap / 100) * stacks;
        //std::cout << player.simulation.step << " " << name() << ": " << dmg << std::endl;
        player.simulation.idmg += dmg;
        totaldmg += dmg;
        nexttick += 3000;
    }
    if ( player.simulation.step >= timer )
    {
        uptime += timer - starttimer;
        timer = 0;
        firstuse = false;
    }
    return timer;
}

// Manual Crowd Pummeler

void Pummeler::use()
{
    player.timer = 1500;
    Aura::use();
}

bool Pummeler::canUse() const
{
    return firstuse && timer == 0 && player.timer == 0 && player.itemtimer == 0;
}

// Swarmguard

void Swarmguard::use()
{
    timer = player.simulation.step + duration * 1000;
    starttimer = player.simulation.step;
    stacks = 0;
}

int Swarmguard::step()
{
    if ( player.simulation.step >= timer )
    {
        uptime += timer - starttimer;
        timer = 0;
        stacks = 0;
        firstuse = false;
        player.updateArmorReduction();
    }
    return timer;
}

void Swarmguard::proc()
{
    stacks = std::min( stacks + 1, 6 );
    player.updateArmorReduction();
}

bool Swarmguard::canUse() const
{
    return firstuse && timer == 0 && player.simulation.step >= player.simulation.maxsteps - timetoend;
}

// Slayer's Crest

void Slayer::use()
{
    player.timer = 1500;
    player.itemtimer = duration * 1000;
    Aura::use();
}

bool Slayer::canUse() const
{
    return firstuse && timer == 0 && player.timer == 0 && player.itemtimer == 0;
}

// Kiss of the Spider

void Spider::use()
{
    player.timer = 1500;
    player.itemtimer = duration * 1000;
    Aura::use();
}

bool Spider::canUse() const
{
    return firstuse && timer == 0 && player.timer == 0 && player.itemtimer == 0;
}

// Bloodlust Brooch

void BloodlustBrooch::use()
{
    player.timer = 2000;
    player.itemtimer = duration * 1000;
    Aura::use();
}

bool BloodlustBrooch::canUse() const
{
    return firstuse && timer == 0 && player.timer == 0 && player.itemtimer == 0;
}

