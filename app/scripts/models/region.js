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
			ratio: 0.0,		// Ratio of clean:fossil $ (-1..1) (INTL)
			total: 0,		// Total amount of subsidies (NTNL)
			international: false,
			national: false
		},

		initialize: function (options) {
			this.calcRatio();
			this.calcTotal();
			this.setVisibility('international');
			this.setVisibility('national');
		},

		calcRatio: function (options) {
			var mode = (options && options.mode) ? options.mode : 'international',
				amounts = {clean: 0, fossilFuel: 0, total: 0};

			_.each(this.get('subsidies'), function (s) {
				if (s.get('mode') === mode) {
					if (s.get('category') == 'clean') { amounts.clean += s.get('amount'); }
					if (s.get('category') == 'fossil-fuel') { amounts.fossilFuel += s.get('amount'); }
					amounts.total += s.get('amount');
				}
			});
			if (amounts.total) { this.set({ratio: ((amounts.clean - amounts.fossilFuel) / amounts.total).toFixed(2)}); }
		},

		calcTotal: function (options) {
			var mode = (options && options.mode) ? options.mode : 'national',
				total = 0;

			_.each(this.get('subsidies'), function (s) {
				if (s.get('mode') === mode) { total += s.get('amount'); }
			});
			this.set({total: total});
		},

		setVisibility: function (mode) {
			if (_.some(this.get('subsidies'), function (s) { return s.get('mode') === mode; })) {
				this.set(mode, true);
			}
		},

		uniqFields: function (field, mode) {
			var subsidies = this.filterSubsidies(mode);
			return _.uniq(_.map(subsidies, function (s) { return s.get(field); }));
		},

		filterSubsidies: function (mode) {
			return _.filter(this.get('subsidies'), function (s) { return s.get('mode') === mode; });
		}

	});

	return Region;
});
