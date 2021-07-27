#ifndef USE_EMSCRIPTEN

#include "bindings.h"

int main()
{
    enableBuff( 2048, 1 );  // Battle Shout
    enableBuff( 26990, 1 ); // MOTW
    enableBuff( 20217, 1 ); // BOK
    enableBuff( 27140, 1 ); // BOM
    enableBuff( 35359, 1 ); // Grace of Air
    enableBuff( 8075, 1 ); // Strength of Earth
    enableBuff( 22831, 1 );  // Major Agility
    enableBuff( 27644, 1 ); // Grilled Mudfish
    enableEnchant( ITEM_HEAD, 11645, 1 );
    enableEnchant( ITEM_SHOULDER, 29483, 1 );
    enableEnchant( ITEM_BACK, 13882, 1 );
    enableEnchant( ITEM_CHEST, 20025, 1 );
    enableEnchant( ITEM_WRIST, 20010, 1 );
    enableEnchant( ITEM_HANDS, 25080, 1 );
    enableEnchant( ITEM_LEGS, 11645, 1 );
    enableEnchant( ITEM_FEET, 13890, 1 );
    enableEnchant( ITEM_MAINHAND, 20034, 1 );
    enableEnchant( ITEM_MAINHAND, 18262, 1 );
    enableEnchant( ITEM_OFFHAND, 20034, 1 );
    enableEnchant( ITEM_OFFHAND, 18262, 1 );
    enableItem( ITEM_HEAD, 19372, 1 );
    enableItem( ITEM_NECK, 23053, 1 );
    enableItem( ITEM_SHOULDER, 21330, 1 );
    enableItem( ITEM_BACK, 23045, 1 );
    enableItem( ITEM_CHEST, 23000, 1 );
    enableItem( ITEM_WRIST, 22936, 1 );
    enableItem( ITEM_HANDS, 21581, 1 );
    enableItem( ITEM_WAIST, 23219, 1 );
    enableItem( ITEM_LEGS, 23068, 1 );
    enableItem( ITEM_FEET, 19387, 1 );
    enableItem( ITEM_FINGER1, 23038, 1 );
    enableItem( ITEM_FINGER2, 18821, 1 );
    enableItem( ITEM_TRINKET1, 23041, 1 );
    enableItem( ITEM_TRINKET2, 22954, 1 );
    enableItem( ITEM_RANGED, 22812, 1 );
    enableItem( ITEM_MAINHAND, 23054, 1 );
    enableItem( ITEM_OFFHAND, 23577, 1 );
    int* options;
    options = spellOptions( 33987 ); options[0] = 1; options[1] = 100; // Mangle | Enabled | Reaction
    options = spellOptions( 26997 ); options[0] = 1; options[1] = 30; options[2] = 2; options[2] = 100; // Swipe | Enabled | Minrage | Main CD | Reaction
    options = spellOptions( 33745 ); options[0] = 1; options[1] = 30; options[2] = 2; options[3] = 100; options[4] = 2600; // Lacerate | Enabled | Minrage | Main CD | Reaction | Priority AP
    options = spellOptions( 26996 ); options[0] = 1; options[1] = 50; options[2] = 300; // Maul | Enabled | Minrage | Reaction
    options = spellOptions( 27011 ); options[0] = 1; options[1] = 100; // Faerie Fire | Enabled | Reaction

    setTalent( talents, 112, 1 );
    setTalent( talents, 211, 5 );
    setTalent( talents, 212, 5 );
    setTalent( talents, 221, 3 );
    setTalent( talents, 231, 3 );
    setTalent( talents, 311, 2 );
    setTalent( talents, 233, 2 );
    setTalent( talents, 241, 2 );
    setTalent( talents, 242, 3 );
    setTalent( talents, 243, 2 );
    setTalent( talents, 251, 2 );
    setTalent( talents, 261, 5 );
    setTalent( talents, 262, 3 );
    setTalent( talents, 272, 1 );
    setTalent( talents, 281, 5 );
    setTalent( talents, 291, 1 );
    setTalent( talents, 321, 5 );
    setTalent( talents, 331, 3 );
    setTalent( talents, 333, 1 );

    Config* cfg = allocConfig();
    cfg->sim.timesecsmin = 110;
    cfg->sim.timesecsmax = 120;
    cfg->sim.executeperc = 20;
    cfg->sim.startrage = 0;
    cfg->sim.iterations = 1000;
    cfg->sim.activetank = 1;
    cfg->sim.incbossdamage = 17000;
    cfg->sim.incswingtimer = 2.0;
    cfg->player.testId = -1;
    cfg->player.testType = -1;
    cfg->player.enchType = -1;
    cfg->player.race = RACE_NIGHTELF;
    cfg->player.weaponrng = 1;
    cfg->player.spelldamage = 0;
    cfg->target.level = 63;
    cfg->target.basearmor = 7700;
    cfg->target.armor = 7700;
    cfg->target.defense = 365;
    cfg->target.mitigation = 0.94;
    cfg->target.binaryresist = 2197;
    Talents* talents = allocTalents();
    Simulation* sim = allocSimulation( cfg, talents );
    runSimulation( sim );
    reportSimulation( sim, 1 );
    freeSimulation( sim );
    freeTalents( talents );
    freeConfig( cfg );
    return 0;
}

#endif
