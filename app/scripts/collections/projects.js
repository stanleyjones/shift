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
			this.comparator = 'slug';
		},

		addAll: function () {
			var slugs = _.uniq(Subsidies.map(function (sub) {
				if (sub.get('mode') === 'international') { return sub.get('projectSlug'); }
			}));

			this.trigger('change:status', {collection: 'Projects', status: 'Adding', count: slugs.length});

			_.each(slugs, function (slug) {
				var projectSubsidies = Subsidies.where({projectSlug: slug, mode: 'international'});
				if (projectSubsidies.length) { this.addOne(slug, projectSubsidies); }
			}, this);
			this.trigger('change:status', {collection: 'Projects', status: 'Ready'});
		},

		addOne: function (slug, subsidies) {
			var seed = _.first(subsidies);
			var	project = new Project({
					name: seed.get('project'),
					slug: slug,
					subsidies: subsidies
				});
			this.add(project);
		}
	});

	return new Projects();
});
