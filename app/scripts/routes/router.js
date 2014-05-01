/*global define*/

define([
	'jquery',
	'backbone',
	'collections/subsidies',
	'collections/regions',
	'collections/institutions',
	'views/regions',
	'views/region',
	'views/institutions',
	'views/sectors'
], function ($, Backbone, Subsidies, Regions, Institutions, RegionsView, RegionView, InstitutionsView, SectorsView) {
	'use strict';

	var Router = Backbone.Router.extend({
		
		initialize: function (app) {
			this.app = app;
			Backbone.history.start();
		},

		routes: {
			'': 'intro',
			'regions(/:mode)(/:cc)': 'regions',
			'institutions(/:abbr)': 'institutions',
			'sectors(/:abbr)': 'sectors'
		},

		intro: function () {
			this.app.showIntro();
		},

		regions: function (mode, cc) {
			if (!mode && !cc) {
				var mode = 'international';
				Backbone.history.navigate('regions/' + mode);
			}
			this.app.showRegions(mode, cc);
			this.app.appState.set({pane: 'regions'});
			if (cc) { this.app.appState.set({detail: 'region'}); }
		},

		institutions: function (abbr) {
			this.app.showInstitutions(abbr);
			this.app.appState.set({pane: 'institutions'});
			if (abbr) { this.app.appState.set({detail: 'institution'}); }
		},

		sectors: function (abbr) {
			this.app.showSectors(abbr);
			this.app.appState.set({pane: 'sectors'});
			if (abbr) { this.app.appState.set({detail: 'sector'}); }
		}
	});

	return Router;
});
