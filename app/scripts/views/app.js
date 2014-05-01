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
			'click .loader': 'showMain',
			'click .detail-close': 'closeDetail'
			// 'click .region': 'showDetail'
		},

		initialize: function () {
			this.appState = new Backbone.Model({
				App: 'Initializing',
				pane: null,
				detail: null,
				id: null,
				modal: null
			});
			this.appState.on('change', this.reportStatus, this);
			this.appState.on('change:pane', this.showPane, this);
			this.appState.set({App: 'Loading'});

			this.router = new Router(this);

			this.listenTo(Subsidies, 'change:status', this.updateStatus);
			this.listenTo(Regions, 'change:status', this.updateStatus);
			this.listenTo(Institutions, 'change:status', this.updateStatus);

			this.header = this.$('#oilchange-header');
			this.intro = this.$('#intro');
			this.main = this.$('#main');
			this.detail = this.$('#detail');

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
			if (args && args.collection && args.status) { this.appState.set(args.collection, args.status); }

			if (this.isReady('Regions')) { this.regionsView = new RegionsView({collection: Regions}); }
			if (this.isReady('Institutions')) { this.institutionsView = new InstitutionsView({collection: Institutions}); }
			// if (this.isReady('Sectors')) { this.sectorsView = new SectorsView({collection: Sectors}); }

			if (this.isReady('Subsidies') && this.isReady('Regions') && this.isReady('Institutions')) {
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
		},

		showIntro: function() {
			this.introView = this.introView || new IntroView();
		},

		showRegions: function (mode, cc) {
			if (!this.isReady()) { this.$('#loader').show(); }
			this.regionsView = this.regionsView || new RegionsView({collection: Regions, mode: mode});
			this.regionsView.render();

			if (cc) {
				var region = Regions.findWhere({cc: cc});
				if (region) {
					var regionView = new RegionView({model: region});
					regionView.render();
					this.regionsView.highlight(cc);
					this.showDetail('region',cc);
				}
			} else {
				this.regionsView.resetGlobe();
			}
			this.appState.set({pane: 'regions'});
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

		showPane: function () {
			var pane = this.appState.get('pane');
			this.$('#' + pane).addClass('active').siblings().removeClass('active');

			if (pane === 'regions') { this.showRegions(); }
			if (pane === 'institutions') { this.showInstitutions(); }
			// if (pane == 'sectors') { this.showSectors(); }
		},

		prevPane: function () {
			// var previous = this.$('.pane.active').prev('.pane').attr('id');
			// this.router.navigate(previous, {trigger: true});
		},

		nextPane: function () {
			// var active = this.main.find('.pane.active').attr('id');
			// var next = this.activePane().next('.pane').attr('id');
			// this.router.navigate(active, {trigger: true});
			// this.showPane(next);
		},

		showDetail: function () {
			var detail = this.appState.get('detail'),
				id = this.appState.get('id'); // id: cc/abbr/slug
			this.detail.slideDown();
			this.$('#header, .carousel-control, .carousel-caption').fadeOut();
		},

		closeDetail: function () {
			this.appState.set({detail: null, args: null});
			var route = this.activePane().attr('id');
			// Backbone.history.navigate(route, {trigger: true});

			this.detail.slideUp();
			this.$('#header, .carousel-control, .carousel-caption').fadeIn();
		},

		activePane: function () {
			return this.pane || this.$('.pane.active');
		}
		
	});

	return AppView;
});
