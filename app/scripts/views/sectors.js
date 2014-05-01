/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/sectors.html'
], function ($, _, Backbone, sectorsTemplate) {
    'use strict';

    var SectorsView = Backbone.View.extend({
        el: '#sectors',

        template: _.template(sectorsTemplate),

        events: {
		},

		initialize: function () {
			console.log('[INIT]','RegionsView');
		},

		render: function () {
			console.log('[RNDR]','RegionsView');
			this.$el.html(this.template());
		}
    });

    return SectorsView;
});
