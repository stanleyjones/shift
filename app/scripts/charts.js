define([
	'jquery',
	'underscore',
	'd3',
	'datatables',
	'globals',
	'helpers'
], function ($, _, d3, DataTables, G, Help) {
	'use strict';

	var charts = {

		barchart: function (view) {
			var _this = view,
				size = {
					h: _this.$('.bars').height(),
					w: _this.$('.bars').width()
				}

			// Setup chart

			var margin = 30,
				w = size.w - margin * 2,
				h = size.h - margin,
				field = _this.viewState.get('field'),
				mode = _this.viewState.get('mode');

			var x = d3.scale.ordinal().rangeRoundBands([0, w], 0.1),
				y = d3.scale.linear().rangeRound([h, 0]);

			d3.select('.bars svg').remove();
			var chart = d3.select('.bars').append('svg')
				.attr('height', size.h).attr('width', '100%');

			// Organize data

			// 1. Start with all subsidies of this region
			var subsidies = _this.model.get('subsidies');

			// 2. Get unique fields (e.g. sector, stage, institution)

			var uniqFields = _this.model.uniqFields(field, mode);

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
					.attr('y', function(d) { return Math.max(0, y(d.y0) - (h - y(d.y))); })
					.attr('height', function(d) { return Math.max(0, h - y(d.y)); });
		
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
		}
	}

	return charts;
});