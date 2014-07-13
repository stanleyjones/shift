/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/loader.html'
], function ($, _, Backbone, loaderTemplate) {
	'use strict';

	var LoaderView = Backbone.View.extend({
		el: '#loader',

		initialize: function () {
			this.viewState = new Backbone.Model({
				status: 'Initialized'
			});
			this.viewState.on('change:status', this.render, this);
		},

		render: function () {
			var template = _.template(loaderTemplate, {status: this.viewState.get('status')});
			this.$el.html(template);
		}
	});

	return LoaderView;
});
