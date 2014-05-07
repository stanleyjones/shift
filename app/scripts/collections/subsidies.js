/*global define*/

define([
	'underscore',
	'backbone',
	'localstorage',
	'globals',
	'helpers',
	'models/subsidy'
], function (_, Backbone, Store, G, Help, Subsidy) {
	'use strict';

	var Subsidies = Backbone.Collection.extend({
		model: Subsidy,

		localStorage: new Store(G.APP_NAME),

		initialize: function () {
			this.comparator = 'date';
		},

		parse: function (res) {
			this.trigger('change:status', {collection: 'Subsidies', status: 'Loading'});
			if (!res.length || this.isExpired()) {
				this.trigger('change:status', {collection: 'Subsidies', status: 'Updating'});
				this.fetchAPI();
			} else {
				this.trigger('change:status', {collection: 'Subsidies', status: 'Ready'});
				return this.reset(res);
			}
		},	

		setExpiry: function () {
			var expires = new Date().getTime() + 1000 * 360 * G.API_EXPIRY;
			localStorage.setItem(G.APP_NAME + '-expires', expires);
		},

		isExpired: function () {
			var now = new Date().getTime(),
				expires = localStorage.getItem(G.APP_NAME + '-expires');
			return now > expires;
		},

		emptyLocalStorage: function () {
			var m;
			while (m = _.first(this.models)) { m.destroy(); }
		},

		fetchAPI: function () {
			var srcs = G.PRODUCTION ? G.API_PRODUCTION : G.API_DEVELOPMENT,
				_this = this;

			this.emptyLocalStorage();

			_.each(srcs, function (src) {
				$.getJSON(src.url)
				.done(function (json) {
					_this.trigger('change:status', {collection: 'Subsidies', status: 'Parsing'});
					var parsedJSON = _this.parseJSON(json);

					_this.trigger('change:status', {collection: 'Subsidies', status: 'Processing'});
					_.each(parsedJSON, function (raw, index) {
						var subsidy = _this.process(raw, src.mode);
						if (subsidy.isValid()) {
							_this.add(subsidy);
							subsidy.save();
						} else {
							// console.log(subsidy.validationError);
						}
					});
					
					_this.trigger('change:status', {collection: 'Subsidies', status: 'Ready'});
					_this.reset(_this.models);
				})
				.fail(function (request, status, error) {
					_this.trigger('change:status', {collection: 'Subsidies', status: 'Failed'});
					console.log('[FAIL]', error.message);
				});
			});
			this.setExpiry();
		},

		parseJSON: function (json) {
			var parsed = [];
			_.each(json.rows, function(row, rowIndex) {
				var subsidy = {};
				_.each(json.columns, function(col, colIndex) {
					subsidy[json.columns[colIndex]] = row[colIndex];
				});
				parsed.push(subsidy);
			});
			return parsed;
		},

		process: function (subsidy, mode) {
			if (mode == 'international') { return this.processIntl(subsidy); }
			if (mode == 'national') { return this.processNtnl(subsidy); }
			return false;
		},

		processIntl: function (subsidy) {
			var newSubsidy = {
				mode: 'international',

				visible: subsidy.visible,
				amount: parseInt(subsidy.amountUSD, 10) || 0,
				amountFormatted: Help.monetize(subsidy.amountUSD),
				date: subsidy.date,
				year: new Date(subsidy.date).getFullYear(),
				mechanism: subsidy.mechanism,

				region: subsidy.region,
				regionCC: subsidy.regionCC,

				sector: subsidy.sector,
				sectorSlug: Help.slugify(subsidy.sector),

				project: subsidy.project,
				projectSlug: Help.slugify(subsidy.project),
				description: subsidy.projectDesc,

				category: Help.slugify(subsidy.category),
				stage: subsidy.stage,
				access: subsidy.access,

				institution: subsidy.institution,
				institutionAbbr: subsidy.institutionAbbr,
				institutionGroup: subsidy.institutionGroup
			};
			return new Subsidy(newSubsidy);
		},

		processNtnl: function (subsidy) {
			subsidy.mode = 'national';
			subsidy.regionName = subsidy.project.country;
			subsidy.regionCC = subsidy.project.cc;
			return new Subsidy(subsidy);
		},

		inRegion: function (cc) {
			return this.where({regionCC: cc});
		},

		fromInstitution: function (abbr) {
			return this.where({institutionAbbr: abbr});
		},

		toSector: function (slug) {
			return this.where({sectorSlug: slug});
		},

		forProject: function (slug) {
			return this.where({projectSlug: slug});
		}

	});

	return new Subsidies();
});
