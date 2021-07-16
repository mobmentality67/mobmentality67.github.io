#include "weapon.h"
#include "player.h"
#include "items.h"
#include "buffs.h"
#include "talents.h"

Weapon::Weapon( Player& player_, Item& item, Enchant* enchant, Enchant* tempenchant, bool offhand_, bool twohand_ )
    : player( player_ )
    , offhand( offhand_ )
    , twohand( twohand_ )
    , mindmg( item.weapon.mindmg )
    , maxdmg( item.weapon.maxdmg )
    , speed( item.weapon.speed )
    , type( (WeaponType) item.weapon.type )
{

    modifier = 1.0;
    normSpeed = 2.5;
    
    for ( auto& buff : Buffs )
    {
        if ( buff.active )
        {
            basebonusdmg += buff.stats.bonusdmg;
        }
    }
    if ( enchant )
    {
        basebonusdmg += enchant->stats.bonusdmg;
    }
    if ( tempenchant )
    {
        basebonusdmg += tempenchant->stats.bonusdmg;
    }
    if ( includes( player.items, 21189) )
    {
        basebonusdmg += 4;
    }
    bonusdmg = basebonusdmg;
}

double Weapon::dmg( int bonus ) const
{
    double result = ( player.weaponrng ? ( double )rng( mindmg + bonusdmg, maxdmg + bonusdmg ) : double( mindmg + maxdmg ) / 2.0 );
    result += double( bonusdmg + bonus ) + ( ( double )player.stats.ap / 14.0 ) * speed;
    return result * modifier;
}

double Weapon::avgdmg() const
{
    double result = double( mindmg + maxdmg ) / 2.0 + double( bonusdmg ) + ( ( double )player.stats.ap / 14.0 ) * normSpeed;
    return result * modifier * player.stats.dmgmod * ( 1 - player.armorReduction );
}

void Weapon::use()
{
    timer = int( speed * 1000 / player.stats.haste + 0.5 );
}
