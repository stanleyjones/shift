/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrap',
	'routes/router',
	'collections/subsidies',
	'collections/regions',
	'collections/institutions',
	'views/intro',
	'views/regions',
	'views/region',
	'views/institutions'
], function ($, _, Backbone, Bootstrap, Router, Subsidies, Regions, Institutions, IntroView, RegionsView, RegionView, InstitutionsView) {
	'use strict';

	var AppView = Backbone.View.extend({
		el: '#app',

		events: {
			'click .left': 'prevPane',
			'click .right': 'nextPane',
			'click .open': function () { this.appState.set('pane', 'regions'); },
			'click .close': function () { this.appState.set({card: null, id: null}); }
		},

		initialize: function () {
			this.appState = new Backbone.Model({
				App: 'Initializing',
				mode: 'international',
				pane: null,
				card: null,
				id: null,
				modal: null
			});
			this.appState.on('change', this.reportStatus, this);
			this.appState.on('change:pane', this.handlePane, this);
			this.appState.on('change:card', this.handleCard, this);
			this.appState.on('change:id', this.handleCard, this);
			this.appState.set({App: 'Loading'});

			this.router = new Router(this);

			this.listenTo(Subsidies, 'change:status', this.updateStatus);
			this.listenTo(Regions, 'change:status', this.updateStatus);
			this.listenTo(Institutions, 'change:status', this.updateStatus);

			this.header = this.$('#oilchange-header');
			this.intro = this.$('#intro');
			this.main = this.$('#main');
			this.card = this.$('#card');

			Subsidies.fetch();
		},

		reportStatus: function (args) {
			var timerStart = this.timer || new Date(),
				timerStop = new Date(),
				elapsed = ((timerStop - timerStart) / 1000).toFixed(2) + 's';
			console.log(elapsed, args.changed);
			this.timer = timerStart;
			this.$('#loader .status-message').text(this.appState.get('App'));
		},

		updateStatus: function (args) {
			if (args && args.collection && args.status) {
				this.appState.set(args.collection, args.status);
			}
			if (this.isReady('Regions')) {
				this.regionsView = new RegionsView({collection: Regions});
			}
			if (this.isReady('Institutions')) {
				this.institutionsView = new InstitutionsView({collection: Institutions});
			}
			// if (this.isReady('Sectors')) {
				// this.sectorsView = new SectorsView({collection: Sectors});
			// }
			if (
				this.isReady('Subsidies') &&
				this.isReady('Regions') &&
				this.isReady('Institutions')
			) {
				this.appState.set({App: 'Ready'});
				this.fire();
			}
		},

		isReady: function (module) {
			var module = module || 'App';
			return this.appState.get(module) === 'Ready';
		},

		fire: function () {
			this.$('#loader').hide();
			this.handlePane();
			this.handleCard();
		},

		showIntro: function() {
			this.introView = this.introView || new IntroView();
			this.$('#intro').show();
		},

		handlePane: function () {
			if (this.isReady() && this.appState.has('pane')) { this.showPane(); }
			else if (!this.isReady()) { this.$('#loader').show(); }
		},

		handleCard: function () {
			if (this.isReady() && this.appState.has('card')) { this.showCard(); }
			else if (this.isReady() && !this.appState.has('card')) { this.closeCard(); }
		},

		showPane: function () {
			this.$('#intro').fadeOut();
			var pane = this.appState.get('pane');
			this.$('#' + pane).addClass('active').siblings().removeClass('active');

			if (pane === 'regions') { this.showRegions(); }
			if (pane === 'institutions') { this.showInstitutions(); }
			// if (pane == 'sectors') { this.showSectors(); }
		},

		showRegions: function () {
			var mode = this.appState.get('mode'),
				cc = this.appState.get('id');
			this.regionsView = this.regionsView || new RegionsView({collection: Regions, mode: mode});

			if (this.appState.get('id')) { this.showRegion(); }
			else { this.regionsView.resetGlobe(); }
		},

		showInstitutions: function (abbr) {
			this.institutionsView = this.institutionsView || new InstitutionsView({collection: Institutions});
			this.institutionsView.render();

			if (abbr) {
				// Nothing yet
			}

			this.appState.set({pane: 'institutions'});
		},

		showSectors: function (abbr) {
			this.sectorsView = this.sectorsView || new SectorsView();
			this.sectorsView.$el.addClass('active');
			this.sectorsView.render();

			if (abbr) {
				// Nothing yet
			}
		},



		prevPane: function () {
		},

		nextPane: function () {
		},

		showCard: function () {
			var card = this.appState.get('card');
			if (card === 'region') { this.showRegion(); }

			this.$('#card').addClass('open');
			this.$('#header, .carousel-control, .carousel-caption').fadeOut();
		},

		showRegion: function () {
			var cc = this.appState.get('id'),
				region = Regions.findWhere({cc: cc});
			if (region) {
				var regionView = new RegionView({model: region});
				this.regionsView.highlight(cc);
			}
		},

		closeCard: function () {
			this.$('#card').removeClass('open');
			this.$('#header, .carousel-control, .carousel-caption').fadeIn();
			this.handlePane();
			Backbone.history.navigate(this.appState.get('pane'), {trigger: true});
		}
		
	});

	return AppView;
});
