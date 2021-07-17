#pragma once
#include "common.h"

struct Castable
{
    virtual const char* name() const = 0;

    Player& player;
    int timer = 0;
    int maxdelay = 100;
    bool useonly = false;

    Castable( Player& player_ ) : player( player_ ) {}

    virtual void use() = 0;
    virtual bool canUse() const = 0;
};

struct Spell : public Castable
{
    int cost = 0;
    int cooldown = 0;
    bool refund = true;
    bool canDodge = true;
    uint64_t totaldmg = 0;
    int data[5] = { 0, 0, 0, 0, 0 };
    bool weaponspell = true;
    bool nocrit = false;    int stacks = 0;

    Spell( Player& player_ ) : Castable( player_ ) {}

    virtual double dmg() const
    {
        return 0;
    }

    virtual void use() override;
    virtual bool canUse() const override;

    virtual int step( int a )
    {
        timer = std::max( timer - a, 0 );
        return timer;
    }
};

struct Mangle : public Spell
{
    const char* name() const override
    {
        return "Mangle";
    }

    static struct
    {
        int active = true;
        int reaction = 100;
    } options;

    Mangle( Player& player_ )
        : Spell( player_ )
    {
        cost = 20;
        cooldown = 6;
        maxdelay = options.reaction;
        weaponspell = true;
    }

    double dmg() const override;
    bool canUse() const override;
};

struct Maul : public Spell
{
    const char* name() const override
    {
        return "Maul";
    }

 static struct
    {
        int active = true;
        int minrage = 50;
        int reaction = 300;
        int maincd = 2;
    } options;

    int bonus;

    Maul( Player& player_ );

    void use() override;
    bool canUse() const override;
};

struct Swipe : public Spell
{
    const char* name() const override
    {
        return "Swipe";
    }

    static struct
    {
        int active = true;
        int minrage = 40;
        int reaction = 100;
        int maincd = 2;
    } options;

    Swipe( Player& player_ )
        : Spell( player_ )
    {
        cost = 15;
        cooldown = 0;
        refund = false;
        maxdelay = options.reaction;
    }

    double dmg() const override;
    bool canUse() const override;
};

struct Lacerate : public Spell
{
    const char* name() const override
    {
        return "Lacerate";
    }

    static struct
    {
        int minrage = 40;
        int reaction = 100;
        int active = true;
        int maincd = 2;
        int priorityap = 2600;
    } options;

    Lacerate( Player& player_ );

    double dmg() const override
    {
        return 45.0;
    }
    bool canUse() const override;
};

struct FaerieFire : public Spell
{
    const char* name() const override
    {
        return "Faerie Fire";
    }

    static struct
    {
        int active = true;
        int globals = 1;
        int reaction = 300;
    } options;

    FaerieFire( Player& player_ );

    void use() override;
    bool canUse() const override;
};


struct Aura : public Castable
{
    int starttimer = 0;
    bool firstuse = true;
    int duration = 0;
    int stacks = 0;
    uint64_t uptime = 0;

    void( Player::*updateFunc )( );

    struct
    {
        int str = 0;
        int ap = 0;
        int crit = 0;
        int hit = 0;
        int bonusdmg = 0;
    } stats;

    struct
    {
        int haste = 0;
        int dmgmod = 0;
        int apmod = 0;
    } mult_stats;

    Aura( Player& player_, void( Player::*updateFunc_ )( ) )
        : Castable( player_ )
        , updateFunc( updateFunc_ )
    {
        useonly = true;
    }

    Aura( Player& player_ );

    virtual void use() override;
    virtual int step();
    virtual void end();

    virtual bool canUse() const override
    {
        return true;
    }
};

struct HitAura : public Aura { HitAura( Player& player_ ); };
struct StrengthAura : public Aura { StrengthAura( Player& player_ ); };
struct HasteAura : public Aura { HasteAura( Player& player_ ); };
struct AttackPowerAura : public Aura { AttackPowerAura( Player& player_ ); };
struct DmgModAura : public Aura { DmgModAura( Player& player_ ); };
struct BonusDmgAura : public Aura { BonusDmgAura( Player& player_ ); };
struct ArmorReductionAura : public Aura { ArmorReductionAura( Player& player_ ); };

struct LacerateDOT : public Aura
{
    const char* name() const override
    {
        return "Lacerate DOT";
    }

    uint64_t totaldmg = 0;
    int nexttick = 0;
    int stacks = 0;

    LacerateDOT( Player& player_ )
        : Aura( player_ )
    {
        duration = 15;
    }

    void use() override;
    int step() override;
};

struct Bloodlust : public HasteAura
{
    const char* name() const override
    {
        return "Bloodlust";
    }

    static struct
    {
        int active = true;
        int timetoend = 41;
        int haste = 30;
        int reaction = 300;
    } options;

        Bloodlust( Player& player_ )
        : HasteAura( player_ )
    {
        duration = 40;
        mult_stats.haste = options.haste;
        maxdelay = options.reaction;
    }

    void use() override;
    bool canUse() const override;
};

struct Pummeler : public HasteAura
{
    const char* name() const override
    {
        return "Manual Crowd Pummeler";
    }

    Pummeler( Player& player_ )
        : HasteAura( player_ )
    {
        duration = 30;
        mult_stats.haste = 50;
    }

    void use() override;
    bool canUse() const override;
};

struct Swarmguard : public Aura
{
    const char* name() const override
    {
        return "Swarmguard";
    }

    int armor = 200;
    int chance = 5000;
    int timetoend = 30000;

    Swarmguard( Player& player_ )
        : Aura( player_ )
    {
        duration = 30;
    }

    void use() override;
    int step() override;
    void proc();
    bool canUse() const override;
};


struct Slayer : public AttackPowerAura
{
    const char* name() const override
    {
        return "Slayer's Crest";
    }

    Slayer( Player& player_ )
        : AttackPowerAura( player_ )
    {
        duration = 20;
        stats.ap = 260;
    }

    void use() override;
    bool canUse() const override;
};

struct Spider : public HasteAura
{
    const char* name() const override
    {
        return "Kiss of the Spider";
    }

    Spider( Player& player_ )
        : HasteAura( player_ )
    {
        duration = 15;
        mult_stats.haste = 20;
    }

    void use() override;
    bool canUse() const override;
};

struct BloodlustBrooch : public AttackPowerAura
{
    const char* name() const override
    {
        return "Bloodlust Brooch";
    }

    BloodlustBrooch( Player& player_ )
        : AttackPowerAura( player_ )
    {
        duration = 20;
        stats.ap = 280;
    }

    void use() override;
    bool canUse() const override;
};
