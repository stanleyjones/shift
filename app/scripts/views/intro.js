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

		renderProgress: function () {
			this.$('#progress').html(this.app.appState.get('status'));
			if (this.app.isReady()) {
				this.$('.open').attr('disabled', false).text('Go');
				this.$('#progress').delay(1000).fadeOut(500);
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
