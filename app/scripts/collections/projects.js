/*global define*/

define([
	'underscore',
	'backbone',
	'collections/subsidies',
	'models/project'
], function (_, Backbone, Subsidies, Project) {
	'use strict';

	var Projects = Backbone.Collection.extend({
		model: Project,

		initialize: function () {
			this.listenTo(Subsidies, 'reset', this.resetAll);
		},

		resetAll: function () {
			this.trigger('change:status', {collection: 'Projects', status: 'Resetting'});
			this.addAll(_.uniq(Subsidies.pluck('projectSlug')));
		},

		addOne: function (slug, subsidies) {
			var seed = _.first(subsidies),
				project = new Project({
					name: seed.get('project'),
					slug: seed.get('projectSlug'),
					subsidies: subsidies
				});
			this.add(project);
		},

		addAll: function (slugs) {
			_.each(slugs, function (slug) {
				var projectSubsidies = Subsidies.forProject(slug);
				this.addOne(slug, projectSubsidies);
			}, this);
			this.trigger('change:status', {collection: 'Projects', status: 'Ready'});
			this.trigger('reset');
		}
	});

	return new Projects();
});
