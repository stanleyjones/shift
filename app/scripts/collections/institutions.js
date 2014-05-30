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

		initialize: function () {
			// this.listenTo(Subsidies, 'reset', this.addAll);
		},

		addAll: function () {
			var abbrs = _.uniq(Subsidies.pluck('institutionAbbr'), false);
			this.trigger('change:status', {collection: 'Institutions', status: 'Adding', count: abbrs.length});

			_.each(abbrs, function (abbr) {
				var institutionSubsidies = Subsidies.fromInstitution(abbr);
				this.addOne(abbr, institutionSubsidies);
			}, this);
			this.trigger('change:status', {collection: 'Institutions', status: 'Ready'});
		},

		addOne: function (abbr, subsidies) {
			var seed = _.first(subsidies),
				institution = new Institution({
					name: seed.get('institution'),
					abbr: seed.get('institutionAbbr'),
					group: seed.get('institutionGroup'),
					subsidies: subsidies
				});
			this.add(institution);
		}
	});

	return new Institutions();
});
