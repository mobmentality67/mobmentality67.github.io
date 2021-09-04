var talents = [
   {
      n: 'Balance',
      t: [
         {
            i: 111,
            n: 'Starlight Wrath',
            m: 5,
            s: [
               16814,
               16815,
               16816,
               16817,
               16818
            ],
            d: [
               'Reduces the cast time of your Wrath and Starfire spells by 0.1 sec',
               'Reduces the cast time of your Wrath and Starfire spells by 0.2 sec',
               'Reduces the cast time of your Wrath and Starfire spells by 0.3 sec',
               'Reduces the cast time of your Wrath and Starfire spells by 0.4 sec',
               'Reduces the cast time of your Wrath and Starfire spells by 0.5 sec',
            ],
            x: 0,
            y: 0,
            iconname: 'spell_nature_abolishmagic',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 112,
            n: 'Nature\'s Grasp',
            m: 1,
            s: [
               16812
            ],
            d: [
               'While active, any time an enemy strikes the caster they have a 35% chance to become afflicted by Entangling Roots (Rank 7).  Only useable outdoors.  1 charge.  Lasts 45 sec.',
            ],
            x: 1,
            y: 0,
            iconname: 'spell_nature_natureswrath',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 113,
            n: 'Improved Nature\'s Grasp',
            m: 4,
            s: [
               17245,
               17247,
               17248,
               17249,
            ],
            d: [
               'Increases the chance for your Nature\'s Grasp to entangle an enemy by 15%.',
               'Increases the chance for your Nature\'s Grasp to entangle an enemy by 30%.',
               'Increases the chance for your Nature\'s Grasp to entangle an enemy by 45%.',
               'Increases the chance for your Nature\'s Grasp to entangle an enemy by 65%.',
            ],
            x: 2,
            y: 0,
            iconname: 'spell_nature_natureswrath',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 121,
            n: 'Control of Nature',
            m: 3,
            s: [
               16918,
               16919,
               16290,
            ],
            d: [
               'Gives you a 40% chance to avoid interruption caused by damage while casting Entangling Roots and Cyclone.',
               'Gives you a 70% chance to avoid interruption caused by damage while casting Entangling Roots and Cyclone.',
               'Gives you a 100% chance to avoid interruption caused by damage while casting Entangling Roots and Cyclone.'
            ],
            x: 0,
            y: 1,
            iconname: 'spell_nature_stranglevines',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 122,
            n: 'Focused Starlight',
            m: 2,
            s: [
               35363,
               35364
            ],
            d: [
               'Increases the critical strike chance of your Wrath and Starfire spells by 2%.',
               'Increases the critical strike chance of your Wrath and Starfire spells by 4%.'
            ],
            x: 1,
            y: 1,
            iconname: 'inv_staff_01',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 123,
            n: 'Improved Moonfire',
            m: 2,
            s: [
               16281,
               16282
            ],
            d: [
               'Increases the damage and critical strike chance of your Moonfire spell by 5%.',
               'Increases the damage and critical strike chance of your Moonfire spell by 10%.'
            ],
            x: 2,
            y: 1,
            iconname: 'spell_nature_starfall',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 131,
            n: 'Improved Thorns',
            m: 3,
            s: [
               16238,
               16239,
               16840
            ],
            d: [
               'Increases damage caused by your Thorns and Entangling Roots spells by 25%.',
               'Increases damage caused by your Thorns and Entangling Roots spells by 50%.',
               'Increases damage caused by your Thorns and Entangling Roots spells by 75%.'
            ],
            x: 0,
            y: 2,
            iconname: 'spell_nature_thorns',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 133,
            n: 'Insect Swarm',
            m: 1,
            s: [
               27013
            ],
            d: [
               'The enemy target is swarmed by insects, decreasing their chance to hit by 2% and causing 792 Nature damage over 12 sec.'
            ],
            x: 2,
            y: 2,
            iconname: 'spell_nature_insectswarm',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 134,
            n: 'Nature\'s Reach',
            m: 2,
            s: [
               16819,
               16820
            ],
            d: [
               'Increases the range of your Balance spells and Faerie Fire (Feral) ability by 10%',
               'Increases the range of your Balance spells and Faerie Fire (Feral) ability by 20%',
            ],
            x: 3,
            y: 2,
            iconname: 'spell_nature_naturetouchgrow',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 142,
            n: 'Vengeance',
            m: 5,
            s: [
               16909,
               16910,
               16911,
               16912,
               16913,
            ],
            d: [
               'Increases the critical strike damage bonus of your Starfire, Moonfire, and Wrath spells by 20%',
               'Increases the critical strike damage bonus of your Starfire, Moonfire, and Wrath spells by 40%',
               'Increases the critical strike damage bonus of your Starfire, Moonfire, and Wrath spells by 60%',
               'Increases the critical strike damage bonus of your Starfire, Moonfire, and Wrath spells by 80%',
               'Increases the critical strike damage bonus of your Starfire, Moonfire, and Wrath spells by 100%',
            ],
            x: 1,
            y: 3,
            iconname: 'spell_nature_purge',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 143,
            n: 'Celestial Focus',
            m: 3,
            s: [
               16850,
               16992,
               16924,
            ],
            d: [
               'Gives your Starfire spell a 5% chance to stun the target for 3 sec and increases the chance you\'ll resist spell interruption when casting your Wrath spell by 25%',
               'Gives your Starfire spell a 10% chance to stun the target for 3 sec and increases the chance you\'ll resist spell interruption when casting your Wrath spell by 50%',
               'Gives your Starfire spell a 15% chance to stun the target for 3 sec and increases the chance you\'ll resist spell interruption when casting your Wrath spell by 70%'
            ],
            x: 2,
            y: 3,
            iconname: 'spell_arcane_starfire',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 151,
            n: 'Lunar Guidance',
            m: 3,
            s: [
               33589,
               33590,
               33591
            ],
            d: [
               'Increases your spell damage and healing by 8% of your total Intellect.',
               'Increases your spell damage and healing by 16% of your total Intellect.',
               'Increases your spell damage and healing by 25% of your total Intellect.'
            ],
            x: 0,
            y: 4,
            iconname: 'spell_arcane_starfire',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 152,
            n: 'Nature\'s Grace',
            m: 1,
            s: [
               16880
            ],
            d: [
               'All spell criticals grace you with a blessing of nature, reducing the casting time of your next spell by 0.5 sec.'
            ],
            x: 1,
            y: 4,
            iconname: 'spell_nature_naturesblessing',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 153,
            n: 'Moonglow',
            m: 3,
            s: [
               16845,
               16846,
               16847
            ],
            d: [
               'Reduces the Mana cost of your Moonfire, Starfire, Wrath, Healing Touch, Regrowth and Rejuvenation spells by 3%',
               'Reduces the Mana cost of your Moonfire, Starfire, Wrath, Healing Touch, Regrowth and Rejuvenation spells by 6%',
               'Reduces the Mana cost of your Moonfire, Starfire, Wrath, Healing Touch, Regrowth and Rejuvenation spells by 9%'
            ],
            x: 2,
            y: 4,
            iconname: 'spell_nature_sentinal',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 162,
            n: 'Moonfury',
            m: 5,
            s: [
               16896,
               16897,
               16899,
               16900,
               16901
            ],
            d: [
               'Increases the damage done by your Starfire, Moonfire and Wrath spells by 2%',
               'Increases the damage done by your Starfire, Moonfire and Wrath spells by 4%',
               'Increases the damage done by your Starfire, Moonfire and Wrath spells by 6%',
               'Increases the damage done by your Starfire, Moonfire and Wrath spells by 8%',
               'Increases the damage done by your Starfire, Moonfire and Wrath spells by 10%'
            ],
            x: 1,
            y: 5,
            iconname: 'spell_nature_moonglow',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 163,
            n: 'Balance of Power',
            m: 2,
            s: [
               33592,
               33596
            ],
            d: [
               'Increases your chance to hit with all spells and reduces the chance you\'ll be hit by spells by 2%',
               'Increases your chance to hit with all spells and reduces the chance you\'ll be hit by spells by 4%'
            ],
            x: 2,
            y: 5,
            iconname: 'ability_druid_balanceofpower',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 171,
            n: 'Dreamstate',
            m: 3,
            s: [
               33597,
               33599,
               33956
            ],
            d: [
               'Regenerate mana equal to 4% of your Intellect every 5 sec, even while casting',
               'Regenerate mana equal to 7% of your Intellect every 5 sec, even while casting',
               'Regenerate mana equal to 10% of your Intellect every 5 sec, even while casting'
            ],
            x: 0,
            y: 6,
            iconname: 'ability_druid_dreamstate',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 172,
            n: 'Moonkin Form',
            m: 1,
            s: [
               24858
            ],
            d: [
               'Shapeshift into Moonkin Form.  While in this form the armor contribution from items is increased by 400%, attack power is increased by 150% of your level and all party members within 30 yards have their spell critical chance increased by 5%.  Melee attacks in this form have a chance on hit to regenerate mana based on attack power.  The Moonkin can only cast Balance and Remove Curse spells while shapeshifted.The act of shapeshifting frees the caster of Polymorph and Movement Impairing effects.'
            ],
            x: 1,
            y: 6,
            iconname: 'spell_nature_forceofnature',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 173,
            n: 'Improved Faerie Fire',
            m: 3,
            s: [
               33600,
               33601,
               33602,
            ],
            d: [
               'Your Faerie Fire spell also increases the chance the target will be hit by melee and ranged attacks by 1%',
               'Your Faerie Fire spell also increases the chance the target will be hit by melee and ranged attacks by 2%',
               'Your Faerie Fire spell also increases the chance the target will be hit by melee and ranged attacks by 3%',
            ],
            x: 2,
            y: 6,
            iconname: 'spell_nature_faeriefire',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 182,
            n: 'Wrath of Cenarius',
            m: 5,
            s: [
               33603,
               33604,
               33605,
               33606,
               33607,
            ],
            d: [
               'Your Starfire spell gains an additional 4% and your Wrath gains an additional 2% of your bonus damage effects.',
               'Your Starfire spell gains an additional 4% and your Wrath gains an additional 4% of your bonus damage effects.',
               'Your Starfire spell gains an additional 4% and your Wrath gains an additional 6% of your bonus damage effects.',
               'Your Starfire spell gains an additional 4% and your Wrath gains an additional 8% of your bonus damage effects.',
               'Your Starfire spell gains an additional 4% and your Wrath gains an additional 10% of your bonus damage effects.',
            ],
            x: 1,
            y: 7,
            iconname: 'ability_druid_twilightswrath',
            c: 0,
            aura: function (count) {},
         },
         {
            i: 192,
            n: 'Force of Nature',
            m: 5,
            s: [
               33831
            ],
            d: [
               'Summons 3 treants to attack enemy targets for 30 sec.'
            ],
            x: 1,
            y: 8,
            iconname: 'ability_druid_forceofnature',
            c: 0,
            aura: function (count) {},
         },
      ]
   },
   {
      n: 'Feral Combat',
      t: [
         {
            i: 211,
            n: 'Ferocity',
            m: 5,
            s: [
               16934,
               16935,
               16936,
               16937,
               16938
            ],
            d: [
               'Reduces the cost of your Maul, Swipe, Claw, Rake and Mangle abilities by 1 Rage or Energy',
               'Reduces the cost of your Maul, Swipe, Claw, Rake and Mangle abilities by 2 Rage or Energy',
               'Reduces the cost of your Maul, Swipe, Claw, Rake and Mangle abilities by 3 Rage or Energy',
               'Reduces the cost of your Maul, Swipe, Claw, Rake and Mangle abilities by 4 Rage or Energy',
               'Reduces the cost of your Maul, Swipe, Claw, Rake and Mangle abilities by 5 Rage or Energy',
            ],
            x: 1,
            y: 0,
            iconname: 'ferocity',
            c: 112,
            aura: function (count) { return { ferocity: count } },
         },
         {
            i: 212,
            n: 'Feral Aggression',
            m: 5,
            s: [
               16858,
               16859,
               16860,
               16861,
               16862
            ],
            d: [
               'Increases the attack power reduction of your Demoralizing Roar by 8% and the damage caused by your Ferocious Bite by 3%',
               'Increases the attack power reduction of your Demoralizing Roar by 16% and the damage caused by your Ferocious Bite by 6%',
               'Increases the attack power reduction of your Demoralizing Roar by 24% and the damage caused by your Ferocious Bite by 9%',
               'Increases the attack power reduction of your Demoralizing Roar by 32% and the damage caused by your Ferocious Bite by 12%',
               'Increases the attack power reduction of your Demoralizing Roar by 40% and the damage caused by your Ferocious Bite by 15%',
            ],
            x: 2,
            y: 0,
            iconname: 'demoralizingroar',
            c: 0,
            aura: function (count) { return { feralaggressionmod: count * 0.08 } },
         },
         {
            i: 221,
            n: 'Feral Instinct',
            m: 3,
            s: [
               16947,
               16948,
               16949
            ],
            d: [
               'Increases threat caused in Bear and Dire Bear Form by 5% and reduces the chance enemies have to detect you while Prowling..',
               'Increases threat caused in Bear and Dire Bear Form by 10% and reduces the chance enemies have to detect you while Prowling..',
               'Increases threat caused in Bear and Dire Bear Form by 15% and reduces the chance enemies have to detect you while Prowling..'
            ],
            x: 0,
            y: 1,
            iconname: 'ability_ambush',
            c: 0,
            aura: function (count) { return { feralinstinctmod: count * 0.05 } },
         },
         {
            i: 222,
            n: 'Brutal Impact',
            m: 2,
            s: [
               16940,
               16941
            ],
            d: [
               'Increases the stun duration of your Bash and Pounce abilities by 0.5 sec.',
               'Increases the stun duration of your Bash and Pounce abilities by 1 sec.',
            ],
            x: 1,
            y: 1,
            iconname: 'ability_druid_bash',
            c: 0,
            aura: function (count) { return { } },
         },
         {
            i: 223,
            n: 'Thick Hide',
            m: 3,
            s: [
               16929,
               16930,
               16931
            ],
            d: [
               'Increases your armor contribution from items by 4%.',
               'Increases your armor contribution from items by 7%.'
            ],
            x: 2,
            y: 1,
            c: 0,
            iconname: 'thickhide',
            aura: function (count) { return { thickhidemod: 1 + Math.ceil(count * 3.3)*0.01 } },
         },
         {
            i: 231,
            n: 'Feral Swiftness',
            m: 2,
            s: [
               17002,
               24866
            ],
            d: [
               'Increases your movement speed by 15% while outdoors in Cat Form and increases your chance to dodge while in Cat Form, Bear Form and Dire Bear Form by 2%',
               'Increases your movement speed by 30% while outdoors in Cat Form and increases your chance to dodge while in Cat Form, Bear Form and Dire Bear Form by 4%',
            ],
            x: 0,
            y: 2,
            c: 0,
            iconname: 'spell_nature_spiritwolf',
            aura: function (count) { return { feralswiftnessmod: 2 * count} },
         },         
         {
            i: 311,
            n: 'Feral Charge',
            m: 2,
            s: [
               16979
            ],
            d: [
               'Causes you to charge an enemy, immobilizing and interrupting any spell being cast for 4 sec'
            ],
            x: 1,
            y: 2,
            c: 0,
            iconname: 'ability_hunter_pet_bear',
            aura: function (count) { return { } },
         },
         {
            i: 233,
            n: 'Sharpened Claws',
            m: 3,
            s: [
               16942,
               16943,
               16944
            ],
            d: [
               'Increases your critical strike chance while in Bear, Dire Bear or Cat Form by 2%.',
               'Increases your critical strike chance while in Bear, Dire Bear or Cat Form by 4%.',
               'Increases your critical strike chance while in Bear, Dire Bear or Cat Form by 6%.'
            ],
            x: 2,
            y: 2,
            c: 0,
            iconname: 'inv_misc_monsterclaw',
            aura: function (count) { return { sharpenedclawsmod: count * 2 } },
         },
         {
            i: 241,
            n: 'Shredding Attacks',
            m: 2,
            s: [
               16967,
               16968
            ],
            d: [
               'Reduces the energy cost of your Shred ability by 9 and the rage cost of your Lacerate ability by 1',
               'Reduces the energy cost of your Shred ability by 18 and the rage cost of your Lacerate ability by 2',
            ],
            x: 0,
            y: 3,
            c: 0,
            iconname: 'spell_shadow_vampiricaura',
            aura: function (count) { return { shreddingattacks: count} },
         },
         {
            i: 242,
            n: 'Predatory Strikes',
            m: 3,
            s: [
               16972,
               16974,
               16975
            ],
            d: [
               'Increases your melee attack power in Cat, Bear, Dire Bear and Moonkin Forms by 50% of your level.',
               'Increases your melee attack power in Cat, Bear, Dire Bear and Moonkin Forms by 100% of your level.',
               'Increases your melee attack power in Cat, Bear, Dire Bear and Moonkin Forms by 150% of your level.'
            ],
            x: 1,
            y: 3,
            c: 0,
            iconname: 'ability_hunter_pet_cat',
            aura: function (count) { return { predatorystrikes: count } },
         },
         {
            i: 243,
            n: 'Primal Fury',
            m: 2,
            s: [
               37116,
               37117
            ],
            d: [
               'Gives you a 50% chance to gain an additional 5 Rage anytime you get a \
               critical strike while in Bear and Dire Bear Form and your critical strikes \
               from Cat Form abilities that add combo points  have a 100% chance to add an additional combo point.',
               'Gives you a 100% chance to gain an additional 5 Rage anytime you get a \
               critical strike while in Bear and Dire Bear Form and your critical strikes \
               from Cat Form abilities that add combo points  have a 100% chance to add an additional combo point.'
            ],
            x: 2,
            y: 3,
            c: 0,
            iconname: 'ability_racial_cannibalize',
            aura: function (count) { return { primalfury: count } },
         },
         {
            i: 251,
            n: 'Savage Fury',
            m: 2,
            s: [
               16997,
               16998
            ],
            d: [
               'Increases the damage caused by your Claw, Rake, and Mangle (Cat) abilities by 10%.',
               'Increases the damage caused by your Claw, Rake, and Mangle (Cat) abilities by 20%.'
            ],
            x: 0,
            y: 4,
            c: 0,
            iconname: 'ability_druid_ravage',
            aura: function (count) { return { savagefurymod: 1.0 + 0.1*count } },
         },
         {
            i: 253,
            n: 'Faerie Fire (Feral)',
            m: 1,
            s: [
               27011
            ],
            d: [
               'Decrease the armor of the target by 610 for 40 sec.  While affected, the target cannot stealth or turn invisible'
            ],
            x: 2,
            y: 4,
            c: 0,
            iconname: 'spell_nature_faeriefire',
            aura: function (count) { return {  } },
         },
         {
            i: 254,
            n: 'Nurturing Instinct',
            m: 1,
            s: [
               33873
            ],
            d: [
               'Increases your healing spells by up to 100% of your Agility, and increases healing done to you by 20% while in Cat form.'
            ],
            x: 3,
            y: 4,
            c: 0,
            iconname: 'ability_druid_healinginstincts',
            aura: function (count) { return {  } },
         },
         {
            i: 261,
            n: 'Heart of the Wild',
            m: 5,
            s: [
               17003,
               17004,
               17005,
               17006,
               24894
            ],
            d: [
               'Increases your Intellect by 4%.  In addition, while in Bear or Dire Bear Form your Stamina is increased by 4% and while in Cat Form your attack power is increased by 2%',
               'Increases your Intellect by 8%.  In addition, while in Bear or Dire Bear Form your Stamina is increased by 8% and while in Cat Form your attack power is increased by 4%',
               'Increases your Intellect by 12%.  In addition, while in Bear or Dire Bear Form your Stamina is increased by 12% and while in Cat Form your attack power is increased by 6%',
               'Increases your Intellect by 16%.  In addition, while in Bear or Dire Bear Form your Stamina is increased by 16% and while in Cat Form your attack power is increased by 8%',
               'Increases your Intellect by 20%.  In addition, while in Bear or Dire Bear Form your Stamina is increased by 20% and while in Cat Form your attack power is increased by 10%'
            ],
            x: 1,
            y: 5,
            c: 0,
            iconname: 'spell_holy_blessingofagility',
            aura: function (count) { return { heartofthewild: count } },
         },
         {
            i: 262,
            n: 'Survival of the Fittest',
            m: 3,
            s: [
               33853,
               33855,
               33856
            ],
            d: [
               'Increases all attributes by 1% and reduces the chance you\'ll be critically hit by melee attacks by 1%.',
               'Increases all attributes by 2% and reduces the chance you\'ll be critically hit by melee attacks by 2%.',
               'Increases all attributes by 3% and reduces the chance you\'ll be critically hit by melee attacks by 3%.',
            ],
            x: 2,
            y: 5,
            c: 0,
            iconname: 'ability_druid_enrage',
            aura: function (count) { return { survivalofthefittest: count } },
         },
         {
            i: 271,
            n: 'Primal Tenacity',
            m: 3,
            s: [
               33851,
               33852,
               33957
            ],
            d: [
                'Increases your chance to resist Stun and Fear mechanics by 5%.',
                'Increases your chance to resist Stun and Fear mechanics by 10%.',
                'Increases your chance to resist Stun and Fear mechanics by 15%.'
            ],
            x: 0,
            y: 6,
            c: 0,
            iconname: 'ability_druid_primaltenacity',
            aura: function (count) { return {  } },
         },
         {
            i: 272,
            n: 'Leader of the Pack',
            m: 1,
            s: [
               24932
            ],
            d: [
               'Increases ranged and melee critical chance by 5%.'
            ],
            x: 1,
            y: 6,
            c: 0,
            iconname: 'spell_nature_unyeildingstamina',
            aura: function (count) { return { abilitiescrit: count * 5 } },
         },
         {
            i: 273,
            n: 'Improved Leader of the Pack',
            m: 1,
            s: [
               34297,
               34300
            ],
            d: [
               'Your Leader of the Pack ability also causes affected targets to have a 50% chance to heal themselves for 2% of their total health when they critically hit with a melee or ranged attack.  The healing effect cannot occur more than once every 6 sec.',
               'Your Leader of the Pack ability also causes affected targets to have a 100% chance to heal themselves for 4% of their total health when they critically hit with a melee or ranged attack.  The healing effect cannot occur more than once every 6 sec.'
            ],
            x: 2,
            y: 6,
            c: 0,
            iconname: 'spell_nature_unyeildingstamina',
            aura: function (count) { return {  } },
         },
         {
            i: 281,
            n: 'Predatory Instincts',
            m: 5,
            s: [
               33859,
               33866,
               33867,
               33868,
               33869
            ],
            d: [
               'While in Cat Form, Bear Form, or Dire Bear Form, increases your damage from melee critical strikes by 2% and your chance to avoid area effect attacks by 3%.',
               'While in Cat Form, Bear Form, or Dire Bear Form, increases your damage from melee critical strikes by 4% and your chance to avoid area effect attacks by 6%.',
               'While in Cat Form, Bear Form, or Dire Bear Form, increases your damage from melee critical strikes by 6% and your chance to avoid area effect attacks by 9%.',
               'While in Cat Form, Bear Form, or Dire Bear Form, increases your damage from melee critical strikes by 8% and your chance to avoid area effect attacks by 12%.',
               'While in Cat Form, Bear Form, or Dire Bear Form, increases your damage from melee critical strikes by 10% and your chance to avoid area effect attacks by 15%.'
            ],
            x: 2,
            y: 7,
            c: 0,
            iconname: 'ability_druid_predatoryinstincts',
            aura: function (count) { return { predatoryinstincts: count } },
         },
         {
            i: 291,
            n: 'Mangle',
            m: 1,
            s: [
               33917
            ],
            d: [
               'Mangle the target, inflicting damage and causing the target to take additional damage from bleed effects for 12 sec.  \
                This ability can be used in Cat Form or Dire Bear Form.'
            ],
            x: 1,
            y: 8,
            c: 0,
            iconname: 'ability_druid_mangle2',
            aura: function (count) { return { mangle: count } },
         }
      ]
   },
   {
      n: 'Restoration',
      t: [
         {
            i: 321,
            n: 'Naturalist',
            m: 5,
            s: [
               17069,
               12870,
               12871,
               17072,
               17073
            ],
            d: [
               'Reduces the cast time of your Healing Touch spell by 0.1 sec and increases the damage you deal with physical attacks in all forms by 2%.',
               'Reduces the cast time of your Healing Touch spell by 0.2 sec and increases the damage you deal with physical attacks in all forms by 4%.',
               'Reduces the cast time of your Healing Touch spell by 0.3 sec and increases the damage you deal with physical attacks in all forms by 6%.',
               'Reduces the cast time of your Healing Touch spell by 0.4 sec and increases the damage you deal with physical attacks in all forms by 8%.',
               'Reduces the cast time of your Healing Touch spell by 0.5 sec and increases the damage you deal with physical attacks in all forms by 10%.'
            ],
            x: 0,
            y: 1,
            c: 0,
            iconname: 'spell_nature_healingtouch',
            aura: function (count) { return { naturalistmod: .02*count } },
         },
         {
            i: 331,
            n: 'Intensity',
            m: 3,
            s: [
               17106,
               17107,
               17108,
            ],
            d: [
               'Allows 10% of your Mana regeneration to continue while casting and causes your Enrage ability to instantly generate 4 rage..',
               'Allows 20% of your Mana regeneration to continue while casting and causes your Enrage ability to instantly generate 7 rage..',
               'Allows 30% of your Mana regeneration to continue while casting and causes your Enrage ability to instantly generate 10 rage..'
            ],
            x: 0,
            y: 2,
            c: 0,
            iconname: 'spell_frost_windwalkon',
            aura: function (count) { return { intensity: count } }
         },
         {
            i: 333,
            n: 'Omen of Clarity',
            m: 1,
            s: [
               16864
            ],
            d: [
               'Imbues the Druid with natural energy.  Each of the Druid\'s melee attacks has a chance of causing the caster to enter a Clearcasting state.  The Clearcasting state reduces the Mana, Rage or Energy cost of your next damage or healing spell or offensive ability by 100%.  Lasts 30 min'
            ],
            x: 2,
            y: 2,
            c: 0,
            iconname: 'spell_nature_crystalball',
            aura: function (count) { return { ooc: count } },
         },
      ]
   }
];
