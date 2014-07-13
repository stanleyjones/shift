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
		comparator: 'date',

		localStorage: new Store(G.APP_NAME),

		initialize: function () {
			this.comparator = 'date';
			this.on('reset', function () {
				this.trigger('change:status', {collection: 'Subsidies', status: 'Ready'});
			});
			this.progress = { pending: 0, done: 0 };
			this.total = 0;
		},

		parse: function (res) {
			if (!res.length || this.isExpired()) {
				this.trigger('change:status', {collection: 'Subsidies', status: 'Updating'});
				this.fetchCache();
			} else {
				this.trigger('change:status', {collection: 'Subsidies', status: 'Adding', count: res.length});
				this.trigger('reset');
				return res;
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

		updateStatus: function () {
			if (this.progress.pending === this.progress.done) { // Ready!
				// this.trigger('change:status', {collection: 'Subsidies', status: 'Adding', count: this.models.length});
				this.reset(this.models);
				this.setExpiry();
			} else {
				var progress = Math.round(100 * this.progress.done / this.progress.pending);
				this.trigger('change:status', {collection: 'Subsidies', status: 'Updated ' + progress + '%', total: this.total});
			}
		},

		emptyLocalStorage: function () {
			var m;
			while (m) { m.destroy(); m = _.first(this.models); }
		},

		fetchCache: function () {
			var _this = this,
				cache = [];

			var promises = _.map(G.DATACACHES, function (src) {
				return $.getJSON(src.url)
					.always(function () { _this.progress.pending++; })
					.done(function (json) { cache.push({mode: src.mode, parsed: _this.parseJSON(json)}); })
					.fail(function (err) { console.log('Error: ' + err); });
			});

			this.emptyLocalStorage();

			$.when.apply(null, promises).then(function () {

				_.each(cache, function (json) {
					var mode = json.mode,
						parsedJSON = json.parsed,
						count = 0;

					_.delay(function () {

					// Process JSON into Subsidies
						_.each(parsedJSON, function (raw) {
							var subsidies = _this.process(raw, mode);
							if (!Array.isArray(subsidies)) { subsidies = new Array(subsidies); }
							_.each(subsidies, function (subsidy) {
								if (subsidy.isValid()) {
									_this.add(subsidy);
									_this.total += subsidy.get('amount');
									// subsidy.save(); // Disabled until we can fix localStorage issues
									count++;
								} else {
									// console.log(subsidy.validationError);
								}
							});
						});
						_this.progress.done++;
						_this.updateStatus();
					}, 100);
				});
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
				amount: parseInt(subsidy.amountUSD, 10),
				amountFormatted: Help.monetize(subsidy.amountUSD),
				date: subsidy.date,
				year: parseInt(subsidy.FY, 10), //new Date(subsidy.date).getFullYear(),
				mechanism: subsidy.mechanism,

				region: subsidy.country,
				regionCC: subsidy.CC,
				geoRegion: subsidy.region,

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
				institutionGroup: subsidy.institutionGroup || 'Regional Development Banks'
			};
			return new Subsidy(newSubsidy);
		},

		processNtnl: function (subsidy) {
			var subsidies = [],
				mult = 1000000;
			for (var year = G.START_YEAR; year <= G.END_YEAR; year++) {
				var XR = !isNaN(subsidy['XR' + year]) ? parseFloat(subsidy['XR' + year]) : 1,
					rawAmount = subsidy['amount' + year],
					amount = !isNaN(rawAmount) ? parseFloat(rawAmount * XR * mult) : 0;

				var newSubsidy = {
					mode: 'national',
					visible: 'true',
					amount: amount,
					amountFormatted: Help.monetize(amount),
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

		// Filters

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
		},

		byMode: function (mode) {
			return this.where({mode: mode});
		}

	});

	return new Subsidies();
});
