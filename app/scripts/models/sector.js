/*global define*/

define([
	'underscore',
	'backbone',
	'helpers'
], function (_, Backbone, Help) {
	'use strict';

	var Sector = Backbone.Model.extend({
		defaults: {
			name: '',	// Name of the sector, e.g. "Natural Gas"
			slug: '',	// Slugified name, e.g. "natural-gas"
			total: 0	// Total awarded to sector
		},

		initialize: function () {
			this.slugify();
			this.calcTotal();
		},

		slugify: function () {
			this.set({slug: Help.slugify(this.get('name'))});
		},

		calcTotal: function (options) {
			var mode = (options && options.mode) ? options.mode : 'international';

			var total = _.reduce(this.get('subsidies'), function (memo, s) {
				var amount = (s.get('mode') === mode) ? s.get('amount') : 0;
				return memo + amount;
			}, 0);
			this.set({total: total, totalFormatted: Help.monetize(total)});
		},

		uniqFields: function (field) {
			return _.uniq(_.map(this.get('subsidies'), function (s) { return s.get(field); }).sort(), true);
		}
	});

	return Sector;
});