/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'helpers',
	'text!templates/sectors.html'
], function ($, _, Backbone, d3, Help, sectorsTemplate) {
	'use strict';

	var SectorsView = Backbone.View.extend({
		el: '#sectors',

		template: _.template(sectorsTemplate),

		events: {
		},

		initialize: function () {
			this.size = { w: $(window).width(), h: $(window).height() };
			this.radius = Math.min(this.size.w, this.size.h - 80);
			this.initial = {
				zoom: 1,
				x: d3.scale.linear().range([0, this.radius]),
				y: d3.scale.linear().range([0, this.radius])
			};
			this.render();
		},

		render: function () {
			this.$el.html(this.template());

			this.setupGraph();
			this.renderGraph();
			this.resetGraph();

			return this;
		},

		setupGraph: function () {
			this.graph = d3.select('#sectors .graph').append('svg')
				.attr('height', this.size.h)
				.attr('width', this.size.w)
				.append('g')
				.attr('transform', 'translate(' + (this.size.w - this.radius) / 2 + ',' + (this.size.h - this.radius) / 2 + ')');

			var flat = _.map(this.collection.models, function (i) { return i.toJSON(); }),
				grouped = { name: 'sectors', children: [] };
			_.each(flat, function (sector) {
				grouped.children.push({
					name: sector.name,
					slug: sector.slug,
					value: sector.total,
					category: sector.category
				});
			});
			this.nodes = d3.layout.pack()
				.size([this.radius, this.radius])
				.padding(2)
				.nodes(grouped);

			// this.graph.append('defs').append('pattern')
			// 	.attr('id', 'dftIcon')
			// 		.attr('x', 0)
			// 		.attr('y', 0)
			// 		.attr('width', function (d) { return 100; })
			// 		.attr('height', function (d) { return 100; })
			// 	.append('image')
			// 		.attr('xlink:href', '/images/sectors/default.svg')
			// 		.attr('x', 0)
			// 		.attr('y', 0)
			// 		.attr('width', function (d) { return 100; })
			// 		.attr('height', function (d) { return 100; });
		},

		renderGraph: function () {
			var _this = this;

			this.graph.selectAll('.bubble')
				.data(this.nodes)
				.enter().append('circle')
					.attr('id', function (d) { return d.slug; })
					.attr('class', function (d) { return d.parent ? d.category + ' bubble' : 'root'; })
					.attr('cx', function () { return _this.size.w / 2; })
					.attr('cy', function () { return _this.size.h / 2; })
					.attr('r', 0)
					.on('click', function (d) { _this.zoomSector(d); });

			this.graph.selectAll('.label')
				.data(this.nodes)
				.enter().append('text')
					.attr('class', function (d) { return d.parent ? (d.children ? 'label group' : 'label') : 'root'; })
					.attr('x', function () { return _this.size.w / 2; })
					.attr('y', function () { return _this.size.h / 2; })
					.attr('dy', function (d) { return d.children ? '-.35em' : '.35em'; })
					.attr('text-anchor', 'middle')
					.style('opacity', 0)
					.style('font-size', '0')
					.text(function (d) { return d.abbr || d.name; });

			// var icons = this.graph.selectAll('.icon')
			// 	.data(this.nodes)
			// 	.enter().append('circle')
			// 		.attr('class', 'icon')
			// 		.attr('cx', function (d) { return _this.size.w / 2; })
			// 		.attr('cy', function (d) { return _this.size.h / 2; })
			// 		.attr('r', 0)
			// 		.style('fill', 'url(#dftIcon)');
		},

		resetGraph: function () {
			var resetting = this.graph.transition().duration(1000);

			resetting.selectAll('.bubble')
				.delay(function (d, i) { return i * 25; })
				.attr('cx', function (d) { return d.x; })
				.attr('cy', function (d) { return d.y; })
				.attr('r', function (d) { return d.r; })
				.style('fill', function (d) {
					var color = d3.scale.linear()
						.domain([-1, 1])
						.range(['#333', '#3f3']);
					return d.ratio ? color(d.ratio) : '';
				});

			resetting.selectAll('.label')
				.delay(function (d, i) { return i * 25; })
				.attr('x', function (d) { return d.x; })
				.attr('y', function (d) { return d.children ? d.y - d.r : d.y; })
				.style('font-size', function (d) { return d.children ? '1em' : (2 * d.r / (d.abbr ? d.abbr.length : d.name.length)); })
				.style('opacity', function (d) { return d.r > 15 ? 1 : 0; });

			// resetting.selectAll('.icon')
			// 	.delay(function (d, i) { return i * 25; })
			// 	.attr('cx', function (d) { return d.x; })
			// 	.attr('cy', function (d) { return d.y; })
			// 	.attr('r', function (d) { return d.r / 2; });
		},

		zoomSector: function (d) {
			var sector = this.collection.findWhere({slug: d.slug});
			if (sector) {
				Backbone.history.navigate('sectors/' + d.slug, {trigger: true});

				d3.select('.bubble#' + d.slug).classed('active', true);

				var zoom = this.radius / d.r / 2.5,
					x = d3.scale.linear().range([0, this.radius]).domain([d.x - d.r, d.x + d.r]),
					y = d3.scale.linear().range([0, this.radius]).domain([d.y - d.r, d.y + d.r]);

				var zooming = this.graph.transition()
					.duration(1000);

				zooming.selectAll('circle')
					.attr('cx', function (d) { return x(d.x); })
					.attr('cy', function (d) { return y(d.y); })
					.attr('r', function (d) { return zoom * d.r; });

				zooming.selectAll('text')
					.attr('x', function (d) { return x(d.x); })
					.attr('y', function (d) { return y(d.y); })
					.style('font-size', function (d2) { return d === d2 ? '48px' : 0; })
					.style('opacity', 1);
			}
		},

		highlight: function (slug) {
			var d = _.find(this.nodes, function (i) { return i.slug === slug; });
			this.zoomSector(d);
		}

	});

	return SectorsView;
});
