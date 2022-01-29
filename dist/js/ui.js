const MAX_WORKERS = navigator.hardwareConcurrency || 8;

var SIM = SIM || {}

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

SIM.UI = {

    init: function () {
        var view = this;
        view.variables();
        view.events();
        view.loadSession();
        view.loadWeapons("twohand");
        view.updateSidebar();

        view.body.on('click', '.wh-tooltip, .tablesorter-default a', function (e) {
            e.preventDefault();
        });

    },

    variables: function () {
        var view = this;
        view.body = $('body');
        view.buffs = view.body.find('article.buffs');
        view.fight = view.body.find('article.fight');
        view.rotation = view.body.find('article.rotation');
        view.talents = view.body.find('article.talents');
        view.filter = view.body.find('article.filter');
        view.main = view.body.find('section.main');
        view.sidebar = view.body.find('section.sidebar');
        view.tcontainer = view.main.find('.table-container');
        view.alerts = view.body.find('.alerts');
        view.progress = view.main.find('progress');
    },

    events: function () {
        var view = this;

        view.sidebar.find('.js-settings').click(function (e) {
            e.preventDefault();
            $(this).toggleClass('active');
            window.scrollTo(0, 0);
            $('section.settings').height(view.body.outerHeight());
            $('section.settings').toggleClass('active');
            view.sidebar.find('.js-stats').removeClass('active');
            $('section.stats').removeClass('active');
        });

        // view.sidebar.find('.js-saveconfig').ready(function (e) {
        //     e.preventDefault();
        //     $('.js-saveconfig')
        //     .mouseenter(function() {
        //       $('.popup').show();
        //     })
        // });

        // view.sidebar.find('.js-loadconfig').click(function (e) {
        //     e.preventDefault();
        //     var input = $(document.createElement("input"));
        //     input.attr("type", "file");
        //     // add onchange handler if you wish to get the file :)
        //     input.trigger("click"); // opening dialog
        //     return false; // avoiding navigation
        // });

        view.sidebar.find('.js-dps').click(function (e) {
            e.preventDefault();
            view.disableEditMode();
            view.startLoading();
            view.simulateDPS();
        });

        view.sidebar.find('.js-weights').click(function (e) {
            e.preventDefault();
            view.disableEditMode();
            view.startLoading();
            view.simulateDPS("stats");
        });

        view.sidebar.find('.js-stats').click(function (e) {
            e.preventDefault();
            $(this).toggleClass('active');
            $('section.stats').toggleClass('active');
            view.sidebar.find('.js-settings').removeClass('active');
            $('section.settings').removeClass('active');
        });

        view.body.on('click', '.js-table', function(e) {
            e.preventDefault();
            view.disableEditMode();
            const rows = view.tcontainer.find('table.gear tbody tr');
            rows.addClass('waiting');
            view.tcontainer.find('table.gear tbody tr td:last-of-type').html('');
            view.startLoading();
            view.simulateDPS(rows);
        });

        view.body.on('click', '.js-table-all', function(e) {
            e.preventDefault();
            view.disableEditMode();
            const rows = view.tcontainer.find('table.gear tbody tr');
            rows.addClass('waiting');
            view.tcontainer.find('table.gear tbody tr td:last-of-type').html('');
            view.startLoading();
            view.simulateDPS(rows, true);
        });

        view.main.on('click', '.js-enchant', function(e) {
            e.preventDefault();
            view.disableEditMode();
            const rows = view.tcontainer.find('table.enchant tbody tr'); 
            rows.addClass('waiting');
            view.tcontainer.find('table.enchant tbody tr td:last-of-type').html('');
            view.startLoading();
            view.simulateDPS(rows);
        });

        view.main.on('click', '.js-gem', function(e) {
            e.preventDefault();
            view.disableEditMode();
            const rows = view.tcontainer.find('table.gem tbody tr'); 
            rows.addClass('waiting');
            view.tcontainer.find('table.gem tbody tr td:last-of-type').html('');
            view.startLoading();
            view.simulateDPS(rows);
        });

        view.main.on('click', '.js-editmode', function(e) {
            e.preventDefault();
            $(this).toggleClass('active');
            window.scrollTo(0, 0);
            let active = $(this).hasClass('active');
            if (active) view.enableEditMode();
            else view.disableEditMode();
        });

        view.main.find('nav li p').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            let li = $(this).parent();
            li.addClass('active');
            li.siblings().removeClass('active');
            var type = li.data('type');
            if (!type) type = li.parents('[data-type]').data('type');

            if (type == "mainhand" || type == "offhand" || type == "twohand") 
                view.loadWeapons(type);
            else if (type == "custom") 
                view.loadCustom();
            else
                view.loadGear(type);
        });

        view.tcontainer.on('click', 'table.gear td:not(.ppm)', function(e) {
            var table = $(this).parents('table');
            var type = table.data('type');
            var max = table.data('max');
            var tr = $(this).parent();

            if (table.hasClass('editmode')) {
                if (tr.hasClass('hidden'))
                    view.rowShowItem(tr);
                else
                    view.rowHideItem(tr);
                return;
            }

            if (tr.hasClass('active')) {
                view.rowDisableItem(tr);
            }
            else {
                var counter = table.find('tr.active').length;
                if (counter >= max) view.rowDisableItem(table.find('tr.active').last());
                view.rowEnableItem(tr);
            }

            view.updateSession();
            view.updateSidebar();
        });

        view.tcontainer.on('click', 'table.enchant td:not(.ppm)', function(e) {
            var table = $(this).parents('table');
            var tr = $(this).parent();
            var temp = tr.data('temp');

            if (table.hasClass('editmode')) {
                if (tr.hasClass('hidden'))
                    view.rowShowEnchant(tr);
                else
                    view.rowHideEnchant(tr);
                return;
            }

            if (tr.hasClass('active')) {
                view.rowDisableEnchant(tr);
            }
            else {
                let disable = table.find('tr.active[data-temp="' + temp + '"]').first();
                if (disable.length) view.rowDisableEnchant(disable);
                view.rowEnableEnchant(tr);
            }

            view.updateSession();
            view.updateSidebar();
        });

        view.tcontainer.on('click', 'table.gem td:not(.ppm)', function(e) {
            var table = $(this).parents('table');
            var tr = $(this).parent();
            var meta = tr.data('meta');
            var max = table.data('max');

            if (table.hasClass('editmode')) {
                if (tr.hasClass('hidden'))
                    view.rowShowGem(tr);
                else
                    view.rowHideGem(tr);
                return;
            }

             if (tr.hasClass('active')) {
                view.rowDisableGem(tr);
            }
            else {
                let disable = table.find('tr.active[data-meta="' + meta + '"]').first();
                if (disable.length) view.rowDisableGem(disable);
                view.rowEnableGem(tr);
            }

            view.updateSession();
            view.updateSidebar();
        });

    },

    enableEditMode: function() {
        var view = this;
        let type = view.tcontainer.find('table.gear').attr('data-type');
        if (type == "mainhand" || type == "offhand" || type == "twohand") 
            view.loadWeapons(type, true);
        else if (type == "custom") 
            view.loadCustom(true);
        else
            view.loadGear(type, true);
    },

    disableEditMode: function() {
        var view = this;
        view.main.find('.js-editmode').removeClass('active');
        let type = view.tcontainer.find('table.gear').attr('data-type');
        if (type == "mainhand" || type == "offhand" || type == "twohand") 
            view.loadWeapons(type, false);
        else if (type == "custom") 
            view.loadCustom(false);
        else
            view.loadGear(type, false);
    },

    simulateDPS: function(rows, all) {
        let view = this;
        let tps = view.sidebar.find('#tps');
        let dps = view.sidebar.find('#dps');
        let error = view.sidebar.find('#dpserr');
        let stats = view.sidebar.find('#stats');
        let tpsstats = view.sidebar.find('#tpsstats');
        let dtps = view.sidebar.find('#dtps');
        let dtpsstats = view.sidebar.find('#dtpsstats');
        let time = view.sidebar.find('#time');
        let pullvar = view.sidebar.find('#pullvar');
        let btn = view.sidebar.find('.js-dps');
        let weights = (rows === "stats");
        if (weights) {
            rows = undefined;
        }
        tps.text('');
        dps.text('');
        dtps.text('');
        error.text('');
        time.text('');
        pullvar.text('');
        const params = {
            player: [undefined, undefined, undefined, Player.getConfig()],
            sim: Simulation.getConfig(),
            fullReport: true,
        };
        if (rows) {
            let type = rows.parents('table').data('type');
            if (type == "finger" || type == "trinket" || type == "custom")
                params.player = [null, type, undefined, Player.getConfig()];
        }
        player = new Player(...params.player);
        if (!player.mh) {
            view.addAlert('No weapon selected');
            view.endLoading();
            return;
        }
        var sim = new SimulationWorkerParallel(
            MAX_WORKERS,
            (report) => {
                // Finished
                // Technically, it is incorrect to calculate mean DPS like this, since fight duration varies...
                const mean = report.totaldmg / report.totalduration;
                const meantps = report.totalthreat / report.totalduration;
                const meandtps = report.totaldamagetaken / report.totalduration;
                tps.text(meantps.toFixed(2));
                dps.text(mean.toFixed(2));
                dtps.text(meandtps.toFixed(2));

                const s1 = report.sumthreat, s2 = report.sumthreat2, n = report.iterations;
                const varmean = (s2 - s1 * s1 / n) / (n - 1) / n;
                error.text((1.96 * Math.sqrt(varmean)).toFixed(2));

                pullvar.text((report.pullvariancemet / report.iterations * 100).toFixed(2));
                time.text((report.endtime - report.starttime) / 1000);
                stats.html(report.mindps.toFixed(2) + ' min&nbsp;&nbsp;&nbsp;&nbsp;' + report.maxdps.toFixed(2) + ' max');
                tpsstats.html(report.mintps.toFixed(2) + ' min&nbsp;&nbsp;&nbsp;&nbsp;' + report.maxtps.toFixed(2) + ' max');
                dtpsstats.html(report.mindtps.toFixed(2) + ' min&nbsp;&nbsp;&nbsp;&nbsp;' + report.maxdtps.toFixed(2) + ' max');
                btn.css('background', '');
                if (rows && all) view.simulateAllRows(Array.from(rows));
                else if (rows) view.simulateRows(Array.from(rows));
                else if (weights) view.simulateWeights(player, meantps, varmean);
                else view.endLoading();

                SIM.STATS.initCharts(report);
                sim = null;
                player = null;
                
            },
            (iteration, report) => {
                // Update
                let perc = parseInt(iteration / report.iterations * 100);
                tps.text((report.totalthreat / report.totalduration).toFixed(2));
                dps.text((report.totaldmg / report.totalduration).toFixed(2));
                dtps.text((report.totaldamagetaken / report.totalduration).toFixed(2));
                btn.css('background', 'linear-gradient(to right, transparent ' + perc + '%, #444 ' + perc + '%)');
            },
            (error) => {
                dps.text('ERROR');
                console.error(error);
            },
        );
        sim.start(params);
    },

    simulateWeights: function(player, mean, varmean) {
        const view = this;
        const btn = view.sidebar.find('.js-weights');
        const totalTasks = 3
        view.sidebar.find('#weights-div').css('display', 'block');
        view.sidebar.find('#weights-div > div').addClass('loading').append('<span class="spinner"><span class="bounce1"></span><span class="bounce2"></span><span class="bounce3"></span></span>');
        let tasksDone = 0;
        function updateFn(progress) {
            const perc = parseInt(100 * (tasksDone + progress) / totalTasks);
            btn.css('background', 'linear-gradient(to right, transparent ' + perc + '%, #444 ' + perc + '%)');
        }
        const simulateWeight = (stat, amount) => this.simulateStat(stat, amount, updateFn).then(result => {
            tasksDone += 1;
            return {weight: (result.mean - mean) / amount, error: 1.96 * Math.sqrt(varmean + result.varmean) / amount};
        });
        function updateStat(name, {weight, error}) {
            const line = view.sidebar.find('#weight-' + name);
            line.removeClass('loading').find('.spinner').remove();
            line.find('.stat-dps').text(weight.toFixed(2));
            line.find('.stat-error').text(error.toFixed(2));
        }
        async function simulateAll() {
            const ap = await simulateWeight(0, 50);
            updateStat("ap", ap);

            const strAp = 2 * player.stats.strmod;
            updateStat("str", {weight: ap.weight * strAp, error: ap.error * strAp});

            const crit = await simulateWeight(1, 2);
            updateStat("crit", crit);

            const agi = await simulateWeight(4, 25);
            updateStat("agi", {weight: agi.weight, error: agi.error});

            updateStat("hit", await simulateWeight(2, 1));

            const haste = await simulateWeight(5, 157);
            updateStat("haste", {weight: haste.weight * (10*82/52), error: haste.error * (10*82/52)});

        }

        simulateAll().then(
            () => {
                btn.css('background', '');
                view.endLoading();
            },
            error => {
                btn.css('background', '');
                view.sidebar.find('#tps').text('ERROR');
                view.sidebar.find('#dps').text('ERROR');
                view.sidebar.find('#dpserr').text('');
                view.endLoading();
                console.error(error);
            },
        );
    },

    simulateStat: function(stat, amount, updateFn) {
        return new Promise((resolve, reject) => {
            const params = {
                player: [amount, stat, 3, Player.getConfig()],
                sim: Simulation.getConfig(),
            };
            var sim = new SimulationWorkerParallel(
                MAX_WORKERS,
                (report) => {
                    const mean = report.totalthreat / report.totalduration;

                    const s1 = report.sumthreat, s2 = report.sumthreat2, n = report.iterations;
                    const varmean = (s2 - s1 * s1 / n) / (n - 1) / n;

                    resolve({mean, varmean});
                },
                (iteration, report) => {
                    if (updateFn) updateFn(iteration / report.iterations, report.totalthreat / report.totalduration);
                },
                (error) => reject(error),
            );
            sim.start(params);
        });
    },

    simulateRows: function(rows) {
        var view = this;
        var btn = view.sidebar.find('.js-table');

        const simulations = rows.map((row) => {
            const simulation = { perc: 0 };
            simulation.run = () => {
                // Remove from pending simulations
                pending.delete(simulation);

                // Start simulation
                this.simulateRow($(row), (perc) => {
                    // Update row percentage
                    simulation.perc = perc;

                    // Update total percentage
                    const total = Math.floor(
                        Array.from(simulations.values())
                            .map((sim) => sim.perc)
                            .reduce((a, b) => a + b, 0) / rows.length
                    );
                    if (total == 100) {
                        btn.css('background', '');
                        view.endLoading();
                        view.updateSession();
                    } else {
                        btn.css('background', 'linear-gradient(to right, transparent ' + total + '%, #444 ' + total + '%)');
                    }

                    // If simulation complete, run another pending simulation (if any)
                    if (simulation.perc == 100) {
                        const next = pending.values().next().value;
                        if (next) {
                            next.run();
                        }
                    }
                });
            };
            return simulation;
        });
        const pending = new Set(simulations);

        for (const simulation of simulations.slice(0, MAX_WORKERS)) {
            simulation.run();
        }
    },

    simulateAllRows: function(rows) {
        var view = this;
        var btn = view.sidebar.find('.js-table-all');
        console.log(rows)
        var tabType = $(rows[0]).parents('table').data('type');

        var simulations = rows.map((row) => {
            const simulation = { perc: 0 };
            simulation.run = () => {
                // Remove from pending simulations
                pending.delete(simulation);

                // Start simulation
                this.simulateRow($(row), (perc) => {
                    // Update row percentage
                    simulation.perc = perc;

                    // Update total percentage
                    const total = Math.floor(
                        Array.from(simulations.values())
                            .map((sim) => sim.perc)
                            .reduce((a, b) => a + b, 0) / simulations.length
                    );
                    if (total == 100) {
                        btn.css('background', '');
                        view.endLoading();
                        view.updateSession();
                    } else {
                        btn.css('background', 'linear-gradient(to right, transparent ' + total + '%, #444 ' + total + '%)');
                    }

                    // If simulation complete, run another pending simulation (if any)
                    if (simulation.perc == 100) {
                        const next = pending.values().next().value;
                        if (next) {
                            next.run();
                        }
                    }
                });
            };
            return simulation;
        });

        for (let type in gear) {
            if(type != tabType){
                simulations = simulations.concat(gear[type].map((item) => {
                    const simulation = { perc: 0 };
                    simulation.run = () => {
                        // Remove from pending simulations
                        pending.delete(simulation);
        
                        // Start simulation
                        console.log(item)
                        this.simulateItem(type, item.id, false, false, false, false, (perc) => {
                            // Update row percentage
                            simulation.perc = perc;
                            
                            // Update total percentage
                            const total = Math.floor(
                                Array.from(simulations.values())
                                    .map((sim) => sim.perc)
                                    .reduce((a, b) => a + b, 0) / simulations.length
                            );
                            if (total == 100) {
                                console.log(total)
                                btn.css('background', '');
                                view.endLoading();
                                view.updateSession();
                            } else {
                                console.log(total)
                                btn.css('background', 'linear-gradient(to right, transparent ' + total + '%, #444 ' + total + '%)');
                            }
        
                            // If simulation complete, run another pending simulation (if any)
                            if (simulation.perc == 100) {
                                const next = pending.values().next().value;
                                if (next) {
                                    next.run();
                                }
                            }
                        });
                    };
                    return simulation;
                }));
            }
        }

        for (let type in enchant) {
            if(type != tabType){
                simulations = simulations.concat(enchant[type].map((item) => {
                    const simulation = { perc: 0 };
                    simulation.run = () => {
                        // Remove from pending simulations
                        pending.delete(simulation);
        
                        // Start simulation
                        console.log(item)
                        this.simulateItem(type, item.id, true, false, false, false, (perc) => {
                            // Update row percentage
                            simulation.perc = perc;
                            
                            // Update total percentage
                            const total = Math.floor(
                                Array.from(simulations.values())
                                    .map((sim) => sim.perc)
                                    .reduce((a, b) => a + b, 0) / simulations.length
                            );
                            if (total == 100) {
                                console.log(total)
                                btn.css('background', '');
                                view.endLoading();
                                view.updateSession();
                            } else {
                                console.log(total)
                                btn.css('background', 'linear-gradient(to right, transparent ' + total + '%, #444 ' + total + '%)');
                            }
        
                            // If simulation complete, run another pending simulation (if any)
                            if (simulation.perc == 100) {
                                const next = pending.values().next().value;
                                if (next) {
                                    next.run();
                                }
                            }
                        });
                    };
                    return simulation;
                }));
            }
        }

        for (let type in gem) {
            if(type != tabType){
                for (let gemIndex = 0; gemIndex < MAX_GEMS[type]; gemIndex++) {
                    simulations = simulations.concat(Object.values(gem[type][gemIndex]).map((item) => {
                        const simulation = { perc: 0 };
                        simulation.run = () => {
                            // Remove from pending simulations
                            pending.delete(simulation);
            
                            // Start simulation
                            console.log(item)
                            this.simulateItem(type, item.id, false, true, false, false, (perc) => {
                                // Update row percentage
                                simulation.perc = perc;
                                
                                // Update total percentage
                                const total = Math.floor(
                                    Array.from(simulations.values())
                                        .map((sim) => sim.perc)
                                        .reduce((a, b) => a + b, 0) / simulations.length
                                );
                                if (total == 100) {
                                    console.log(total)
                                    btn.css('background', '');
                                    view.endLoading();
                                    view.updateSession();
                                } else {
                                    console.log(total)
                                    btn.css('background', 'linear-gradient(to right, transparent ' + total + '%, #444 ' + total + '%)');
                                }
            
                                // If simulation complete, run another pending simulation (if any)
                                if (simulation.perc == 100) {
                                    const next = pending.values().next().value;
                                    if (next) {
                                        next.run();
                                    }
                                }
                            });
                        };
                        return simulation;
                    }));
                }
            }
        }

        
        const pending = new Set(simulations);

        for (const simulation of simulations.slice(0, MAX_WORKERS)) {
            simulation.run();
        }
    },

    simulateRow: function(tr, updateFn) {
        var view = this;
        var dps = tr.find('td:last-of-type');
        var tps = tr.find('td:last-of-type');
        var ehp = tr.find('td:nth-last-of-type(2)');
        var type = tr.parents('table').data('type');
        var item = tr.data('id');
        var isench = tr.parents('table').hasClass('enchant');
        var isgem = tr.parents('table').hasClass('gem');
        var istemp = tr.data('temp') == true;
        var ismeta = tr.data('meta') == true;
        var base = parseFloat(view.sidebar.find('#dps').text());
        var basetps = parseFloat(view.sidebar.find('#tps').text());

        const params = {
            player: [item, type, ismeta ? 4 : istemp ? 2 : isench ? 1 : 0, Player.getConfig()],
            sim: Simulation.getConfig(),
        };
        var sim = new SimulationWorker(
            (report) => {
                // Finished
                //let span = $('<span></span>');
                let spantps = $('<span></span>');
                let calc = report.totaldmg / report.totalduration;
                let calctps = report.totalthreat / report.totalduration;
                let diff = calc - base;
                let difftps = calctps - basetps;
                //span.text(difftps.toFixed(2));
                spantps.text(difftps.toFixed(2));
                //if (diff >= 0) span.addClass('p');
                //else span.addClass('n');
                if (difftps >= 0) spantps.addClass('p');
                else spantps.addClass('n');
                //dps.text(calc.toFixed(2)).append(span);
                tps.text(calctps.toFixed(2)).append(spantps);
                ehp.text(report.ehp.toFixed(2) || 0);

                view.tcontainer.find('table').each(function() {
                    if (type == "custom") return;
                    $(this).trigger('update');
                    let sortList = [[$(this).find('th').length - 1, 1]];
                    $(this).trigger("sorton", [sortList]);
                });
                
                tr.removeClass('waiting');
                updateFn(100);
                sim = null;

                if (isench) {
                    for(let i of enchant[type])
                        if (i.id == item) {
                            i.tps = calctps.toFixed(2);
                            i.ehp = report.ehp.toFixed(2) || 0;
                        }
                }

                if (isgem) {
                    for (let gemIndex = 0; gemIndex < MAX_GEMS[type]; gemIndex++) {
                        for(let i of Object.values(gem[type][gemIndex])){
                            if (i.id == item) {
                                i.tps = calctps.toFixed(2);
                                i.ehp = report.ehp.toFixed(2) || 0;
                            }
                        }
                    }
                }


                else {
                    for(let i of gear[type])
                        if (i.id == item) {
                            i.tps = calctps.toFixed(2);
                            i.ehp = report.ehp.toFixed(2) || 0;
                        }
                }
            },
            (iteration, report) => {
                // Update
                updateFn(Math.floor((iteration / report.iterations) * 100));
                dps.text((report.totaldmg / report.totalduration).toFixed(2));
                tps.text((report.totalthreat / report.totalduration).toFixed(2));
                if(dtps && typeof dtps.text == "function"){
                dtps.text((report.totaldamagetaken / report.totalduration).toFixed(2));
                }
            },
            (error) => {
                dps.text('ERROR');
                tps.text('ERROR');
                console.error(error);
            },
        );
        sim.start(params);
    },

    simulateItem: function(type, item, isench, isgem, istemp, ismeta, updateFn) {
        var view = this;
        var base = parseFloat(view.sidebar.find('#dps').text());
        var basetps = parseFloat(view.sidebar.find('#tps').text());

        const params = {
            player: [item, type, ismeta ? 4 : istemp ? 2 : isench ? 1 : 0, Player.getConfig()],
            sim: Simulation.getConfig(),
        };
        console.log(params)
        if(params.sim.iterations > 1000 || true){
            params.sim.iterations = parseInt($('input[name="simulationsall"]').val());
        }
        var sim = new SimulationWorker(
            (report) => {
                // Finished
                //let span = $('<span></span>');
                //let spantps = $('<span></span>');
                let calc = report.totaldmg / report.totalduration;
                let calctps = report.totalthreat / report.totalduration;
                let diff = calc - base;
                let difftps = calctps - basetps;
                //span.text(difftps.toFixed(2));
                //spantps.text(difftps.toFixed(2));
                //if (diff >= 0) span.addClass('p');
                //else span.addClass('n');
                //if (difftps >= 0) spantps.addClass('p');
                //else spantps.addClass('n');
                //dps.text(calc.toFixed(2)).append(span);
                //tps.text(calctps.toFixed(2)).append(spantps);
                //ehp.text(report.ehp.toFixed(2) || 0);

                //view.tcontainer.find('table').each(function() {
                //    if (type == "custom") return;
                //    $(this).trigger('update');
                //    let sortList = [[$(this).find('th').length - 1, 1]];
                //    $(this).trigger("sorton", [sortList]);
                //});
                
                //tr.removeClass('waiting');
                updateFn(100);
                sim = null;

                if (isench) {
                    for(let i of enchant[type])
                        if (i.id == item) {
                            i.tps = calctps.toFixed(2);
                            i.ehp = report.ehp.toFixed(2) || 0;
                        }
                }

                if (isgem) {
                    for (let gemIndex = 0; gemIndex < MAX_GEMS[type]; gemIndex++) {
                        for(let i of Object.values(gem[type][gemIndex])){
                            if (i.id == item) {
                                i.tps = calctps.toFixed(2);
                                i.ehp = report.ehp.toFixed(2) || 0;
                            }
                        }
                    }
                }


                else {
                    console.log(type)
                    for(let i of gear[type])
                        if (i.id == item) {
                            i.tps = calctps.toFixed(2);
                            i.ehp = report.ehp.toFixed(2) || 0;
                        }
                }
            },
            (iteration, report) => {
                // Update
                updateFn(Math.floor((iteration / report.iterations) * 100));
            },
            (error) => {
                dps.text('ERROR');
                tps.text('ERROR');
                console.error(error);
            },
        );
        sim.start(params);
    },

    rowDisableItem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.removeClass('active');
        for(let i = 0; i < gear[type].length; i++) {
            if (gear[type][i].id == tr.data('id'))
                gear[type][i].selected = false;
        }
    },

    rowEnableItem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.addClass('active');
        for(let i = 0; i < gear[type].length; i++) {
            if (gear[type][i].id == tr.data('id'))
                gear[type][i].selected = true;
            else if (type != "finger" && type != "trinket" && type != "custom")
                gear[type][i].selected = false;
        }

        if (type == "twohand") {
            for(let i = 0; i < gear.mainhand.length; i++)
                gear.mainhand[i].selected = false;
            for(let i = 0; i < gear.offhand.length; i++)
                gear.offhand[i].selected = false;
            for(let i = 0; i < enchant.mainhand.length; i++)
                enchant.mainhand[i].selected = false;
            for(let i = 0; i < enchant.offhand.length; i++)
                enchant.offhand[i].selected = false;
        }

        if (type == "mainhand" || type == "offhand") {
            for(let i = 0; i < gear.twohand.length; i++)
                gear.twohand[i].selected = false;
            for(let i = 0; i < enchant.twohand.length; i++)
                enchant.twohand[i].selected = false;
        }

        //view.loadGems(type, table.hasClass('editmode'), activeItem);
    },

    rowHideItem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.removeClass('active');
        tr.addClass('hidden');
        tr.find('.hide').html(eyesvghidden);
        for(let i = 0; i < gear[type].length; i++) {
            if (gear[type][i].id == tr.data('id')) {
                gear[type][i].hidden = true;
                gear[type][i].selected = false;
            }
        }
    },

    rowShowItem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.removeClass('hidden');
        tr.find('.hide').html(eyesvg);
        for(let i = 0; i < gear[type].length; i++) {
            if (gear[type][i].id == tr.data('id'))
                gear[type][i].hidden = false;
        }
    },

    rowDisableEnchant: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.removeClass('active');
        for(let i = 0; i < enchant[type].length; i++) {
            if (enchant[type][i].id == tr.data('id'))
                enchant[type][i].selected = false;
        }
    },

    rowEnableEnchant: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.addClass('active');
        for(let i = 0; i < enchant[type].length; i++) {
            if (enchant[type][i].id == tr.data('id'))
                enchant[type][i].selected = true;
        }
    },

    rowDisableGem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        var gem_index = table.data('gem-index');
        tr.removeClass('active');
        for(let item of Object.values(gem[type][gem_index])) {
            if (item.id == tr.data('id'))
                item.selected = false;
        }
    },

    rowEnableGem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        var gem_index = table.data('gem-index');
        tr.addClass('active');
        for(let item of Object.values(gem[type][gem_index])) {
            if (item.id == tr.data('id'))
                item.selected = true;
        }
    },

    rowHideEnchant: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.removeClass('active');
        tr.addClass('hidden');
        tr.find('.hide').html(eyesvghidden);
        for(let i = 0; i < enchant[type].length; i++) {
            if (enchant[type][i].id == tr.data('id')) {
                enchant[type][i].hidden = true;
                enchant[type][i].selected = false;
            }
        }
    },

    rowShowEnchant: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        tr.removeClass('hidden');
        tr.find('.hide').html(eyesvg);
        for(let i = 0; i < enchant[type].length; i++) {
            if (enchant[type][i].id == tr.data('id'))
                enchant[type][i].hidden = false;
        }
    },

    rowHideGem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        var index = table.data('gem-index');
        tr.removeClass('active');
        tr.addClass('hidden');
        tr.find('.hide').html(eyesvghidden);
        for(let item of Object.values(gem[type][index])) {
           if (item.id == tr.data('id')) {
               item.hidden = true;
               item.selected = false;
           }
        }
    },

    rowShowGem: function(tr) {
        var table = tr.parents('table');
        var type = table.data('type');
        var index = table.data('gem-index');
        tr.removeClass('hidden');
        tr.find('.hide').html(eyesvg);
        for(let item of Object.values(gem[type][index])) {
           if (item.id == tr.data('id')) {
               item.hidden = false;
           }
        }
    },

    startLoading: function() {
        let btns = $('.js-dps, .js-weights, .js-table, .js-table-all, .js-enchant, js-gem');
        btns.addClass('loading');
        btns.append('<span class="spinner"><span class="bounce1"></span><span class="bounce2"></span><span class="bounce3"></span></span>');
        $('section.main nav').addClass('loading');
    },

    endLoading: function() {
        let btns = $('.js-dps, .js-weights, .js-table, .js-table-all, .js-enchant, js-gem');
        btns.removeClass('loading');
        btns.find('.spinner').remove();
        $('section.main nav').removeClass('loading');
    },

    updateSidebar: function () {
        var view = this;
        var player = new Player();

        // Calculate current hit
        let fullhit = (player.stats.hit + player.stats.hitrating / (10*82/52)).toFixed(2);

        let space = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        if (!player.mh) return;
        view.sidebar.find('#sta').text(player.stats.sta);
        view.sidebar.find('#armor').html((player.stats.ac.toFixed(2) || 0));
        view.sidebar.find('#def').html(((player.level * 5 + player.stats.def) || 0).toFixed(2));
        view.sidebar.find('#res').html((player.stats.res || 0));
        view.sidebar.find('#ehp').html((player.getEHP().toFixed(2) || 0));
        view.sidebar.find('#inccrit').html((player.stats.inccrit.toFixed(2) || 0));
        view.sidebar.find('#incmiss').html((player.stats.incmiss.toFixed(2) || 0));
        view.sidebar.find('#incdodge').html((player.stats.incdodge.toFixed(2) || 0));
        view.sidebar.find('#ap').text(player.stats.ap);
        view.sidebar.find('#agi').text(player.stats.agi);
        view.sidebar.find('#hit').html((fullhit || 0) + '%');
        let mhcrit = player.crit + player.mh.crit;
        view.sidebar.find('#crit').html(mhcrit.toFixed(2));
        view.sidebar.find('#expertise').text(player.stats.exp);
        let mhcap = 100 - player.mh.dodge - player.mh.glanceChance;
        let dmgmod = player.stats.dmgmod * 100;
        view.sidebar.find('#dmgmod').html(dmgmod.toFixed(2));
        view.sidebar.find('#haste').html((player.stats.haste * 100).toFixed(2) + '%');
        view.sidebar.find('#race').text(localStorage.race);
        view.sidebar.find('#sets').empty();
        view.sidebar.find('#metagem').empty();

        for (let set of sets) {
            let counter = 0;
            for (let item of set.items)
                if (player.items.includes(item))
                    counter++;
            if (counter == 0)
                continue;
            if (counter >= set.bonus[0].count)
                view.sidebar.find('#sets').append(`<a href="https://tbc.wowhead.com/item-set=${set.id}" class="q4">${set.name} (${counter})</a><br />`);
        }
        view.sidebar.find('#metagem').append(`${player.activemetagem}<br />`);
    },

    updateSession: function () {
        var view = this;

        localStorage.level = view.fight.find('input[name="level"]').val();
        localStorage.race = view.fight.find('select[name="race"]').val();
        localStorage.simulations = view.fight.find('input[name="simulations"]').val();
        localStorage.simulationsall = view.fight.find('input[name="simulationsall"]').val();
        localStorage.timesecsmin = view.fight.find('input[name="timesecsmin"]').val();
        localStorage.timesecsmax = view.fight.find('input[name="timesecsmax"]').val();
        localStorage.startrage = view.fight.find('input[name="startrage"]').val();
        localStorage.targetlevel = view.fight.find('input[name="targetlevel"]').val();
        localStorage.targetarmor = view.fight.find('input[name="targetarmor"]').val();
        localStorage.targetresistance = view.fight.find('input[name="targetresistance"]').val();
        localStorage.adjacent = view.fight.find('input[name="adjacent"]').val();
        localStorage.adjacentlevel = view.fight.find('input[name="adjacentlevel"]').val();
        localStorage.weaponrng = view.fight.find('select[name="weaponrng"]').val();
        localStorage.spelldamage = view.fight.find('input[name="spelldamage"]').val();
        localStorage.activetank = view.fight.find('select[name="activetank"]').val();
        localStorage.bosscrush = view.fight.find('select[name="bosscrush"]').val();
        localStorage.bossdw = view.fight.find('select[name="bossdw"]').val();
        localStorage.incswingtimer = view.fight.find('input[name="incswingtimer"]').val();
        localStorage.incswingdamage = view.fight.find('input[name="incswingdamage"]').val();
        localStorage.pullvariancethreshold = parseFloat($('input[name="pullvariancethreshold"]').val());
        localStorage.pullvariancetime = parseFloat($('input[name="pullvariancetime"]').val());
        localStorage.pullvariancemdthreat = parseFloat($('input[name="pullvariancemdthreat"]').val());

        let _buffs = [], _rotation = [], _talents = [], _sources = [], _phases = [], _gear = {}, _enchant = {}, _gem = {};
        view.buffs.find('.active').each(function () { 
            var buff_count_pair = {};
            let buffid = String($(this).attr('data-id'));
            let count = $(this).data('count') ? $(this).data('count') : "1";
            buff_count_pair[buffid] = String(count);
            _buffs.push(buff_count_pair);
        });
        view.filter.find('.sources .active').each(function () { _sources.push($(this).attr('data-id')); });
        view.filter.find('.phases .active').each(function () { _phases.push($(this).attr('data-id')); });

        for (let tree of talents) {
            let arr = [];
            for (let talent of tree.t)
                arr.push(talent.c);
            _talents.push({ n: tree.n, t: arr });
        }

        view.rotation.find('.spell').each(function () {
            var sp = {};
            sp.id = $(this).attr('data-id');
            sp.active = $(this).hasClass('active');
            $(this).find('input').each(function () {
                sp[$(this).attr('name')] = $(this).val();
            });
            _rotation.push(sp);
        });

        for (let type in gear) {
            _gear[type] = [];
            for (let item of gear[type]) {
                _gear[type].push({id:item.id,selected:item.selected,tps:item.tps,hidden:item.hidden,ehp:item.ehp});
            }
        }

        for (let type in enchant) {
            _enchant[type] = [];
            for (let item of enchant[type]) {
                _enchant[type].push({id:item.id,selected:item.selected,tps:item.tps,hidden:item.hidden,ehp:item.ehp});
            }
        }

        for (let type in gem) {
            _gem[type] = [];
            for (let gemIndex = 0; gemIndex < MAX_GEMS[type]; gemIndex++) {
                _gem[type][gemIndex] =  [];
                for (let item of Object.values(gem[type][gemIndex])) {
                    _gem[type][gemIndex].push({id:item.id,selected:item.selected,tps:item.tps,hidden:item.hidden,ehp:item.ehp});
                }
            }
        }


        localStorage.buffs = JSON.stringify(_buffs);
        localStorage.rotation = JSON.stringify(_rotation);
        localStorage.sources = JSON.stringify(_sources);
        localStorage.phases = JSON.stringify(_phases);
        localStorage.talents = JSON.stringify(_talents);
        localStorage.gear = JSON.stringify(_gear);
        localStorage.enchant = JSON.stringify(_enchant);
        localStorage.gem = JSON.stringify(_gem);
    },

    loadSession: function () {
        var view = this;

        if (!localStorage.length) view.firstSession();

        for (let prop in localStorage) {
            view.fight.find('input[name="' + prop + '"]').val(localStorage[prop]);
            view.fight.find('select[name="' + prop + '"]').val(localStorage[prop]);
        }

        view.sidebar.find('.bg').attr('data-race', view.fight.find('select[name="race"]').val());

        updateGlobals({
            talents: !localStorage.talents ? JSON.parse(session.talents) : JSON.parse(localStorage.talents),
            buffs: !localStorage.buffs ? JSON.parse(session.buffs) : JSON.parse(localStorage.buffs),
            rotation: !localStorage.rotation ? JSON.parse(session.rotation) : JSON.parse(localStorage.rotation),
            gear: !localStorage.gear ? JSON.parse(session.gear) : JSON.parse(localStorage.gear),
            enchant: !localStorage.enchant ? JSON.parse(session.enchant) : JSON.parse(localStorage.enchant),
            gem: !localStorage.gem ? JSON.parse(session.gem) : JSON.parse(localStorage.gem),
        });

        let _sources = !localStorage.sources ? JSON.parse(session.sources) : JSON.parse(localStorage.sources);
        let _phases = !localStorage.phases ? JSON.parse(session.phases) : JSON.parse(localStorage.phases);

        for (let i of _sources)
            view.filter.find(`.sources [data-id="${i}"]`).addClass('active');

        for (let i of _phases)
            view.filter.find(`.phases [data-id="${i}"]`).addClass('active');

        if (!localStorage.version || parseInt(localStorage.version) < version) view.newVersion();
    },

    filterGear: function () {
        var view = this;
        var type = view.main.find('nav > ul > li.active').data('type');
        if (type == "mainhand" || type == "offhand") 
            view.loadWeapons(type);
        else if (type == "custom") 
            view.loadCustom();
        else 
            view.loadGear(type);
    },

    loadWeapons: function (type, editmode) {
        var view = this;
        var filter = view.main.find('nav li.active .filter .active').text();

        let table = `<table class="gear ${editmode ? 'editmode' : ''}" data-type="${type}" data-max="1">
                        <thead>
                            <tr>
                                ${editmode ? '<th></th>' : ''}
                                <th>Name</th>
                                <th>Source</th>
                                <th>Sta</th>
                                <th>Str</th>
                                <th>Agi</th>
                                <th>AP</th>
                                <th>Crit</th>
                                <th>Hit</th>
                                <th>Exp</th>
                                <th>Def</th>
                                <th>Armor</th>
                                <th>Res</th>
                                <th>EHP</th>
                                <th>TPS</th>
                            </tr>
                        </thead>
                    <tbody>`;

        for (let item of gear[type]) {

            if (filter && filter != "All") {
                if (filter == "Mace & Sword") {
                    if (item.type != "Mace" && item.type != "Sword") continue;
                }
                else if (filter == "Axe, Dagger & Sword") {
                    if (item.type != "Axe"  && item.type != "Dagger" && item.type != "Sword") continue; 
                }
                else if (item.type != filter)
                    continue;
            }

            let source = item.source.toLowerCase(), phase = item.phase;

            if (phase && !view.filter.find('.phases [data-id="' + phase + '"]').hasClass('active'))
                continue;
            if (source && !view.filter.find('.sources [data-id="' + source + '"]').hasClass('active'))
                continue;

            if (item.hidden && !editmode) continue;

            let tooltip = item.id, rand = '';
            if (tooltip == 199211) tooltip = 19921;
            if (item.rand) rand = '?rand=' + item.rand;
                
            table += `<tr data-id="${item.id}" data-name="${item.name}" class="${item.selected ? 'active' : ''} ${item.hidden ? 'hidden' : ''}">
                        ${editmode ? '<td class="hide">' + (item.hidden ? eyesvghidden : eyesvg) + '</td>' : ''}
                        <td><a href="https://tbc.wowhead.com/item=${tooltip}${rand}"></a>${item.name}</td>
                        <td>${item.source}</td>
                        <td>${item.sta || ''}</td>
                        <td>${item.str || ''}</td>
                        <td>${item.agi || ''}</td>
                        <td>${item.ap || ''}</td>
                        <td>${item.critrating || ''}</td>
                        <td>${item.hitrating || ''}</td>
                        <td>${item.exp || ''}</td>
                        <td>${item.def || ''}</td>
                        <td>${item.ac || ''}</td>
                        <td>${item.res || ''}</td>
                        <td>${item.ehp || ''}</td>
                        <td>${item.tps || ''}</td>
                    </tr>`;
        }

        table += '</tbody></table></section>';

        view.tcontainer.empty();
        view.tcontainer.append(table);
        view.tcontainer.find('table.gear').tablesorter({
            widthFixed: true,
            sortList: editmode ?  [[14, 1],[1, 0]] : [[13, 1],[0, 0]],
            textSorter : {
                13 : function(a, b, direction, column, table) {
                    var a = parseFloat(a.substring(0,a.indexOf('.') + 3));
                    var b = parseFloat(b.substring(0,b.indexOf('.') + 3));
                    if (isNaN(a)) a = 0; 
                    if (isNaN(b)) b = 0; 
                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                },
            },
            headers: {
                13: { sorter: "text" }
            }
        });

        view.loadEnchants(type, editmode);
    },

    loadGear: function (type, editmode) {
        var view = this;

        var max = 1;
        let table = `<table class="gear ${editmode ? 'editmode' : ''}" data-type="${type}" data-max="${max}">
                        <thead>
                            <tr>
                                ${editmode ? '<th></th>' : ''}
                                <th>Name</th>
                                <th>Source</th>
                                <th>Sta</th>
                                <th>Str</th>
                                <th>Agi</th>
                                <th>AP</th>
                                <th>Crit</th>
                                <th>Hit</th>
                                <th>Exp</th>
                                <th>Def</th>
                                <th>Armor</th>
                                <th>Res</th>
                                <th>EHP</th>
                                <th>TPS</th>
                            </tr>
                        </thead>
                    <tbody>`;

        let activeGear = [];

        for (let item of gear[type]) {

            let source = item.source.toLowerCase(), phase = item.phase;
            if (item.source == 'Lethon' || item.source == 'Emeriss' || item.source == 'Kazzak' || item.source == 'Azuregos' || item.source == 'Ysondre' || item.source == 'Taerar' || item.source == 'Green Dragons')
                source = 'worldboss';

            if (max == 2 && 
                ((phase && !view.filter.find('.phases [data-id="' + phase + '"]').hasClass('active')) ||
                (source && !view.filter.find('.sources [data-id="' + source + '"]').hasClass('active'))))
                item.selected = false;

            if (phase && !view.filter.find('.phases [data-id="' + phase + '"]').hasClass('active'))
                continue;
            if (source && !view.filter.find('.sources [data-id="' + source + '"]').hasClass('active'))
                continue;

            if (item.hidden && !editmode) continue;

            let tooltip = item.idoverride ? item.idoverride : item.id; 
            let rand = '';
            if (tooltip == 145541) tooltip = 14554;
            if (tooltip == 198981) tooltip = 19898;
            if (item.rand) rand = '?rand=' + item.rand;

            table += `<tr data-id="${item.id}" class="${item.selected ? 'active' : ''} ${item.hidden ? 'hidden' : ''}">
                        ${editmode ? '<td class="hide">' + (item.hidden ? eyesvghidden : eyesvg) + '</td>' : ''}
                        <td><a href="https://tbc.wowhead.com/item=${tooltip}${rand}"></a>${item.name}</td>
                        <td>${item.source || ''}</td>
                        <td>${item.sta || ''}</td>
                        <td>${item.str || ''}</td>
                        <td>${item.agi || ''}</td>
                        <td>${item.ap || ''}</td>
                        <td>${item.critrating || ''}</td>
                        <td>${item.hitrating || ''}</td>
                        <td>${item.exp || ''}</td>
                        <td>${item.def || ''}</td>
                        <td>${item.ac || ''}</td>
                        <td>${item.res || ''}</td>
                        <td>${item.ehp || ''}</td>
                        <td>${item.tps || ''}</td>
                    </tr>`;
        }

        table += '</tbody></table></section>';

        view.tcontainer.empty();
        view.tcontainer.append(table);
        view.tcontainer.find('table.gear').tablesorter({
            widthFixed: true,
            sortList: editmode ? [[14, 1],[1, 0]] : [[13, 1],[0, 0]],
            textSorter : {
                13 : function(a, b, direction, column, table) {
                    var a = parseFloat(a.substring(0,a.indexOf('.') + 3));
                    var b = parseFloat(b.substring(0,b.indexOf('.') + 3));
                    if (isNaN(a)) a = 0; 
                    if (isNaN(b)) b = 0; 
                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                },
            },
            headers: {
                13: { sorter: "text" }
            }
        });

        view.loadEnchants(type, editmode);
        view.loadGems(type, editmode, activeGear);
        view.updateSession();
        view.updateSidebar();
    },

    loadCustom: function (editmode) {
        var view = this;

        let table = `<table class="gear ${editmode ? 'editmode' : ''}" data-type="custom" data-max="10">
                        <thead>
                            <tr>
                                ${editmode ? '<th></th>' : ''}
                                <th>Name</th>
                                <th>Str</th>
                                <th>Agi</th>
                                <th>AP</th>
                                <th>Hit</th>
                                <th>Crit</th>
                                <th>EHP</th>
                                <th>TPS</th>
                            </tr>
                        </thead>
                    <tbody>`;

        for (let item of gear.custom) {
            if (item.hidden && !editmode) continue;
            table += `<tr data-id="${item.id}" class="${item.selected ? 'active' : ''} ${item.hidden ? 'hidden' : ''}">
                        ${editmode ? '<td class="hide">' + (item.hidden ? eyesvghidden : eyesvg) + '</td>' : ''}
                        <td>${item.name}</td>
                        <td>${item.str || ''}</td>
                        <td>${item.agi || ''}</td>
                        <td>${item.ap || ''}</td>
                        <td>${item.hit || ''}</td>
                        <td>${item.critrating || ''}</td>
                        <td>${item.ehp || ''}</td>
                        <td>${item.tps || ''}</td>
                    </tr>`;
        }

        table += '</tbody></table></section>';

        view.tcontainer.empty();
        view.tcontainer.append(table);
        view.tcontainer.find('table.gear').tablesorter({
            widthFixed: true,
            sortList: editmode ? [[8, 1]] : [[7, 1]],
        });
    },

    loadEnchants: function (type, editmode) {
        var view = this;
        view.main.find('.js-enchant').hide();

        if (!enchant[type] || enchant[type].length == 0) return;

        let table = `<table class="enchant ${editmode ? 'editmode' : ''}" data-type="${type}" data-max="1">
                        <thead>
                            <tr>
                                ${editmode ? '<th></th>' : ''}
                                <th>Enchant</th>
                                <th>Str</th>
                                <th>Agi</th>
                                <th>AP</th>
                                <th>Haste</th>
                                <th>Crit</th>
                                <th>Damage</th>
                                <th>EHP</th>
                                <th>TPS</th>
                            </tr>
                        </thead>
                    <tbody>`;

        for (let item of enchant[type]) {

            if (item.phase && !view.filter.find('.phases [data-id="' + item.phase + '"]').hasClass('active'))
                continue;

            if (item.hidden && !editmode) continue;

            table += `<tr data-id="${item.id}" data-temp="${item.temp || false}" class="${item.selected ? 'active' : ''} ${item.hidden ? 'hidden' : ''}">
                        ${editmode ? '<td class="hide">' + (item.hidden ? eyesvghidden : eyesvg) + '</td>' : ''}
                        <td><a href="https://tbc.wowhead.com/${item.spellid ? 'spell' : 'item'}=${item.id}"></a>${item.name}</td>
                        <td>${item.str || ''}</td>
                        <td>${item.agi || ''}</td>
                        <td>${item.ap || ''}</td>
                        <td>${item.haste || ''}</td>
                        <td>${item.critrating || ''}</td>
                        <td>${item.bonusdmg || ''}</td>
                        <td>${item.ehp || ''}</td>
                        <td>${item.tps || ''}</td>
                    </tr>`;
        }

        table += '</tbody></table></section>';

        if ($(table).find('tbody tr').length == 0) return;

        view.tcontainer.append(table);
        view.tcontainer.find('table.enchant').tablesorter({
            widthFixed: true,
            sortList: editmode ? [[9, 1]] : [[8, 1]],
        });

        view.main.find('.js-enchant').show();
    },

loadGems: function (type, editmode, activeGear) {

        var view = this;
        view.main.find('.js-gem').hide();

        if (!gem[type] || gem[type].length == 0) return;

        for (let i = 0; i < MAX_GEMS[type]; i++) {

            //let socketStr = `socket${i}`;
            //let gemColorHtml = '';
            //if (activeGear[0]  && activeGear[0][socketStr]) {
            //    let gemSocketColor = activeGear[0][socketStr];
            //    if (gemSocketColor != 'meta') gemColorHtml = `style=color:${gemSocketColor}`
            //}

            let table = `<table class="gem ${editmode ? 'editmode' : ''}" data-gem-index=${i} data-type="${type}" data-max="1">
                            <thead>
                                <tr > 
                                    ${editmode ? '<th></th>' : ''}
                                    <th>Gem Slot ${i}</th>
                                    <th>Str</th>
                                    <th>Agi</th>
                                    <th>AP</th>
                                    <th>Stamina</th>
                                    <th>Crit</th>
                                    <th>Hit</th>
                                    <th>Resilience</th>
                                    <th>EHP</th>
                                    <th>TPS</th>
                                </tr>
                            </thead>
                        <tbody>`;

            for (let item of Object.values(gem[type][i])) {
                if (item.phase && !view.filter.find('.phases [data-id="' + item.phase + '"]').hasClass('active'))
                    continue;

                if (item.hidden && !editmode) continue;
                if (item.meta && i != 0) continue;

                 let gemColorHtml = '';
                 if (item.color != 'meta') gemColorHtml = `style=color:${item.color}`

                 table += `<tr ${gemColorHtml} data-id="${item.id}" data-meta="${item.meta || false}" class="${item.selected ? 'active' : ''} ${item.hidden ? 'hidden' : ''}">
                            ${editmode ? '<td class="hide">' + (item.hidden ? eyesvghidden : eyesvg) + '</td>' : ''}
                            <td><a href="https://tbc.wowhead.com/${item.spellid ? 'spell' : 'item'}=${item.id}"></a>${item.name}</td>
                            <td>${item.str || ''} </td>
                            <td>${item.agi || ''}</td>
                            <td>${item.ap || ''}</td>
                            <td>${item.sta || ''}</td>
                            <td>${item.critrating || ''}</td>
                            <td>${item.hitrating || ''}</td>
                            <td>${item.res || ''}</td>
                            <td>${item.ehp || ''}</td>
                            <td>${item.tps || ''}</td>
                        </tr>`;
            }

            table += '</tbody></table></section>';

            if ($(table).find('tbody tr').length == 0) return;

            view.tcontainer.append(table);
            view.tcontainer.find('table.gem').tablesorter({
                widthFixed: true,
                sortList: editmode ? [[8, 1]] : [[7, 1]],
            });
        }

        view.main.find('.js-gem').show();
    },

    addAlert: function (msg) {
        var view = this;
        view.alerts.empty().append('<div class="alert"><p>' + msg + '</p></div>');
        view.alerts.find('.alert').click(function () { view.closeAlert(); });
        setTimeout(function () { view.alerts.find('.alert').addClass('in-up') });
        setTimeout(function () { view.closeAlert(); }, 4000);
    },
    
    closeAlert: function () {
        var view = this;
        view.alerts.find('.alert').removeClass('in-up');
        setTimeout(function () { view.alerts.empty(); }, 1000);
    },

    firstSession: function () {
        console.log('Welcome!');
    },

    newVersion: function() {
        var view = this;

        localStorage.version = version;

        if (!view.filter.find(`.phases [data-id="4"]`).hasClass('active'))
            setTimeout(() => { view.filter.find(`.phases [data-id="4"]`).click() }, 100);
        if (!view.filter.find(`.phases [data-id="5"]`).hasClass('active'))
            setTimeout(() => { view.filter.find(`.phases [data-id="5"]`).click() }, 100);

    }
    


};

var eyesvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z"/></svg>';
var eyesvghidden = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11.885 14.988l3.104-3.098.011.11c0 1.654-1.346 3-3 3l-.115-.012zm8.048-8.032l-3.274 3.268c.212.554.341 1.149.341 1.776 0 2.757-2.243 5-5 5-.631 0-1.229-.13-1.785-.344l-2.377 2.372c1.276.588 2.671.972 4.177.972 7.733 0 11.985-8.449 11.985-8.449s-1.415-2.478-4.067-4.595zm1.431-3.536l-18.619 18.58-1.382-1.422 3.455-3.447c-3.022-2.45-4.818-5.58-4.818-5.58s4.446-7.551 12.015-7.551c1.825 0 3.456.426 4.886 1.075l3.081-3.075 1.382 1.42zm-13.751 10.922l1.519-1.515c-.077-.264-.132-.538-.132-.827 0-1.654 1.346-3 3-3 .291 0 .567.055.833.134l1.518-1.515c-.704-.382-1.496-.619-2.351-.619-2.757 0-5 2.243-5 5 0 .852.235 1.641.613 2.342z"/></svg>';