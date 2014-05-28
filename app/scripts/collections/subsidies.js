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
				this.fetchCache();
			} else {
				this.trigger('change:status', {collection: 'Subsidies', status: 'Ready'});
				return this.reset(res);
			}
		},

		setExpiry: function () {
			var expires = new Date().getTime() + 1000 * 360 * G.EXPIRY;
			localStorage.setItem(G.APP_NAME + '-expires', expires);
		},

		isExpired: function () {
			var now = new Date().getTime(),
				expires = localStorage.getItem(G.APP_NAME + '-expires');
			return now > expires;
		},

		emptyLocalStorage: function () {
			var m;
			while (m) { m.destroy(); m = _.first(this.models); }
		},

		fetchCache: function () {
			var _this = this,
				cache = {};

			_this.trigger('change:status', {collection: 'Subsidies', status: 'Retrieving'});

			var promises = _.map(G.DATACACHES, function (src) {
				return $.getJSON(src.url).done( function (json) { cache[src.mode] = json; });
			});

			this.emptyLocalStorage();

			$.when.apply(null, promises).then(function () {

				_this.trigger('change:status', {collection: 'Subsidies', status: 'Processing'});

				_.each(cache, function (json, mode) {

					// Parse Google's weird JSON into a better format
					var parsedJSON = _this.parseJSON(json);

					// Process JSON into Subsidies
					_.each(parsedJSON, function (raw) {
						var subsidies = _this.process(raw, mode);
						if (!Array.isArray(subsidies)) { subsidies = new Array(subsidies); }
						_.each(subsidies, function (subsidy) {
							if (subsidy.isValid()) {
								_this.add(subsidy);
								subsidy.save();
							} else {
								// console.log(subsidy.validationError);
							}
						});
					});

				});
				_this.trigger('change:status', {collection: 'Subsidies', status: 'Ready'});
				_this.reset(_this.models);
				_this.setExpiry();
			})
			.fail(function (req, status, err) {
				_this.trigger('change:status', {collection: 'Subsidies', status: 'Failed: ' + err.message});
			});
		},

		parseJSON: function (json) {
			var parsed = [];
			_.each(json.rows, function(row) {
				var subsidy = {};
				_.each(json.columns, function(col, colIndex) {
					subsidy[json.columns[colIndex]] = row[colIndex];
				});
				parsed.push(subsidy);
			});
			return parsed;
		},

		process: function (subsidy, mode) {
			if (mode === 'international') { return this.processIntl(subsidy); }
			if (mode === 'national') { return this.processNtnl(subsidy); }
			return false;
		},

		processIntl: function (subsidy) {
			var newSubsidy = {
				mode: 'international',

				visible: subsidy.visible,
				amount: parseInt(subsidy.amountUSD, 10) || 0,
				amountFormatted: Help.monetize(subsidy.amountUSD),
				date: subsidy.date,
				year: subsidy.FY, //new Date(subsidy.date).getFullYear(),
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
				kind: subsidy.kind,

				institution: subsidy.institution,
				institutionAbbr: subsidy.institutionAbbr,
				institutionGroup: subsidy.institutionGroup
			};
			return new Subsidy(newSubsidy);
		},

		processNtnl: function (subsidy) {
			var subsidies = [];
			for (var year = G.START_YEAR; year < G.END_YEAR; year++) {
				var newSubsidy = {
					mode: 'national',
					visible: 'true',
					amount: parseInt(1000000 * subsidy['amount' + year] * subsidy['XR' + year], 10) || 0,
					amountFormatted: Help.monetize(1000000 * subsidy['amount' + year] * subsidy['XR' + year]),
					year: year,

					region: subsidy.region,
					regionCC: subsidy.regionCC,

					sector: subsidy.sector,
					sectorSlug: Help.slugify(subsidy.sector),

					project: subsidy.project,
					projectSlug: Help.slugify(subsidy.project),
					description: subsidy.notes,

					category: 'fossil-fuel',
					stage: subsidy.stage,
					access: false,

					jurisdiction: subsidy.jurisdiction
				};
				subsidies.push(new Subsidy(newSubsidy));
			}
			return subsidies;
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
