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

		initialize: function () {
			this.listenTo(Subsidies, 'reset', this.resetAll);
		},

		resetAll: function () {
			this.trigger('change:status', {collection: 'Sectors', status: 'Resetting'});
			var sectorSlugs = _.uniq(Subsidies.pluck('sectorSlug'), false);
			this.addAll(sectorSlugs);
		},

		addOne: function (slug, subsidies) {
			var seed = _.first(subsidies),
				sector = new Sector({
					name: seed.get('sector'),
					slug: seed.get('sectorSlug'),
					category: seed.get('category'),
					subsidies: subsidies
				});
			this.add(sector);
		},

		addAll: function (slugs) {
			_.each(slugs, function (slug) {
				var sectorSubsidies = Subsidies.toSector(slug);
				this.addOne(slug, sectorSubsidies);
			}, this);
			this.trigger('change:status', {collection: 'Sectors', status: 'Ready'});
			this.trigger('reset');
		}
	});

	return new Sectors();
});
