/*global define*/

define([
	'underscore',
	'backbone',
	'helpers',
	'collections/subsidies',
	'models/sector'
], function (_, Backbone, Help, Subsidies, Sector) {
	'use strict';

	var Sectors = Backbone.Collection.extend({
		model: Sector,

		comparator: 'slug',

		initialize: function () {
			// this.listenTo(Subsidies, 'reset', this.addAll);
			this.max = 0;
		},

		addAll: function () {
			var _this = this,
				subsidies = Subsidies.where({mode: 'international'});
			_.each(subsidies, function (s) {
				var sector = _this.findWhere({name: s.get('sector')});
				if (!sector) { // Doesn't exist yet
					sector = new Sector({
						name: s.get('sector'),
						category: s.get('category'),
						slug: Help.slugify(s.get('sector')),
						subsidies: []
					});
					_this.add(sector);
				}
				var sectorSubsidies = sector.get('subsidies');
				sectorSubsidies.push(s);
				sector.set({subsidies: sectorSubsidies});
			});
			this.trigger('change:status', {collection: 'Sectors', status: 'Adding', count: this.length});

			_.each(this.models, function (s) { s.calcTotal(); _this.max = Math.max(s.get('total'), _this.max); });
			this.trigger('change:status', {collection: 'Sectors', status: 'Ready'});
		}

	});

	return new Sectors();
});
