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

		initialize: function () {
			this.listenTo(Subsidies, 'reset', this.resetAll);
			this.range = {min: 0, max: 0};
		},

		resetAll: function () {
			this.trigger('change:status', {collection: 'Regions', status: 'Resetting'});
			this.addAll(_.uniq(Subsidies.pluck('regionCC')));
		},

		addOne: function (cc, subsidies) {
			var seed = _.first(subsidies),
				region = new Region({
					name: seed.get('region'),
					cc: seed.get('regionCC'),
					subsidies: subsidies
				});
			this.add(region);
			this.range = {
				min: Math.min(region.get('total'), this.range.min),
				max: Math.max(region.get('total'), this.range.max)
			};
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
