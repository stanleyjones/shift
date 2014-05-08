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
	'views/intro',
	'views/regions',
	'views/region',
	'views/institutions',
	'views/institution',
	'views/sectors',
	'views/sector',
	'views/project'
], function ($, _, Backbone, Bootstrap, Router, Subsidies, Projects, Regions, Institutions, Sectors, IntroView, RegionsView, RegionView, InstitutionsView, InstitutionView, SectorsView, SectorView, ProjectView) {
	'use strict';

	var AppView = Backbone.View.extend({
		el: '#app',

		events: {
			'click .carousel-control': 'setPane',
			'click #intro .open': function () { this.appState.set('pane', 'regions'); },
			'click #card .close': function () { this.appState.set({card: null, id: null}); },
			'click #card .project': 'setProject'
		},

		initialize: function () {
			this.appState = new Backbone.Model({
				App: 'Initializing',
				mode: 'international',
				pane: null,
				card: null,
				id: null,
				project: null
			});
			this.appState.on('change', this.reportStatus, this);
			this.appState.on('change:pane', this.handlePane, this);
			this.appState.on('change:card', this.handleCard, this);
			this.appState.on('change:id', this.handleCard, this);
			this.appState.on('change:project', this.handleProject, this);
			this.appState.set({App: 'Loading'});

			this.router = new Router(this);

			this.listenTo(Subsidies, 'change:status', this.updateStatus);
			this.listenTo(Projects, 'change:status', this.updateStatus);
			this.listenTo(Regions, 'change:status', this.updateStatus);
			this.listenTo(Institutions, 'change:status', this.updateStatus);
			this.listenTo(Sectors, 'change:status', this.updateStatus);

			this.header = this.$('#oilchange-header');
			this.intro = this.$('#intro');
			this.main = this.$('#main');
			this.card = this.$('#card');

			Subsidies.fetch();
		},

// STATUS

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
			if (this.isReady('Sectors')) {
				this.sectorsView = new SectorsView({collection: Sectors});
			}
			if (
				this.isReady('Subsidies') &&
				this.isReady('Projects') &&
				this.isReady('Regions') &&
				this.isReady('Institutions') &&
				this.isReady('Sectors')
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

// HANDLERS

		handlePane: function () {
			if (this.isReady() && this.appState.has('pane')) { this.showPane(); }
			else if (!this.isReady()) { this.$('#loader').show(); }
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
			this.introView = this.introView || new IntroView();
			this.$('#loader').hide();
			this.$('#intro').show();
		},

		showPane: function () {
			this.$('#intro').fadeOut();
			var pane = this.appState.get('pane');
			this.$('#' + pane).addClass('active').siblings().removeClass('active');

			if (pane === 'regions') { this.showRegions(); }
			if (pane === 'institutions') { this.showInstitutions(); }
			if (pane == 'sectors') { this.showSectors(); }
		},

		setPane: function (ev) {
			var pane = $(ev.target).data('pane') ||
				$(ev.target).parents('.carousel-control').data('pane');
			this.router.navigate(pane);
		},

		showRegions: function () {
			var mode = this.appState.get('mode'),
				cc = this.appState.get('id');
			this.regionsView = this.regionsView || new RegionsView({collection: Regions, mode: mode});

			if (cc) { this.showRegion(); }
			else { this.regionsView.resetGlobe(); }
		},

		showInstitutions: function () {
			var slug = this.appState.get('id');
			this.institutionsView = this.institutionsView || new InstitutionsView({collection: Institutions});

			if (slug) { this.showInstitution(); }
			else { this.institutionsView.resetGraph(); }
		},

		showSectors: function () {
			var slug = this.appState.get('id');
			this.sectorsView = this.sectorsView || new SectorsView({collection: Sectors});

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

		showInstitution: function () {
			var slug = this.appState.get('id'),
				institution = Institutions.findWhere({slug: slug});
			if (institution) {
				var institutionView = new InstitutionView({model: institution});
				this.institutionsView.highlight(slug);
			}
		},

		showSector: function () {
			var slug = this.appState.get('id'),
				sector = Sectors.findWhere({slug: slug});
			if (sector) {
				var sectorView = new SectorView({model: sector});
				this.sectorsView.highlight(slug);
			}
		},

		closeCard: function () {
			this.$('#card').removeClass('open');
			this.$('#header, .carousel-control, .carousel-caption').fadeIn();
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
				var projectView = new ProjectView({model: project});
			}
			$('#project-' + projectSlug).modal();
		}

	});

	return AppView;
});
