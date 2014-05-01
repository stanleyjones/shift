/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'globals',
	'helpers',
	'text!templates/region.html'
], function ($, _, Backbone, d3, G, Help, regionTemplate) {
	'use strict';

	var RegionView = Backbone.View.extend({
		el: '#detail',

		template: _.template(regionTemplate),

		events: {
			'click .detail-toggle': 'renderChart'
		},

		initialize: function () {
			this.viewState = new Backbone.Model({field: 'sector'});

			this.viewState.on('change:size', this.renderChart, this);

			this.chart = this.$('.region-chart');
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			this.renderChart();
			this.renderLegend();
		},

		renderChart: function () {
			var _this = this;

			var	chartEl = this.chart;
			console.log(chartEl.width());

			// Setup chart

			var margin = 20,
				w = this.$el.width() - margin * 3,
				h = this.$el.height() * 0.66 - margin,
				field = this.viewState.get('field');

			var x = d3.scale.ordinal().rangeRoundBands([0, w], 0.1),
				y = d3.scale.linear().rangeRound([h, 0]);

			d3.select('.region-chart svg').remove();
			var chart = d3.select('.region-chart').append('svg')
				.attr('height', h + margin * 2).attr('width', '100%');

			// Organize data

			// 1. Start with all subsidies of this region
			var subsidies = this.model.get('subsidies');

			// 2. Get unique fields (e.g. sector, stage, institution)

			var uniqFields = this.model.uniqFields(field);

			// 3. Remap to D3's preferred format

			var layers = _.map(uniqFields, function (uniqField) {
				var values = [];
				for (var year = G.START_YEAR; year <= G.END_YEAR; year++) {
					var filteredSubsidies = _.filter(subsidies, function (sub) {
						return sub.get('year') == year && sub.get(field) == uniqField;
					});
					values.push({
						x: year,
						y: _.reduce(filteredSubsidies, function (memo, sub) {
							return memo + sub.get('amount');
						}, 0)
					});
				}
				return {name: uniqField, values: values};
			});
			// console.log('Layers:', layers);

			//	[
			//		{name: 'oil', values: [{x: 2008, y: 100}, {x: 2009, y: 150}]},
			//		{name: 'gas', values: [{x: 2008, y: 150}, {x: 2009, y: 200}]}
			//	]

			// 4. Use stack() to calculate y0

			var stacked = d3.layout.stack()
				.values(function (d) { return d.values; })
				.offset('zero')
				(layers);
			// console.log('Layout:', stacked);
			//	[
			//		{name: 'oil', values: [{x: 2008, y: 100, y0: 0}, {x: 2009, y: 150, y0: 0}]},
			//		{name: 'gas', values: [{x: 2008, y: 150, y0: 100}, {x: 2009, y: 200, y0: 150}]}
			//	]

			// Layout

			x.domain(stacked[0].values.map(function (d) { return d.x; }));
			y.domain([0, d3.max(stacked[stacked.length - 1].values, function (d) {
				return d.y0 + d.y;
			})]);
		
			var stacks = chart.selectAll('g.stack')
				.data(stacked)
				.enter().append('g')
				.attr('class', function (d) { return 'stack ' + Help.slugify(d.name); });
		
			var bars = stacks.selectAll('rect')
				.data(function (d) { return d.values; });

				bars.enter()
					.append('rect')
					.attr('x', function(d) { return 2 * margin + x(d.x); })
					.attr('y', h)
					.attr('height', 0)
					.attr('width', x.rangeBand());

				bars.transition()
					.delay(function (d, i) { return i * 10; })
					.duration(500)
					.attr('y', function(d) { return y(d.y0) - (h - y(d.y)); })
					.attr('height', function(d) { return h - y(d.y); });
		
				bars.exit().transition()
					.duration(500)
					.attr('height', 0)
					.remove();

			// Add some axes

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient('bottom')
				.tickFormat( d3.format('2000') );
			chart.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(' + margin * 2 + ',' + h + ')')
				.call(xAxis);

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient('left')
				.ticks(3)
				.tickFormat( function(d) { return '$' + Help.suffix(d); });
			chart.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(' + margin * 2 + ',0)')
				.call(yAxis);
		},

		renderLegend: function () {
			var field = this.viewState.get('field'),
				legendFields = this.model.uniqFields(field);

			var legend = '';
			_.each(legendFields, function (field) {
				legend += '<li class="' + Help.slugify(field) + '">' + field + '</li>';
			});

			this.$('.region-legend').html(legend);
		}
	});

	return RegionView;
});
