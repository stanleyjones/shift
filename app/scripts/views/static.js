/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/static.html'
], function ($, _, Backbone, staticTemplate) {
	'use strict';

	var StaticView = Backbone.View.extend({
		el: '#static',

		template: _.template(staticTemplate),

		initialize: function (options) {
			this.page = (options && options.page) ? options.page : 'intro';
			this.render();
		},

		render: function () {
			this.$el.html(this.template());
			this.$('#' + this.page).show().siblings('.page').hide();
		}
	});

	return StaticView;
});
