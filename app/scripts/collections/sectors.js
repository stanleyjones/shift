/*global define*/

define([
	'underscore',
	'backbone',
	'collections/subsidies',
	'models/sector'
], function (_, Backbone, Subsidies, Sector) {
	'use strict';

	var Sectors = Backbone.Collection.extend({
		model: Sector,

		comparator: 'slug',

		initialize: function () {
			// this.listenTo(Subsidies, 'reset', this.addAll);
			this.max = 0;
		},

		addAll: function () {
			var slugs = _.uniq(Subsidies.pluck('sectorSlug'), false);
			this.trigger('change:status', {collection: 'Sectors', status: 'Adding', count: slugs.length});

			_.each(slugs, function (slug) {
				var sectorSubsidies = Subsidies.toSector(slug);
				this.addOne(slug, sectorSubsidies);
			}, this);
			this.trigger('change:status', {collection: 'Sectors', status: 'Ready'});
		},

		addOne: function (slug, subsidies) {
			var seed = _.first(subsidies),
				sector = new Sector({
					name: seed.get('sector'),
					category: seed.get('category'),
					slug: slug,
					subsidies: subsidies
				});
			this.add(sector);
			this.max = Math.max(sector.get('total'), this.max);
		}

	});

	return new Sectors();
});
