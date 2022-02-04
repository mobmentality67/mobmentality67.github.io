var MAX_GEMS = {
    head: 2,
    neck: 2,
    shoulder: 2,
    chest: 3,
    wrist: 1,
    hands: 2,
    waist: 2,
    legs: 3,
    feet: 2, 
};

function getGlobalsDelta() {
    const _gear = {};
    for (const type in gear) {
        _gear[type] = gear[type].map((item) => {
            return {
                id: item.id,
                tps: item.tps,
                ehp: item.ehp,
                selected: item.selected,
                hidden: item.hidden,
            }
        });
    }
    const _enchant = {};
    for (const type in enchant) {
        _enchant[type] = enchant[type].map((item) => {
            return {
                id: item.id,
                tps: item.tps,
                ehp: item.ehp,
                selected: item.selected,
                hidden: item.hidden,
            }
        });
    }
    const _gem = {};
    for (const type in gem) {
        _gem[type] = {};
        for (let i = 0; i < MAX_GEMS[type]; i++) {

            _gem[type][i] = Object.values(gem[type][i]).map((item) => {
                return {
                    id: item.id,
                    tps: item.tps,
                    ehp: item.ehp,
                    selected: item.selected,
                    hidden: item.hidden,
                }
            });
        }
    }

    const _buffs = {};
    let activeBuffs = 0;
    for (let i = 0; i < buffs.length; i++) {
        if (buffs[i].active) {
            activeBuffs++;
            _buffs[activeBuffs] = buffs[i].id;
        } 
    }

    return {
        talents: talents.map((tree) => {
            return {
                t: tree.t.map((talent) => talent.c),
            };
        }),
        buffs: buffs,
        rotation: spells,
        gear: _gear,
        enchant: _enchant,
        gem: _gem,
    }
}

function updateGlobals(params) {
    for (let tree in params.talents) {
        for (let talent in params.talents[tree].t) {
            talents[tree].t[talent].c = params.talents[tree].t[talent];
        }
    }

    for (let i of params.buffs) {
        let buffID;
        let buffCount;
        let runtime;

        if (i.id) {
            buffID = i.id;
            buffCount = i.count;
            runtime = true;
        }
        else {
            buffID = Object.keys(i)[0];
            buffCount = i[buffID];
            runtime = false;
        }

        for (let j of buffs) {
            if (buffID == j.id) {
                if (!runtime || i.active) {
                    j.active = true;
                    if (j.count) {
                        j.count = parseInt(buffCount);
                    }
                }
            }
        }
    }

    for (let i of params.rotation)
        for (let j of spells)
            if (i.id == j.id)
                for (let prop in i)
                    j[prop] = i[prop];

    for (let type in params.gear)
        for (let i of params.gear[type])
            if (gear[type])
                for (let j of gear[type])
                    if (i.id == j.id) {
                        j.tps = i.tps;
                        j.ehp = i.ehp;
                        j.selected = i.selected;
                        j.hidden = i.hidden;
                    }

    for (let type in params.enchant)
        for (let i of params.enchant[type])
            for (let j of enchant[type])
                if (i.id == j.id) {
                    j.tps = i.tps;
                    j.ehp = i.ehp;
                    j.selected = i.selected;
                    j.hidden = i.hidden;
                }

    /* Reorganize the gem array to avoid needing to 
       code a copy of gems in every slot for every piece of gear */
    let newGem = {};
    for (let type in gem) {
        newGem[type] = {};
        for (let i = 0; i < MAX_GEMS[type]; i++) {
            newGem[type][i] = {};
            for (let gemIndex = 0; gemIndex < gem[type].length; gemIndex++) {
                newGem[type][i][gemIndex] = JSON.parse(JSON.stringify(gem[type][gemIndex]));
            }
        }
    }
    gem = newGem;
    for (let type in params.gem)
        for (let gemIndex = 0; gemIndex < MAX_GEMS[type]; gemIndex++) {
            if ((params.gem[type][gemIndex])) {
                for (let i of Object.values(params.gem[type][gemIndex])) {
                    for (let j of Object.values(gem[type][gemIndex]))
                        if (i.id == j.id) {
                           j.tps = i.tps;
                           j.ehp = i.ehp;
                           j.selected = i.selected;
                           j.hidden = i.hidden;
                        }
                }
            }
        }
}
