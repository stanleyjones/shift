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
		comparator: 'slug',

		initialize: function () {
		},

		addAll: function () {
			var _this = this,
				subsidies = Subsidies.where({mode: 'international'});
			_.each(subsidies, function (s) {
				var project = _this.findWhere({name: s.get('project')});
				if (!project) { // Doesn't exist yet
					project = new Project({
						name: s.get('project'),
						slug: s.get('projectSlug'),
						subsidies: []
					});
					_this.add(project);
				}
				var projectSubsidies = project.get('subsidies');
				projectSubsidies.push(s);
				project.set({subsidies: projectSubsidies});
			});
			this.trigger('change:status', {collection: 'Projects', status: 'Adding', count: this.length});

			_.each(this.models, function (p) { p.calcTotal(); });
			this.trigger('change:status', {collection: 'Projects', status: 'Ready'});
		}

	});

	return new Projects();
});
