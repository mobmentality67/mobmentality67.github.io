#pragma once
#include <algorithm>

struct Buff;
struct Item;
struct Enchant;
struct ItemSet;
struct Simulation;
struct Player;
struct Spell;
struct Aura;
struct Weapon;
struct Talents;

enum WeaponType : int
{
    WEAPON_MACE,
    WEAPON_SWORD,
    WEAPON_DAGGER,
    WEAPON_AXE,
    WEAPON_FIST,
    WEAPON_POLEARM,

    NUM_WEAPON_TYPES
};

enum Race : int
{
    RACE_NIGHTELF,
    RACE_TAUREN,

    NUM_RACES
};

enum Result : int
{
    RESULT_HIT,
    RESULT_MISS,
    RESULT_DODGE,
    RESULT_CRIT,
    RESULT_GLANCE
};

enum ItemSlot : int
{
    ITEM_HEAD,
    ITEM_NECK,
    ITEM_SHOULDER,
    ITEM_BACK,
    ITEM_CHEST,
    ITEM_WRIST,
    ITEM_HANDS,
    ITEM_WAIST,
    ITEM_LEGS,
    ITEM_FEET,
    ITEM_FINGER1,
    ITEM_FINGER2,
    ITEM_TRINKET1,
    ITEM_TRINKET2,
    ITEM_RANGED,
    ITEM_MAINHAND,
    ITEM_OFFHAND,
    ITEM_TWOHAND,
    ITEM_CUSTOM,

    NUM_ITEM_SLOTS
};

#pragma pack( push, 1 )
struct Config
{
    struct
    {
        int testId;
        int testType;
        int enchType;
        Race race;
        int weaponrng;
        int spelldamage;
    } player;

    struct Target
    {
        int level;
        int basearmor;
        int armor;
        int defense;
        int binaryresist;
        // this has to be on even offset
        double mitigation;
    } target;

    struct
    {
        int timesecsmin;
        int timesecsmax;
        int executeperc;
        int startrage;
        int iterations;
        int batching;
        int activeTank;
        double incswingdamage;
        double incswingtimer;
    } sim;
};
#pragma pack( pop )

struct Stats
{
    int aprace = 0;
    int ap = 0;
    int agi = 0;
    int str = 0;
    int hit = 0;
    int crit = 0;
    int spellcrit = 0;
    int skill[NUM_WEAPON_TYPES];

    double haste = 1.0;
    double strmod = 1.0;
    double agimod = 1.0;
    double dmgmod = 1.0;
    double apmod = 1.0;
};

struct Proc
{
    int chance;
    int physdmg = 0;
    int magicdmg = 0;
    bool binaryspell = false;
    int coeff = 0;
    int extra = 0;
    bool gcd = false;
    Aura* spell = nullptr;
};

struct RaceInfo
{
    int str;
    int agi;
    int sta;
    int intel;
    int ap;
    int skill[NUM_WEAPON_TYPES];
};

static RaceInfo races[] =
{
    { 117,  85, 109,  30, 160, { 0, 0, 0, 0, 0, 0 } }, // nightelf
    { 125,  75, 112,  25, 160, { 0, 0, 0, 0, 0, 0 } }, // tauren
};

template<class T>
class static_vector
{
public:
    template<class Src>
    static_vector( Src&& src )
        : begin_( std::begin( src ) )
        , end_( std::end( src ) )
    {
    }

    template<>
    static_vector( int&& )
        : begin_( nullptr )
        , end_( nullptr )
    {
    }

    size_t size() const
    {
        return end_ - begin_;
    }

    T& operator[]( size_t pos )
    {
        return begin_[pos];
    }

    const T& operator[]( size_t pos ) const
    {
        return begin_[pos];
    }

    T* begin()
    {
        return begin_;
    }
    T* end()
    {
        return end_;
    }

    const T* begin() const
    {
        return begin_;
    }
    const T* end() const
    {
        return end_;
    }

private:
    T* begin_;
    T* end_;
};

void seedrng( uint64_t a, uint64_t b );
double randreal();
int rng( int min, int max );
int rng10k();

template<class C, class V>
bool includes( const C& cont, const V& value )
{
    return std::find( std::begin( cont ), std::end( cont ), value ) != std::end( cont );
}
