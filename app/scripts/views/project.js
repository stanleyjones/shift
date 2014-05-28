/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/project.html'
], function ($, _, Backbone, projectTemplate) {
	'use strict';

	var ProjectView = Backbone.View.extend({
		el: '#project',

		template: _.template(projectTemplate),

		initialize: function () {
			this.render();
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
		}
	});

	return ProjectView;
});
