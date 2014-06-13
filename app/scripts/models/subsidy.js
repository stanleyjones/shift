/*global define*/

define([
	'underscore',
	'backbone',
	'globals'
], function (_, Backbone, G) {
	'use strict';

	var Subsidy = Backbone.Model.extend({
		defaults: {
			visible: false,
			amount: 0,
			currency: 'USD',
			XR: 1.0,
			date: null,
			year: null,
			FY: null,
			kind: '',
			sector: '',
			stage: ''

			// institution: {
			// 	name: '',
			// 	abbreviation: '',
			// 	kind: '',
			// 	fye: '12-31'
			// },
			// project: {
			// 	name: '',
			// 	country: 'United States',	// e.g. United States, Canada
			// 	cc: 'US', 					// e.g. US, CA
			// 	category: 'Fossil Fuels',	// e.g. Fossil Fuels, Clean
			// 	sector: 'Oil',				// e.g. Oil, Solar, Wind
			// 	type: '',					// e.g. Exploration, Transmission
			// 	access: false,
			// 	description: ''
			// }
		},

		validate: function (attrs) {
			if (attrs.visible !== 'true') {
				return 'Subsidy must be visible.';
			}
			if (attrs.amount <= 0) {
				return 'Subsidy must have a positive amount.';
			}
			if (!attrs.year) {
				return 'Subsidy must have a year.';
			}
			if (attrs.year < G.START_YEAR || attrs.year > G.END_YEAR) {
				return 'Subsidy year must be within start and end years.';
			}
		}
	});

	return Subsidy;
});
