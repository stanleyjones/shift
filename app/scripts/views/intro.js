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
			'click .select-national .open': 'loadNational',
			'click .select-international .open': 'loadInternational'
		},

		initialize: function (options) {
			this.app = options.app;
			this.listenTo(this.app.appState, 'change:status', this.renderProgress);
			this.render();
		},

		render: function () {
			this.$el.html(this.template);
		},

		renderProgress: function (args) {
			if (this.app.isReady()) {
				this.$el.find('.open').attr('disabled', false).text('Go');
			}
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
