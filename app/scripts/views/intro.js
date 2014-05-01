/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'collections/subsidies',
	'text!templates/intro.html'
], function ($, _, Backbone, Subsidies, introTemplate) {
	'use strict';

	var IntroView = Backbone.View.extend({
		el: '#intro',

		template: _.template(introTemplate),

		events: {
			'click .select-national .loader': 'loadNational',
			'click .select-international .loader': 'loadInternational'
		},

		initialize: function () {
			this.listenTo(Subsidies, 'change:status', this.renderProgress);
			this.render();
		},

		render: function () {
			this.$el.html(this.template());
		},

		renderProgress: function (args) {
			var loadMessage = (args && args.status) ? args.status : 'Loading';
			this.$el.find('.loader').text(loadMessage);
		},

		loadNational: function () {
			Backbone.history.navigate('regions/national', {trigger: true});
		},

		loadInternational: function () {
			Backbone.history.navigate('regions/international', {trigger: true});
		}
	});

	return IntroView;
});
