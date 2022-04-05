importScripts(
    // './data/buffs.min.js',
    // './data/gear.min.js',
    // './data/races.min.js',
    // './data/spells.min.js',
    // './data/talents.min.js',
    // './classes/player.min.js',
    // './classes/simulation.min.js',
    // './classes/spell.min.js',
    // './classes/weapon.min.js',
    // './globals.min.js',
    // './WarriorSim.min.js',

    './data/buffs.js',
    './data/gear.js',
    './data/races.js',
    './data/spells.js',
    './data/talents.js',
    './classes/player.js',
    './classes/simulation.js',
    './classes/spell.js',
    './classes/weapon.js',
    './globals.js',
    './WarriorSim.js',
);

onmessage = (event) => {
    const params = event.data;
    updateGlobals(params.globals);

    const wasm = true ? fetch('./WarriorSim.wasm').then(r => r.arrayBuffer()).then(binary => WarriorSim({ wasmBinary: binary }).ready) : Promise.reject();

    wasm.then(module => {
        const itemSlots = ['head', 'neck', 'shoulder', 'back', 'chest', 'wrist', 'hands',
          'waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2', 'ranged',
          'mainhand', 'offhand', 'twohand', 'custom'];
        const races = ['Night Elf', 'Tauren'];

        const rng = [...Array(8)].map(() => Math.floor(Math.random() * 65536));
        module._initRandom(...rng);

        for (let id of params.globals.buffs) {
            module._enableBuff(id, 1);
        }
        for (let slot in params.globals.enchant) {
            const slotId = itemSlots.indexOf(slot);
            for (let item of params.globals.enchant[slot]) {
                if (item.selected) {
                    module._enableEnchant(slotId, item.id, 1);
                }
            }
        }
        for (let slot in params.globals.gem) {
            const slotId = itemSlots.indexOf(slot);
            for (let gemSlot = 0; i < ui.MAX_GEMS[slot]; i++) {
                for (let item of params.globals.gem[slot]) {
                    if (item.selected) {
                        module._enableGem(slotId, item.id, 1);
                    }
                }
            }
        }
        for (let slot in params.globals.gear) {
            const slotId = itemSlots.indexOf(slot);
            for (let item of params.globals.gear[slot]) {
                if (item.selected) {
                    module._enableItem(slotId, item.id, 1);
                }
            }
        }

        function spellOptions(index, ...fields) {
            const opt = params.globals.rotation[index];
            const ptr = module._spellOptions(opt.id) >> 2;
            module.HEAP32[ptr] = opt.active ? 1 : 0;
            fields.forEach((f, i) => module.HEAP32[ptr + i + 1] = opt[f]);
        }
        spellOptions(0, "reaction"); // Mangle
        spellOptions(1, "minrage", "maincd", "reaction", "priorityap"); // Swipe
        spellOptions(2, "minrage", "maincd", "reaction"); // Lacerate
        spellOptions(3, "minrage", "reaction"); // Maul
        spellOptions(4, "reaction"); // Faerie Fire 

        const configPtr = module._allocConfig();
        const cfg = configPtr >> 2;
        module.HEAP32[cfg + 0] = params.player[0] != null ? params.player[0] : -1;
        module.HEAP32[cfg + 1] = params.player[1] != null ? (typeof params.player[1] === 'string' ? itemSlots.indexOf(params.player[1]) : params.player[1]) : -1;
        module.HEAP32[cfg + 2] = params.player[2] != null ? params.player[2] : -1;
        module.HEAP32[cfg + 3] = races.indexOf(params.player[3].race);
        module.HEAP32[cfg + 4] = params.player[3].weaponrng ? 1 : 0;
        module.HEAP32[cfg + 5] = params.player[3].spelldamage;
        module.HEAP32[cfg + 7] = params.player[3].target.basearmor;
        module.HEAP32[cfg + 8] = params.player[3].target.armor;
        module.HEAP32[cfg + 9] = params.player[3].target.defense;
        module.HEAP32[cfg + 10] = params.player[3].target.binaryresist;
        module.HEAP32[cfg + 11] = params.sim.timesecsmin;
        module.HEAP32[cfg + 12] = params.sim.timesecsmax;
        module.HEAP32[cfg + 13] = params.sim.startrage;
        module.HEAP32[cfg + 14] = params.sim.iterations;
        module.HEAP32[cfg + 15] = params.sim.batching;
        module.HEAP32[cfg + 16] = params.sim.activetank;
        module.HEAP32[cfg + 17] = params.sim.incswingtimer;
        module.HEAP32[cfg + 18] = params.sim.incswingdamage;
        module.HEAP32[cfg + 19] = params.sim.pullvariancethreshold;
        module.HEAP32[cfg + 20] = params.sim.pullvariancetime;
        module.HEAP32[cfg + 21] = params.sim.pullvariancemdthreat;
        module.HEAP32[cfg + 22] = params.sim.inchpslifebloom;
        module.HEAP32[cfg + 23] = params.sim.incheal;
        module.HEAP32[cfg + 24] = params.sim.defensivethreshold;

        const talentsPtr = module._allocTalents();
        for (let tree of talents) {
            for (let talent of tree.t) {
                if (talent.c) {
                    module._setTalent(talentsPtr, talent.i, talent.c);
                }
            }
        }

        const simPtr = module._allocSimulation(configPtr, talentsPtr);
        module._runSimulation(simPtr);
        module._reportSimulation(simPtr, params.fullReport ? 1 : 0);
        module._freeSimulation(simPtr);
        module._freeTalents(talentsPtr);
        module._freeConfig(configPtr);
    }, err => {
        console.error(err);
        // console.log('starting sim-worker', params);
        const player = new Player(...params.player);
        const sim = new Simulation(player, (report) => {
            // Finished
            if (params.fullReport) {
                report.player = player.serializeStats();
                report.spread = sim.spread;
                report.tpsspread = sim.tpsspread;
                report.ehp = sim.ehp;
            }
            postMessage([TYPE.FINISHED, report]);
        }, (iteration, report) => {
            // Update
            postMessage([TYPE.UPDATE, iteration, report]);
        }, params.sim);
        sim.startSync();
    }).catch(error => {
        postMessage([TYPE.ERROR, error]);
    });
};

// console.log('sim-worker loaded');
