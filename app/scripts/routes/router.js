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
			'sectors(/:slug)': 'sectors'
		},

		intro: function () {
			this.app.showIntro();
		},

		regions: function (mode, cc) {
			if (!mode && !cc) {
				mode = this.app.appState.get('mode');
				Backbone.history.navigate('regions/' + mode);
			}

			this.app.appState.set({pane: 'regions', mode: mode});
			if (cc) { this.app.appState.set({card: 'region', id: cc}); }
			else { this.app.appState.set({card: null, id: null}); }
		},

		institutions: function (abbr) {
			this.app.appState.set({pane: 'institutions'});
			if (abbr) { this.app.appState.set({card: 'institution', id: abbr}); }
		},

		sectors: function (slug) {
			this.app.appState.set({pane: 'sectors'});
			if (abbr) { this.app.appState.set({card: 'sector', id: slug}); }
		}
	});

	return Router;
});
