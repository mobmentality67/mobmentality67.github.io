#pragma once
#include "common.h"
#include "spell.h"
#include "holder.h"
#include "weapon.h"
#include <vector>

struct Player
{
    Simulation& simulation;
    const Talents& talents;

    Stats base;
    Stats stats;

    Holder<
        Mangle,
        Maul,
        Swipe,
        Lacerate,
        FaerieFire
    > spells;

    Holder<
        BloodlustBrooch,
        Pummeler,
        Swarmguard,
        Slayer,
        Spider,
        LacerateDOT
    > auras;

    double rage = 0;
    int level = 60;
    int timer = 0;
    int itemtimer = 0;
    int dodgetimer = 0;
    int extraattacks = 0;
    int batchedextras = 0;
    bool nextswinghs = false;
    bool nextswingcl = false;
    Race race;
    bool weaponrng;
    int spelldamage;

    int testEnch = -1;
    int testEnchType = -1;
    int testTempEnch = -1;
    int testTempEnchType = -1;
    int testItem = -1;
    int testItemType = -1;

    Config::Target target;

    int crit = 0;
    double armorReduction = 0;
    int spelldelay = 0;
    int heroicdelay = 0;

    std::optional<Weapon> mh;

    std::vector<Proc> attackproc;

    std::vector<int> items;

    Player( Simulation& simulation, const Config& cfg, const Talents& talents );

    void addRace();
    void addGear();
    void addWeapon( Item& item, int type );
    void addEnchants();
    void addTempEnchants();
    void addSets();
    void addBuffs();
    void addSpells();

    void reset( double rage );

    void update();
    void updateAuras();
    void updateStrength();
    void updateHaste();
    void updateDmgMod();
    void updateBonusDmg();
    void updateArmorReduction();
    void updateAP();

    double getGlanceReduction( Weapon& weapon );
    int getGlanceChance( Weapon& weapon );
    int getMissChance( Weapon& weapon );
    int getDWMissChance( Weapon& weapon );
    int getCritChance();
    int getDodgeChance( Weapon& weapon );
    double getArmorReduction();

    void addRage( double dmg, Result result, Weapon& weapon, Spell* spell );

    bool steptimer( int a );
    bool stepitemtimer( int a );
    bool stepdodgetimer( int a );
    void stepauras();
    void endauras();

    Result rollweapon( Weapon& weapon );
    Result rollspell( Spell& spell );

    int attackmh( Weapon& weapon );
    int cast( Castable* castable );

    int dealdamage( double dmg, Result result, Weapon& weapon, Spell* spell );
    void proccrit();
    int procattack( Spell* spell, Weapon& weapon, Result result );
    int magicproc( Proc& proc );
    int physproc( int dmg );
};
