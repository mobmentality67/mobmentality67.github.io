var SIM = SIM || {}

SIM.SETTINGS = {

    init: function () {
        var view = this;
        view.variables();
        view.events();
        view.buildSpells();
        view.buildBuffs();
        view.buildTalents();
    },

    variables: function () {
        var view = this;
        view.body = $('body');
        view.buffs = view.body.find('article.buffs');
        view.fight = view.body.find('article.fight');
        view.rotation = view.body.find('article.rotation');
        view.talents = view.body.find('article.talents');
        view.filter = view.body.find('article.filter');
        view.close = view.body.find('section.settings .btn-close');
        view.bg = view.body.find('section.sidebar .bg');
    },

    events: function () {
        var view = this;

        view.close.click(function (e) {
            e.preventDefault();
            $('.js-settings').removeClass('active');
            $('section.settings').removeClass('active');
        });

        view.buffs.on('click', '.icon', function () {
            let obj = $(this);

            /* Handle counting buff type */ 
            console.log("Name = " + obj.data('name'));
            console.log("Count = " + obj.data('count'));
            console.log("Max count = " + obj.data('max_count'));

            if (obj.data('max_count') && obj.data('max_count')) {

                /* If buff is inactive, turn it on */
                if (!obj.hasClass('active')) {
                    obj.toggleClass('active');
                        obj.data('count', obj.data('count') + 1);
                }

                /* If buff is currently = max buff count allowed, disable it */
                else if (obj.hasClass('active') && obj.data('max_count') == (obj.data('count') + 1)) {
                    obj.data('count', 0);
                    obj.toggleClass('active');
                    if (obj.data('group')) {
                        obj.siblings().filter('[data-group="' + obj.data('group') + '"]').removeClass('active');
                    }
                }
                /* Otherwise, if buff is active and not at max count, increment it */
                else if (obj.hasClass('active')) {
                        obj.data('count', obj.data('count') + 1);
                }
                /* Update the icon */
                this.children[0].src = obj.data('base_icon_name') + "_" + obj.data('count') + ".jpg";
            }

            else if (!obj.hasClass('active')) {
                obj.toggleClass('active');
                if (obj.data('group'))
                    obj.siblings().filter('[data-group="' + obj.data('group') + '"]').removeClass('active');
            }

            else if (obj.hasClass('active')) {
               obj.toggleClass('active');
            }

            for (let buff of buffs) {
                buff.active = view.buffs.find('[data-id="' + buff.id + '"]').hasClass('active');
                if (view.buffs.find('[data-id="' + buff.id + '"]').data('count') != 'undefined') {
                    buff.count = view.buffs.find('[data-id="' + buff.id + '"]').data('count');
                }
            }
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.talents.on('click', '.icon', function (e) {
            let talent = view.getTalent($(this));
            talent.c = talent.c < talent.m ? talent.c + 1 : talent.m;
            $(this).attr('data-count', talent.c);
            if (talent.c >= talent.m) $(this).addClass('maxed');
            if (talent.enable)
                $('.rotation [data-id="' + talent.enable + '"]').removeClass('hidden');
            $(this).find('a').attr('href', 'https://tbc.wowhead.com/spell=' + talent.s[talent.c == 0 ? 0 : talent.c - 1]);
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.talents.on('contextmenu', '.icon', function (e) {
            e.preventDefault();
            let talent = view.getTalent($(this));
            talent.c = talent.c < 1 ? 0 : talent.c - 1;
            $(this).attr('data-count', talent.c);
            $(this).removeClass('maxed');
            if (talent.c == 0 && talent.enable) {
                $('.rotation [data-id="' + talent.enable + '"]').removeClass('active').addClass('hidden');
                for (let spell of spells)
                    if (spell.id == talent.enable)
                        spell.active = false;
            }
            $(this).find('a').attr('href', 'https://tbc.wowhead.com/spell=' + talent.s[talent.c == 0 ? 0 : talent.c - 1]);
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.filter.on('click', '.sources li', function (e) {
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                let id = $(this).data('id');
                view.filter.find(`.phases [data-sources*="${id}"]`).addClass('active');
            }
            SIM.UI.updateSession();
            SIM.UI.filterGear();
        });

        view.filter.on('click', '.phases li', function (e) {
            $(this).toggleClass('active');
            let sources = $(this).data('sources').split(',');
            let show = $(this).hasClass('active');
            for (let source of sources) {
                if (show) view.filter.find('.sources [data-id="' + source + '"]').addClass('active');
                else view.filter.find('.sources [data-id="' + source + '"]').removeClass('active');
            }
            SIM.UI.updateSession();
            SIM.UI.filterGear();
        });

        view.rotation.on('click', '.spell', function (e) {
            let t = e.target;
            if (t.nodeName == "LI" || t.nodeName == "INPUT")
                return;
            $(this).toggleClass('active');
            let id = $(this).data('id');
            for (let spell of spells) {
                if (spell.id == id)
                    spell.active = $(this).hasClass('active');
            }
            SIM.UI.updateSession();
        });

        view.rotation.on('keyup', 'input[type="text"]', function (e) {
            let id = $(this).parents('.spell').data('id');
            for (let spell of spells) {
                if (spell.id == id)
                    spell[$(this).attr('name')] = $(this).val();
            }
            SIM.UI.updateSession();
        });

        view.fight.on('change', 'select[name="race"]', function (e) {
            var val = $(this).val();
            var disableSpells = [];

            for (let spell of spells) {
                if (disableSpells.includes(spell.id))
                    spell.active = false;
            }

            view.bg.attr('data-race', val);

            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.fight.on('keyup', 'input[type="text"]', function (e) {
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.fight.on('change', 'select[name="weaponrng"]', function (e) {
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.fight.on('change', 'select[name="batching"]', function (e) {
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.fight.on('change', 'select[name="activetank"]', function (e) {
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });

        view.fight.on('change', 'select[name="incswingdamage"]', function (e) {
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });
        view.fight.on('change', 'select[name="incswingtimer"]', function (e) {
            SIM.UI.updateSession();
            SIM.UI.updateSidebar();
        });
    },

    buildSpells: function () {
        var view = this;
        for (let spell of spells) {

            let tooltip = spell.id == 26996;
            let div = $(`<div data-id="${spell.id}" class="spell"><div class="icon">
            <img src="dist/img/${spell.iconname.toLowerCase()}.jpg " alt="${spell.name}">
            <a href="https://tbc.wowhead.com/spell=${tooltip}" class="wh-tooltip"></a>
            </div><ul class="options"></ul></div>`);

            if (spell.globals !== undefined)
                div.find('.options').append(`<li>Use on first global</li>`);
            if (spell.maincd !== undefined)
                div.find('.options').append(`<li>Mangle cooldown >= <input type="text" name="maincd" value="${spell.maincd}" data-numberonly="true" /> secs</li>`);
            if (spell.crusaders !== undefined)
                div.find('.options').append(`<li>when <input type="text" name="crusaders" value="${spell.crusaders}" data-numberonly="true" /> crusaders are up</li>`);
            if (spell.minrage !== undefined)
                div.find('.options').append(`<li>Use when above <input type="text" name="minrage" value="${spell.minrage}" data-numberonly="true" /> rage</li>`);
            if (spell.haste !== undefined)
                div.find('.options').append(`<li>Attack speed at <input type="text" name="haste" value="${spell.haste}" data-numberonly="true" /> %</li>`);
            if (spell.priorityap !== undefined)
                div.find('.options').append(`<li>Prioritize Swipe when >= <input style="width:25px" type="text" name="priorityap" value="${spell.priorityap}" data-numberonly="true" /> AP</li> and 5 stacks of Lacerate > 5 seconds left`);
            if (spell.reaction !== undefined)
                div.find('.options').append(`<li><input style="width:25px" type="text" name="reaction" value="${spell.reaction}" data-numberonly="true" /> ms reaction time</li>`);
            if (spell.hidden)
                div.addClass('hidden');
            if (spell.active)
                div.addClass('active');

            if (spell.maincd !== undefined) {
                div.find('.options li:first-of-type').append(' or');
            }

            if (spell.crusaders !== undefined) {
                div.find('.options li:first-of-type').append(' or');
            }

            if (spell.id == 33745) {
                div.find('.options').append(`<li>Refresh lacerate when<input style="width:35px" type="text" name="laceraterefreshtime" value="${spell.laceraterefreshtime}" data-numberonly="true" /> ms remaining</li>`);
            }

            /* When to queue maul qualifier */
            if (spell.id == 26996) {
                div.find('.options').empty();
                div.find('.options').append(`<li>Queue when above <input type="text" name="minrage" value="50" data-numberonly="true"> rage or Mangle cooldown >= <input type="text" name="maincd" value="4" data-numberonly="true"> secs</li>`);
                div.find('.options').append(`<li><input style="width:25px" type="text" name="reaction" value="${spell.reaction}" data-numberonly="true" /> ms reaction time</li>`);
            }

            view.rotation.append(div);
        }

        view.rotation.children().eq(3).appendTo(view.rotation);
        view.rotation.children().eq(19).appendTo(view.rotation);
    },

    buildBuffs: function () {
        var view = this;
        for (let buff of buffs) {
            let wh = buff.spellid ? 'spell' : 'item';
            let active = buff.active ? 'active' : '';
            let group = buff.group ? `data-group="${buff.group}"` : '';
            let disable = buff.disableSpell ? `data-disable-spell="${buff.disableSpell}"` : '';
            let max_count = buff.max_count ? `data-max_count="${buff.max_count}"` : '';
            let base_icon_name = `data-base_icon_name="dist/img/${buff.iconname.toLowerCase()}"`;
            let iconname = buff.max_count ? buff.iconname.toLowerCase() + "_" + buff.count : buff.iconname.toLowerCase();
            let count = buff.count ? `data-count="${buff.count}"` : '';
            let html = `<div data-id="${buff.id}" data-name = "${buff.name}" ${max_count} ${count} ${base_icon_name}
                            class="icon ${active}" ${group} ${disable}>
                            <img src="dist/img/${iconname}.jpg " alt="${buff.name}">
                            <a href="https://tbc.wowhead.com/${wh}=${buff.id}" class="wh-tooltip"></a>
                        </div>`;

            view.buffs.append(html);
        }
    },

    buildTalents: function () {
        var view = this;
        for (let tree of talents) {
            let table = $('<table><tr><th colspan="4">' + tree.n + '</th></tr></table>');
            for (let i = 0; i < 10; i++) table.prepend('<tr><td></td><td></td><td></td><td></td></tr>');
            for (let talent of tree.t) {
                let div = $('<div class="icon" data-count="' + talent.c + '" data-x="' + talent.x + '" data-y="' + talent.y + '"></div>');
                div.html('<img src="dist/img/' + talent.iconname.toLowerCase() + '.jpg" alt="' + talent.n + '" />');
                if (talent.c >= talent.m) div.addClass('maxed');
                if (talent.enable && talent.c == 0) view.rotation.find('[data-id="' + talent.enable + '"]').addClass('hidden');
                if (talent.enable && talent.c > 0) view.rotation.find('[data-id="' + talent.enable + '"]').removeClass('hidden');
                div.append('<a href="https://tbc.wowhead.com/spell=' + talent.s[talent.c == 0 ? 0 : talent.c - 1] + '" class="wh-tooltip"></a>');
                table.find('tr').eq(talent.y).children().eq(talent.x).append(div);
            }
            view.talents.append(table);
        }
    },

    getTalent: function (div) {
        let tree = div.parents('table').index();
        let x = div.data('x');
        let y = div.data('y');
        for (let talent of talents[tree - 1].t)
            if (talent.x == x && talent.y == y)
                return talent;
    }



};