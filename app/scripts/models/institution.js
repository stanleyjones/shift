/*global define*/

define([
	'underscore',
	'backbone'
], function (_, Backbone) {
	'use strict';

	var Institution = Backbone.Model.extend({
		defaults: {
			name: '',		// Institution full name e.g. International Monetary Fund
			abbr: '',		// Abbreviation e.g. IMF
			subsidies: [],	// Subsidy models
			total: 0,		// Total awarded by institution
			ratio: 0.0		// Ratio of clean:fossil $ (-1..1)

		},

		initialize: function () {
			this.calcTotal();
			this.calcRatio();
		},

		calcTotal: function () {
			var total = _.reduce(this.get('subsidies'), function (memo, s) {
				return memo + s.get('amount');
			}, 0);
			this.set({total: total});
		},

		calcRatio: function () {
			var amounts = {clean: 0, fossilFuel: 0, total: 0};
			_.each(this.get('subsidies'), function (s) {
				if (s.get('category') == 'clean') { amounts.clean += s.get('amount'); }
				if (s.get('category') == 'fossil-fuel') { amounts.fossilFuel += s.get('amount'); }
				amounts.total += s.get('amount');
			});
			if (amounts.total) { this.set({ratio: ((amounts.clean - amounts.fossilFuel) / amounts.total).toFixed(2)}); }
		}
	});

	return Institution;
});
