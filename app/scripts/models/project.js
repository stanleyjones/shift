/*global define*/

define([
    'underscore',
    'backbone',
    'helpers',
], function (_, Backbone, Help) {
    'use strict';

    var Project = Backbone.Model.extend({
        defaults: {
        	name: '',		// Name of the project, e.g. "Keystone XL Pipeline"
        	slug: '',		// Slugified name, e.g. "keystone-xl-pipeline"
        	subsidies: [],	// Subsidy models
        	total: 0,		// Total awarded to project
        	totalFormatted: '$0'
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

    return Project;
});
