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
			'click .enter': 'enterRegions'
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
				this.$('.enter').attr('disabled', false).text('Enter');
			}
		},

		enterRegions: function () {
			Backbone.history.navigate('regions', {trigger: true});
		}
	});

	return IntroView;
});
