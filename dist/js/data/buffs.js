var buffs = [
   {
      id: 25289,
      spellid: true,
      name: "Battle Shout",
      iconname: "Ability_Warrior_BattleShout",
      group: "battleshout",
      ap: 382,
   },
   {
      id: 469,
      spellid: true,
      name: "Commanding Shout",
      iconname: "ability_warrior_rallyingcry",
      group: "commshout",
      bonushp: 1350,
   },
   {
      id: 26990,
      spellid: true,
      name: "Mark of the Wild",
      iconname: "spell_nature_regeneration",
      group: "",
      bonusac: 459,
      str: 19,
      agi: 19,
      int: 19,
      sta: 19
   },
   {
      id: 20217,
      spellid: true,
      name: "Blessing of Kings",
      iconname: "spell_magic_magearmor",
      group: "",
      strmod: 10,
      agimod: 10,
      stammod: 10
   },
   {
      id: 27140,
      spellid: true,
      name: "Blessing of Might",
      iconname: "spell_holy_fistofjustice",
      group: "blessingmight",
      ap: 264
   },
   {
      id: 25359,
      spellid: true,
      name: "Grace of Air Totem",
      iconname: "spell_nature_invisibilitytotem",
      group: "graceair",
      agi: 88
   },
   {
      id: 8075,
      spellid: true,
      name: "Strength of Earth Totem",
      iconname: "spell_nature_earthbindtotem",
      group: "strengthearth",
      str: 99
   },
   {
      id: 13452,
      name: "Elixir of the Mongoose",
      iconname: "inv_potion_32",
      group: "elixir",
      agi: 25,
      critrating: 28
   },
   {
      id: 22831,
      name: "Elixir of Major Agility",
      iconname: "major_agility",
      group: "elixir",
      agi: 35,
      critrating: 20
   },
   {
      id: 22854,
      name: "Flask of Relentless Assault",
      iconname: "inv_potion_117",
      group: "elixir",
      ap: 120
   },
   {
      id: 22851,
      name: "Flask of Fortification",
      iconname: "inv_potion_119",
      group: "elixir",
      def: 10,
      bonushp: 500
   },
   {
      id: 33208,
      name: "Flask of Chromatic Wonder",
      iconname: "inv_potion_48",
      group: "elixir",
      agi: 18,
      sta: 18,
      str: 18
   },
   {
      id: 22849,
      name: "Ironshield Potion",
      iconname: "inv_potion_133",
      group: "potion",
      bonusac: 2500
   },
   {
      id: 32068,
      name: "Elixir of Ironskin",
      iconname: "inv_potion_159",
      group: "guardian",
      res: 30
   },
   {
      id: 27658,
      name: "Roasted Clefthoof",
      iconname: "roasted_clefthoof",
      group: "food",
      str: 20
   },
   {
      id: 27664,
      name: "Grilled Mudfish",
      iconname: "grilled_mudfish",
      group: "food",
      agi: 20
   },
   {
      id: 33872,
      name: "Spicy Hot Talbuk",
      iconname: "inv_misc_food_84_roastclefthoof",
      group: "food",
      hitrating: 20
   },
   {
      id: 33052,
      name: "Fisherman's Feast",
      iconname: "inv_misc_food_88_ravagernuggets",
      group: "food",
      sta: 30
   },
   {
      id: 27149,
      spellid: true,
      name: "Devotion Aura",
      iconname: "spell_holy_devotionaura",
      bonusac: 861
   },
   {
      id: 27268,
      spellid: true,
      name: "Blood Pact",
      iconname: "spell_shadow_bloodboil",
      sta: 77
   },
   {
      id: 27498,
      name: "Scroll of Agility V",
      iconname: "spell_holy_blessingofagility",
      group: "",
      agi: 20
   },
   {
      id: 27503,
      name: "Scroll of Strength V",
      iconname: "spell_nature_strength",
      group: "",
      str: 20
   },
   {
      id: 27500,
      name: "Scroll of Protection V",
      iconname: "ability_warrior_defensivestance",
      group: "",
      bonusac: 300
   },
   {
      id: 25389,
      spellid: true,
      name: "Power Word: Fortitude",
      iconname: "spell_holy_wordfortitude",
      group: "",
      sta: 102
   },
   {
      id: 33602,
      spellid: true,
      name: "Improved Faerie Fire",
      iconname: "spell_nature_faeriefire",
      group: "",
      hit: 3,
      debuff: true
   },
   {
      id: 6562,
      spellid: true,
      name: "Heroic Presence",
      iconname: "inv_helmet_21",
      group: "",
      hit: 1
   },
   {
      id: 30811,
      spellid: true,
      name: "Unleashed Rage",
      iconname: "spell_nature_unleashedrage",
      group: "",
      apmod: 10
   },
   {
      id: 29859,
      spellid: true,
      name: "Blood Frenzy",
      iconname: "ability_warrior_bloodfrenzy",
      group: "",
      dmgmod: 4,
      debuff: true
   },
   {
      id: 3043,
      spellid: true,
      name: "Scorpid Sting",
      group: "",
      iconname: "ability_hunter_criticalshot",
      incmiss: 5.0,
      debuff: true
   },
   {
      id: 34460,
      spellid: true,
      name: "Ferocious Inspiration",
      iconname: "ability_hunter_ferociousinspiration",
      group: "ferociousinspiration",
      dmgmod: 3,
      max_count: 4,
      count:1
   },
   {
      id: 23060,
      spellid: true,
      name: "Battle Squawk",
      iconname: "inv_misc_birdbeck",
      group: "squawk",
      max_count: 6,
      count:1
   },
   {
      id: 34503,
      spellid: true,
      name: "Expose Weakness",
      iconname: "ability_rogue_findweakness",
      ap: 225,
      debuff: true
   },
   {
      id: 2825,
      spellid: true,
      name: "Bloodlust",
      iconname: "spell_nature_bloodlust"
   },
   {
      id: 28507,
      spellid: true,
      name: "Haste Potion",
      group: "potion",
      iconname: "inv_potion_108"
   },
   {
      id: 14169,
      spellid: true,
      name: "Improved Expose Armor",
      iconname: "ability_warrior_riposte",
      debuff: true
   },
   {
      id: 27226,
      spellid: true,
      name: "Curse of Recklessness",
      iconname: "spell_shadow_unholystrength",
      debuff: true,
      bossapmod: 135,
   },
   {
      id: 25202,
      spellid: true,
      name: "Demoralizing Shout",
      iconname: "ability_warrior_warcry",
      debuff: true,
      bossapmod: -420,
   },
   {
      id: 24579,
      spellid: true,
      name: "Screech",
      iconname: "ability_hunter_pet_bat",
      debuff: true,
      bossapmod: -100,
   },   
   {
      id: 32394,
      spellid: true,
      name: "Shadow Embrace",
      iconname: "spell_shadow_shadowembrace",
      debuff: true,
      bossattackmod: -5,
   },
   {
      id: 12666,
      spellid: true,
      name: "Thunder Clap",
      iconname: "ability_thunderclap",
      debuff: true,
      bossattackspeedmod: 20,
   },
   {
      id: 45769,
      spellid: true,
      name: "Sunwell Radiance",
      iconname: "spell_holy_circleofrenewal",
      incmiss: -5.0,
      bossability: true,
      incdodgerating: -378.46
   },
   {
      id: 45185,
      spellid: true,
      name: "Stomp_Full",
      iconname: "ability_stomp_full",
      bossability: true,
      group: "bossability_unique"
   },
   {
      id: 4518500000,
      idoverride: 45185,
      spellid: true,
      name: "Stomp_Toggle",
      iconname: "ability_stomp_toggle",
      bossability: true,
      group: "bossability_unique"
   },
   {
      id: 31345,
      spellid: true,
      name: "Cleave",
      iconname: "ability_warrior_cleave",
      bossability: true,
      group: "bossability_unique"
   },
   {
      id: 45866,
      spellid: true,
      name: "Corrosion",
      iconname: "spell_nature_elementalshields",
      bossability: true,
      group: "bossability_unique"
   }

   
   
];