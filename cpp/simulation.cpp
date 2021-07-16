#include "simulation.h"
#include "bindings.h"
#include "talents.h"

Simulation::Simulation( Config& cfg, const Talents& talents )
    : timesecsmin( cfg.sim.timesecsmin )
    , timesecsmax( cfg.sim.timesecsmax )
    , executeperc( cfg.sim.executeperc )
    , startrage( cfg.sim.startrage )
    , iterations( cfg.sim.iterations )
    , batching( cfg.sim.batching )
    , maxcallstack( std::min( cfg.sim.iterations / 10, 1000 ) )
    , player( *this, cfg, talents )
{
    for ( int dps = 0; dps < MAX_DPS; ++dps )
    {
        spread[dps] = 0;
    }
}

void Simulation::runAll()
{
    // TODO: why -1?
    for ( int iter = 1; iter <= iterations; ++iter )
    {
        run();
        if ( maxcallstack && iter % maxcallstack == 0 )
        {
            updateReport( iter, iterations, totaldmg, totalduration );
        }
    }
}

void Simulation::run()
{
    step = 0;
    idmg = 0;
    player.reset( ( double )startrage );
    maxsteps = rng( timesecsmin * 1000, timesecsmax * 1000 );
    executestep = maxsteps - maxsteps * executeperc / 100;

    int itemstep = maxsteps;
    int slayerstep = -1, spiderstep = -1, broochstep = -1, pummelstep = -1;
    if ( player.auras.has<Slayer>() ) { itemstep -= 20000; slayerstep = std::max( itemstep, 0 ); }
    if ( player.auras.has<Spider>() ) { itemstep -= 15000; spiderstep = std::max( itemstep, 0 ); }
    if ( player.auras.has<BloodlustBrooch>() ) { itemstep -= 20000; broochstep = std::max( itemstep, 0 ); }
    if ( player.auras.has<Pummeler>() ) { itemstep -= 30000; pummelstep = std::max( itemstep, 0 ); }

    int next = 0;
    bool spellcheck = false;
    Castable* delayedspell = nullptr;
    Spell* delayedheroic = nullptr;

    std::cout << "Starting Simulation::run: " << std::endl;

    while ( step < maxsteps )
    {
        // Attacks
        if ( player.mh->timer <= 0 )
        {
            int dmg = player.attackmh( *player.mh );
            idmg += dmg;
            spellcheck = true;
        }

        // Spells
        if ( spellcheck && !player.spelldelay )
        {
            // No GCD
            if ( auto* ptr = player.auras.ptr<Swarmguard>(); ptr && ptr->canUse() ) { player.spelldelay = 1; delayedspell = ptr; }
            else if ( auto* ptr = player.auras.ptr<BloodlustBrooch>(); ptr && ptr->canUse() ) { player.spelldelay = 1; delayedspell = ptr; }
         
            // GCD spells
            else if ( player.timer ) {}
            else if ( auto* ptr = player.auras.ptr<Slayer>(); ptr && ptr->canUse() && step > slayerstep ) { player.spelldelay = 1; delayedspell = ptr; }
            else if ( auto* ptr = player.auras.ptr<Spider>(); ptr && ptr->canUse() && step > spiderstep ) { player.spelldelay = 1; delayedspell = ptr; }
            else if ( auto* ptr = player.auras.ptr<Pummeler>(); ptr && ptr->canUse() && step > pummelstep ) { player.spelldelay = 1; delayedspell = ptr; }

            // Normal phase
            else if ( auto* ptr = player.spells.ptr<FaerieFire>(); ptr && ptr->canUse() ) { player.spelldelay = 1; delayedspell = ptr; }
            else if ( auto* ptr = player.spells.ptr<Mangle>(); ptr && ptr->canUse() ) { player.spelldelay = 1; delayedspell = ptr; }
            else if ( auto* ptr = player.spells.ptr<Lacerate>(); ptr && ptr->canUse() ) { player.spelldelay = 1; delayedspell = ptr; }
            else if ( auto* ptr = player.spells.ptr<Swipe>(); ptr && ptr->canUse() ) { player.spelldelay = 1; delayedspell = ptr; }

            if ( player.heroicdelay ) spellcheck = false;
        }

        // Maul
        if ( spellcheck && !player.heroicdelay )
        {
            if ( auto* ptr = player.spells.ptr<Maul>(); ptr && ptr->canUse() ) { player.heroicdelay = 1; delayedheroic = ptr; }
            spellcheck = false;
        }

        std::cout << "Entering cast spell block: " << std::endl;

        // Cast spells
        if ( player.spelldelay && delayedspell && player.spelldelay > delayedspell->maxdelay )
        {
            // Prevent casting Maul and other spells at the exact same time
            if ( player.heroicdelay && delayedheroic && player.heroicdelay > delayedheroic->maxdelay )
            {
                std::cout << "Prevent maul block: " << std::endl;
                player.heroicdelay = delayedheroic->maxdelay - 49;
            }
            if ( delayedspell->canUse() )
            {
                std::cout << "Delayed spell block: " << std::endl;
                int dmg = player.cast( delayedspell );
                idmg += dmg;
                spellcheck = true;
            }
            player.spelldelay = 0;
        }

        // Cast Maul
        if ( player.heroicdelay && delayedheroic && player.heroicdelay > delayedheroic->maxdelay )
        {
            std::cout << "Cast maul block: " << std::endl;
            if ( delayedheroic->canUse() )
            {
                player.cast( delayedheroic );
                spellcheck = true;
            }
            player.heroicdelay = 0;
        }

        // Extra attacks
        if ( player.extraattacks > 0 )
        {
            player.mh->timer = 0;
            player.extraattacks -= 1;
        }
        if ( player.batchedextras > 0 )
        {
            player.mh->timer = batching - ( step % batching );
            player.batchedextras -= 1;
        }

        // Process next step
        if ( !player.mh->timer || ( !player.spelldelay && spellcheck ) || ( !player.heroicdelay && spellcheck ) )
        {
            next = 0;
            continue;
        }

        next = player.mh->timer;

        std::cout << "Total: " << idmg << std::endl;
        if ( player.spelldelay ) next = std::min( next, delayedspell->maxdelay - player.spelldelay + 1 );
        if ( player.heroicdelay ) next = std::min( next, delayedheroic->maxdelay - player.heroicdelay + 1 );
        if ( player.timer ) next = std::min( next, player.timer );
        if ( player.itemtimer ) next = std::min( next, player.itemtimer );

        if ( auto* ptr = player.spells.ptr<Mangle>(); ptr && ptr->timer ) next = std::min( next, ptr->timer );
        if ( auto* ptr = player.spells.ptr<Lacerate>(); ptr && ptr->timer ) next = std::min( next, ptr->timer );
        if ( auto* ptr = player.spells.ptr<Swipe>(); ptr && ptr->timer ) next = std::min( next, ptr->timer );

        step += next;
        player.mh->step( next );
        if ( player.timer && player.steptimer( next ) && !player.spelldelay ) spellcheck = true;
        if ( player.itemtimer && player.stepitemtimer( next ) && !player.spelldelay ) spellcheck = true;
        if ( player.dodgetimer ) player.stepdodgetimer( next );
        if ( player.spelldelay ) player.spelldelay += next;
        if ( player.heroicdelay )  player.heroicdelay += next;

        if ( auto* ptr = player.spells.ptr<Mangle>(); ptr && ptr->timer && !ptr->step( next ) && !player.spelldelay ) spellcheck = true;
        if ( auto* ptr = player.spells.ptr<Lacerate>(); ptr && ptr->timer && !ptr->step( next ) && !player.spelldelay ) spellcheck = true;
        if ( auto* ptr = player.spells.ptr<Swipe>(); ptr && ptr->timer && !ptr->step( next ) && !player.spelldelay ) spellcheck = true;
    }

    player.endauras();

    std::cout << "Total: " << idmg << std::endl;

    totaldmg += idmg;
    totalduration += maxsteps;

    double dps = 1000.0 * ( double )idmg / ( double )maxsteps;
    if ( dps < mindps ) mindps = dps;
    if ( dps > maxdps ) maxdps = dps;
    sumdps += dps;
    sumdps2 += dps * dps;
    int idps = int( dps + 0.5 );
    if ( idps < MAX_DPS )
    {
        spread[idps] += 1;
    }
}

void Simulation::report( bool full )
{
    if ( full )
    {
        player.auras.for_each( [=]( Aura& aura )
        {
            reportAura( aura, iterations, totalduration );
        } );
        player.spells.for_each( [=]( Spell& spell )
        {
            reportSpell( spell, iterations, totalduration );
        } );
        reportWeapon( false, *player.mh, iterations, totalduration );
        reportSpread( spread, MAX_DPS );
    }
    finalReport( iterations, totaldmg, totalduration, mindps, maxdps, sumdps, sumdps2 );
}
