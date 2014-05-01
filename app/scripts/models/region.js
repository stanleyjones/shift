/*global define*/

define([
	'underscore',
	'backbone'
], function (_, Backbone) {
	'use strict';

	var Region = Backbone.Model.extend({
		defaults: {
			name: '',		// Country Name e.g. United States, Canada
			cc: '',			// ISO-3166-1 alpha-2: e.g. US, CA
			subsidies: [],	// Subsidy models
			ratio: 0.0		// Ratio of clean:fossil $ (-1..1)
		},

		initialize: function (options) {
			this.calcRatio();
		},

		calcRatio: function (options) {
			var mode = (options && options.mode) ? options.mode : 'international',
				amounts = {clean: 0, fossilFuel: 0, total: 0};

			_.each(this.get('subsidies'), function (s) {
				if (s.get('mode') == mode) {
					if (s.get('category') == 'clean') { amounts.clean += s.get('amount'); }
					if (s.get('category') == 'fossil-fuel') { amounts.fossilFuel += s.get('amount'); }
					amounts.total += s.get('amount');
				}
			});
			if (amounts.total) { this.set({ratio: ((amounts.clean - amounts.fossilFuel) / amounts.total).toFixed(2)}); }
		},

		uniqFields: function (field) {
			return _.uniq(_.map(this.get('subsidies'), function (sub) {
				return sub.get(field);
			}));
		}

	});

	return Region;
});
