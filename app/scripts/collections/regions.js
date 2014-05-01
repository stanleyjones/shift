/*global define*/

define([
	'underscore',
	'backbone',
	'collections/subsidies',
	'models/region'
], function (_, Backbone, Subsidies, Region) {
	'use strict';

	var Regions = Backbone.Collection.extend({
		model: Region,

		initialize: function (options) {
			this.listenTo(Subsidies, 'reset', this.resetAll);
		},

		resetAll: function () {
			this.trigger('change:status', {collection: 'Regions', status: 'Resetting'});
			var regionCCs = _.uniq(Subsidies.pluck('regionCC'), false);
			this.addAll(regionCCs);
		},

		addOne: function (cc, subsidies) {
			var seed = _.first(subsidies),
				region = new Region({
					name: seed.get('region'),
					cc: seed.get('regionCC'),
					subsidies: subsidies,
					total: 0
				});
			this.add(region);
		},

		addAll: function (ccs) {
			_.each(ccs, function (cc) {
				var regionSubsidies = Subsidies.inRegion(cc);
				this.addOne(cc, regionSubsidies);
			}, this);
			this.trigger('change:status', {collection: 'Regions', status: 'Ready'});
			this.trigger('reset');
		}

	});

	return new Regions();
});
