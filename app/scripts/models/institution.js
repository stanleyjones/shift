/*global define*/

define([
	'underscore',
	'backbone',
	'helpers'
], function (_, Backbone, Help) {
	'use strict';

	var Institution = Backbone.Model.extend({
		defaults: {
			name: '',		// Institution full name e.g. International Monetary Fund
			abbr: '',		// Abbreviation e.g. IMF
			slug: '',		// Slugified abbreviation or name e.g. imf, international-monetary-fund
			subsidies: [],	// Subsidy models
			total: 0,		// Total awarded by institution
			ratio: 0.0		// Ratio of clean:fossil $ (-1..1)

		},

		initialize: function () {
			this.slugify();
			this.calcTotal();
			this.calcRatio();
		},

		slugify: function () {
			var slug = this.has('abbr') ? this.get('abbr') : this.get('name');
			this.set({slug: Help.slugify(slug)});
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
				if (s.get('category') === 'clean') { amounts.clean += s.get('amount'); }
				if (s.get('category') === 'fossil-fuel') { amounts.fossilFuel += s.get('amount'); }
				amounts.total += s.get('amount');
			});
			if (amounts.total) { this.set({ratio: ((amounts.clean - amounts.fossilFuel) / amounts.total).toFixed(2)}); }
		},

		uniqFields: function (field) {
			return _.uniq(_.map(this.get('subsidies'), function (sub) {
				return sub.get(field);
			}));
		}

	});

	return Institution;
});
