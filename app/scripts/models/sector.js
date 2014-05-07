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
			this.calcTotal();
		},

		calcTotal: function () {
			var total = _.reduce(this.get('subsidies'), function (memo, s) {
				return memo + s.get('amount');
			}, 0);
			this.set({total: total, totalFormatted: Help.monetize(total)});
		}
	});

	return Sector;
});
