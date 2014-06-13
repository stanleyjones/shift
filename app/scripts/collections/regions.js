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
		comparator: 'cc',

		initialize: function () {
			// this.listenTo(Subsidies, 'reset', this.addAll);
			this.max = 0;
		},

		addAll: function () {
			var ccs = _.uniq(Subsidies.pluck('regionCC'));
			this.trigger('change:status', {collection: 'Regions', status: 'Adding', count: ccs.length});

			_.each(ccs, function (cc) {
				var regionSubsidies = Subsidies.inRegion(cc);
				this.addOne(cc, regionSubsidies);
			}, this);
			this.trigger('change:status', {collection: 'Regions', status: 'Ready'});
		},

		addOne: function (cc, subsidies) {
			var seed = _.first(subsidies),
				region = new Region({
					name: seed.get('region'),
					cc: seed.get('regionCC'),
					subsidies: subsidies
				});
			this.add(region);
			if (region.get('total') > this.max) { this.max = region.get('total'); }
		}

	});

	return new Regions();
});
