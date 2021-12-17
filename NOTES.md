Notes
=====

Beary Good Sim is still very much a work in progress. Below are details about various simulation sections.

## Parameters
Threat values are very sensitive to the fight parameters. This primarily means fight length, rotation, buffs, and other equipped gear.

For example, a short fight length will heavily favor on-use trinkets -- so will a fight length that allows for exactly 2 trinket uses (i.e. Bloodlust Brooch in a 140 second fight). It's recommended that you sim with a reasonable time range in fight duration to avoid the effects of a single additional swing skewing the results and that a longer fight length is chosen to reflect TBC boss tuning (4 minutes+). Note that longer fights will affect simulation length.

Trinket 1 is always activated before Trinket 2, if applicable. Double-on use (chain use or concurrent use where applicable) is supported.

## Gem support
JC gems are not implemented. Most applicable blue gems are in -- some gems are hidden by default. Click "Show/hide rows" below gems to see all implemented gems.

## Custom Parameters
Custom values in the "Custom" tab can be used to offset gem bonuses and test stat weights if necessary.

## Bug Reports
This is an alpha-stage project and bugs are expected. This includes, but is not restricted to individual item values and/or links to Wowhead. This data is manually entered and read over, but errors are expected. Errors may also appear in the algorithms themselves for simulating the fight. 

If anything looks out of sort, please file an issue at https://github.com/mobmentality67/mobmentality67.github.io/issues (preferred), open a PR (even better), or message me on Discord mobmentality#9406. Please verify that this is not already reported at the above issues link.

## Debugging
The "Stats" view is helpful for debugging oddities in the fight from a high level (especially the attack table breakdown). To observe a single fight, set simulations = 1 in Settings and simulate a run, then open your browser's Console and (F12 in chrome) to view the output log.

## Porting
This is directly ported from Guybrush's Warrior Sim, with the vast, vast majority of work on the UI itself done by Guybrush and other contributors. See https://github.com/GuybrushGit/WarriorSim for the original repository and its history. Porting this to work for TBC Feral Druid involved gutting the algorithms surrounding damage, adding damage taken, rotation, and adding tank parameters.

## References
Lots of the work that went into the algorithm rework was built from excellent work by others. This includes, but is not limited to,
* Nerdegghead's TBC Bear Stat Weights Calculator at https://docs.google.com/spreadsheets/d/1oKzPko-lXrOD-WSm4x2XdxD96USKSLEZoq8l2r6W3tI/edit?usp=sharing. I encourage everyone to use this tool to review bear gearing decisions.
* Magey's TBC Warrior Attack Table: https://github-wiki-see.page/m/magey/tbc-warrior/wiki/Attack-table
* Zidnae's TBC Bear Theorycrafting Notes: https://zidnae.gitlab.io/tbc-armor-penetration-calc/tbc_bear_tc.html
* Other discussion on the fantastic Druid Discord: https://discord.gg/B6HcVrPqk2. 
* Special thank you to Balor-Anathema for tons of incredible work verifying and testing this project to make it sane

## Contributions
I'm happy to work on this without any contributions -- I think it's an interesting collaborative discussion and effort and I like to have the tool available for the community. But if you want to buy me coffee, here's my PayPal anyways: paypal.me/mobmentality67. Thank you!