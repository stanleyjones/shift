/*global define*/

define([
	'underscore',
	'backbone',
	'collections/subsidies',
	'models/institution'
], function (_, Backbone, Subsidies, Institution) {
	'use strict';

	var Institutions = Backbone.Collection.extend({
		model: Institution,

		initialize: function (options) {
			this.listenTo(Subsidies, 'reset', this.resetAll);
		},

		resetAll: function () {
			this.trigger('change:status', {collection: 'Institutions', status: 'Resetting'});
			var institutionAbbrs = _.uniq(Subsidies.pluck('institutionAbbr'), false);
			this.addAll(institutionAbbrs);
		},

		addOne: function (abbr, subsidies) {
			var seed = _.first(subsidies),
				institution = new Institution({
					name: seed.get('institution'),
					abbr: seed.get('institutionAbbr'),
					subsidies: subsidies
				});
			this.add(institution);
		},

		addAll: function (abbrs) {
			_.each(abbrs, function (abbr) {
				var institutionSubsidies = Subsidies.fromInstitution(abbr);
				this.addOne(abbr, institutionSubsidies);
			}, this);
			this.trigger('change:status', {collection: 'Institutions', status: 'Ready'});
			this.trigger('reset');
		}
	});

	return new Institutions();
});
