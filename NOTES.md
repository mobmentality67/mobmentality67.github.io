Notes
=====

Beary Good Sim is still a work in progress. Still in development:

# Parameters
Threat values are very sensitive to the fight parameters. This primarily means fight length, rotation, buffs, and other equipped gear.

For example, a short fight length will heavily favor on-use trinkets -- so will a fight length that allows for exactly 2 trinket uses (i.e. Bloodlust Brooch in a 140 second fight). It's recommended that you sim with a reasonable time range in fight duration to avoid the effects of a single additional swing skewing the results and that a longer fight length is chosen to reflect TBC boss tuning (4 minutes+). Note that longer fights will affect simulation length.

# Gem support
	 Gem support is still in early development:
	 * Socket bonus and meta gem socket bonus checks are not enabled
	 * Meta gems will always be activated. Socket bonuses will never be activated
	 * Full implementation planned
# Custom
	 * Custom values in the "Custom" tab can be used to offset gem bonuses if necessary

# Bug Reports
This is an alpha-stage project and bugs are expected. This includes, but is not restricted to individual item values and/or links to Wowhead. This data is manually entered and read over, but errors are expected. Errors may also appear in the algorithms themselves for simulating the fight. 

If anything looks out of sort, please file an issue at https://github.com/mobmentality67/mobmentality67.github.io/issues (preferred), open a PR (even better), or message me on Discord mobmentality#9406. Please verify that this is not already reported at the above issues link.

# Porting
This is directly ported from Guybrush's Warrior Sim, with the vast, vast majority of work on the UI itself done by Guybrush and other contributors. See https://github.com/GuybrushGit/WarriorSim for the original repository and its history. Porting this to work for TBC Feral Druid involved gutting the algorithms surrounding damage, adding damage taken, rotation, and adding tank parameters.

# References
Lots of the work that went into the algorithm rework was built from excellent work from others. This includes, but is not limited to,
    * Nerdegghead's TBC Bear Stat Weights Calculator at https://docs.google.com/spreadsheets/d/1oKzPko-lXrOD-WSm4x2XdxD96USKSLEZoq8l2r6W3tI/edit?usp=sharing. I encourage everyone to use this tool to review bear gearing decisions.
    * Magey's TBC Warrior Attack Table: https://github-wiki-see.page/m/magey/tbc-warrior/wiki/Attack-table
    * Zidnae's TBC Bear Theorycrafting Notes: https://zidnae.gitlab.io/tbc-armor-penetration-calc/tbc_bear_tc.html
    * Other discussion on the fantastic Druid Discord: https://discord.gg/B6HcVrPqk2. 