/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'bootstrap',
	'routes/router',
	'collections/subsidies',
	'collections/projects',
	'collections/regions',
	'collections/institutions',
	'collections/sectors',
	'views/loader',
	'views/intro',
	'views/static',
	'views/regions',
	'views/region',
	'views/institutions',
	'views/institution',
	'views/sectors',
	'views/sector',
	'views/project'
], function ($, _, Backbone, Bootstrap, Router, Subsidies, Projects, Regions, Institutions, Sectors, LoaderView, IntroView, StaticView, RegionsView, RegionView, InstitutionsView, InstitutionView, SectorsView, SectorView, ProjectView) {
	'use strict';

	var AppView = Backbone.View.extend({
		el: '#app',

		events: {
			'click .carousel-control': 'setPane',
			'click #intro .open': function () { this.appState.set('pane', 'regions'); },
			'click #card .close': function () { this.appState.set({card: null, id: null}); },
			'click #card .project': 'setProject',
			'click #static .close': 'closeStatic'
		},

		initialize: function () {
			this.appState = new Backbone.Model({
				status: 'Initialized',
				mode: 'international',
				pane: null,
				card: null,
				id: null,
				project: null
			});
			this.appState.on('change:status', this.reportStatus, this);
			this.appState.on('change:mode', this.handlePane, this);
			this.appState.on('change:pane', this.handlePane, this);
			this.appState.on('change:id', this.handleCard, this);
			this.appState.on('change:project', this.handleProject, this);

			this.router = new Router(this);
			this.loader = new LoaderView();
			this.appState.set({status: 'Loading'});

			this.listenTo(Subsidies, 'change:status', this.updateStatus);
			this.listenTo(Projects, 'change:status', this.updateStatus);
			this.listenTo(Regions, 'change:status', this.updateStatus);
			this.listenTo(Institutions, 'change:status', this.updateStatus);
			this.listenTo(Sectors, 'change:status', this.updateStatus);

			this.header = this.$('#oilchange-header');
			this.intro = this.$('#intro');
			this.main = this.$('#main');
			this.card = this.$('#card');

			_.delay(function () { Subsidies.fetch(); }, 100);
		},

// STATUS

		reportStatus: function () {
			var status = this.appState.get('status'),
				timerStart = this.timer || new Date(),
				timerStop = new Date(),
				elapsed = ((timerStop - timerStart) / 1000).toFixed(2) + 's';
			this.timer = timerStart;
			console.log(elapsed, status);
			this.loader.viewState.set({status: status});
		},

		updateStatus: function (args) {
			if (args.status === 'Ready') {
				this.appState.set(args.collection, args.status);
				if (args.collection === 'Subsidies') {
					_.delay(function () { Projects.addAll(); }, 100);
				}
				if (args.collection === 'Projects') {
					_.delay(function () { Regions.addAll(); }, 100);
				}
				if (args.collection === 'Regions') {
					this.regionsView = new RegionsView({collection: Regions});
					_.delay(function () { Institutions.addAll(); }, 100);
				}
				if (args.collection === 'Institutions') {
					this.institutionsView = new InstitutionsView({collection: Institutions});
					_.delay(function () { Sectors.addAll(); }, 100);
				}
				if (args.collection === 'Sectors') {
					this.sectorsView = new SectorsView({collection: Sectors});
				}
			} else {
				var status = args.status + ' ' + (args.count ? args.count + ' ' : '') + args.collection;
				this.appState.set({status: status});
			}
			if (
				this.isReady('Subsidies') &&
				this.isReady('Projects') &&
				this.isReady('Regions') &&
				this.isReady('Institutions') &&
				this.isReady('Sectors')
			) {
				this.appState.set({status: 'Ready'});
				this.fire();
			}
		},

		isReady: function (module) {
			var mod = module || 'status';
			return this.appState.get(mod) === 'Ready';
		},

		fire: function () {
			this.$('#loader').addClass('ready').delay(1000).fadeOut();
			this.handlePane();
			this.handleCard();
		},

// HANDLERS

		handlePane: function () {
			if (this.isReady() && this.appState.has('pane')) { this.showPane(); }
		},

		handleCard: function () {
			if (this.isReady() && this.appState.has('card')) { this.showCard(); }
			else if (this.isReady() && !this.appState.has('card')) { this.closeCard(); }
		},

		handleProject: function () {
			if (this.isReady() && this.appState.has('project')) { this.showProject(); }
		},

// PANES

		showIntro: function() {
			this.introView = this.introView || new IntroView({app: this});
		},

		showStatic: function(page) {
			this.staticView = new StaticView({page: page});
			this.$('#static').slideDown();
		},

		closeStatic: function() {
			this.$('#static').slideUp();
		},

		showPane: function () {
			this.$('#intro').fadeOut();
			var pane = this.appState.get('pane');
			this.$('#' + pane).addClass('active').siblings().removeClass('active');

			if (pane === 'regions') { this.showRegions(); }
			if (pane === 'institutions') { this.showInstitutions(); }
			if (pane === 'sectors') { this.showSectors(); }
		},

		setPane: function (ev) {
			var pane = $(ev.target).data('pane') ||
				$(ev.target).parents('.carousel-control').data('pane');
			this.router.navigate(pane);
		},

		showRegions: function () {
			var mode = this.appState.get('mode'),
				cc = this.appState.get('id');
			this.regionsView.viewState.set({mode: mode});

			if (cc) { this.showRegion(); }
			else { this.regionsView.resetGlobe(); }
		},

		showInstitutions: function () {
			var slug = this.appState.get('id');

			if (slug) { this.showInstitution(); }
			else { this.institutionsView.resetGraph(); }
		},

		showSectors: function () {
			var slug = this.appState.get('id');

			if (slug) { this.showSector(); }
			else { this.sectorsView.resetGraph(); }
		},

// CARDS

		showCard: function () {
			var card = this.appState.get('card');
			if (card === 'region') { this.showRegion(); }
			if (card === 'institution') { this.showInstitution(); }
			if (card === 'sector') { this.showSector(); }

			this.$('#card').addClass('open');
			this.$('#header, .carousel-control, .carousel-caption, .mode-selector').fadeOut();
		},

		showRegion: function () {
			var cc = this.appState.get('id'),
				mode = this.appState.get('mode'),
				region = Regions.findWhere({cc: cc});
			if (region) {
				new RegionView({model: region, mode: mode});
				this.regionsView.highlight(cc);
			}
		},

		showInstitution: function () {
			var slug = this.appState.get('id'),
				institution = Institutions.findWhere({slug: slug});
			if (institution) {
				new InstitutionView({model: institution});
				this.institutionsView.highlight(slug);
			}
		},

		showSector: function () {
			var slug = this.appState.get('id'),
				sector = Sectors.findWhere({slug: slug});
			if (sector) {
				new SectorView({model: sector});
				this.sectorsView.highlight(slug);
			}
		},

		closeCard: function () {
			this.$('#card').removeClass('open');
			this.$('#header, .carousel-control, .carousel-caption, .mode-selector').fadeIn();
			this.handlePane();
			Backbone.history.navigate(this.appState.get('pane'), {trigger: true});
		},

// PROJECTS

		setProject: function (ev) {
			var project = $(ev.target).parents('.project').data('project');
			this.appState.set({project: project});
		},

		showProject: function () {
			var projectSlug = this.appState.get('project'),
				project = Projects.findWhere({slug: projectSlug});
			if (project) {
				new ProjectView({model: project});
			}
			$('#project-' + projectSlug).modal();
		}

	});

	return AppView;
});
