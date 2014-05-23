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
			'institutions(/:slug)': 'institutions',
			'sectors(/:slug)': 'sectors',
			'about': 'about',
			'methodology': 'methodology',
			'exploration': 'exploration',
		},

		intro: function () { this.app.showIntro(); },
		about: function () { this.app.showStatic('about'); },
		methodology: function () { this.app.showStatic('methodology'); },
		exploration: function () { this.app.showStatic('exploration'); },

		regions: function (mode, cc) {
			if (!mode && !cc) {
				mode = this.app.appState.get('mode');
				Backbone.history.navigate('regions/' + mode);
			}

			this.app.appState.set({pane: 'regions', mode: mode});
			if (cc) { this.app.appState.set({card: 'region', id: cc}); }
			else { this.app.appState.set({card: null, id: null}); }
		},

		institutions: function (slug) {
			this.app.appState.set({pane: 'institutions'});
			if (slug) { this.app.appState.set({card: 'institution', id: slug}); }
		},

		sectors: function (slug) {
			this.app.appState.set({pane: 'sectors'});
			if (slug) { this.app.appState.set({card: 'sector', id: slug}); }
		}
	});

	return Router;
});
