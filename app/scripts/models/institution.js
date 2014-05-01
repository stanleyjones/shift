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
        	ratio: 0.0		// Ratio of clean:fossil $ (-1..1)
        }
    });

    return Institution;
});
