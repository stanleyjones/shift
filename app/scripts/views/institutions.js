/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/institutions.html'
], function ($, _, Backbone, institutionsTemplate) {
    'use strict';

    var InstitutionsView = Backbone.View.extend({
    	el: '#institutions',

        template: _.template(institutionsTemplate),

        events: {
		},

        initialize: function () {
            this.render();
        },

		render: function () {
			this.$el.html(this.template());

            return this;
		}

    });

    return InstitutionsView;
});
