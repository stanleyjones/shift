/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'helpers',
	'text!templates/institutions.html'
], function ($, _, Backbone, d3, Help, institutionsTemplate) {
	'use strict';

	var InstitutionsView = Backbone.View.extend({
		el: '#institutions',

		template: _.template(institutionsTemplate),

		events: {
		},

		initialize: function () {
			this.size = { w: $(window).width(), h: $(window).height() };
			this.radius = Math.min(this.size.w, this.size.h - 40);
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
			this.graph = d3.select('#institutions .graph').append('svg')
				.attr('height', this.size.h)
				.attr('width', this.size.w)
				.append('g')
			    .attr('transform', 'translate(' + (this.size.w - this.radius) / 2 + ',' + (this.size.h - this.radius) / 2 + ')');

			var flat = _.map(this.collection.models, function (i) { return i.toJSON(); }),
				groups = _.uniq(_.pluck(flat, 'group')),
				grouped = { name: 'institutions', children: [] };

			_.each(groups, function (group) {
				var groupInstitutions = _.where(flat, {group: group});
				if (group) {
					grouped.children.push({
						name: group,
						slug: Help.slugify(group),
						children: _.map(groupInstitutions, function (institution) {
							return {
								name: institution.name,
								abbr: institution.abbr,
								slug: institution.slug,
								value: institution.total,
								ratio: institution.ratio
							};
						})
					});
				} else {
					_.each(groupInstitutions, function (institution) {
						grouped.children.push({
							name: institution.name,
							abbr: institution.abbr,
							slug: institution.slug,
							value: institution.total,
							ratio: institution.ratio
						});
					});
				}
			});
			this.nodes = d3.layout.pack()
				.size([this.radius, this.radius])
				.padding(2)
				.nodes(grouped);
		},

		renderGraph: function () {
			var _this = this;

			this.graph.selectAll('circle')
				.data(this.nodes)
				.enter().append('circle')
					.attr('id', function (d) { return d.slug; })
					.attr('class', function (d) { return d.parent ? (d.children ? 'bubble group' : 'bubble') : 'root'; })
					.attr('cx', function () { return _this.size.w / 2; })
					.attr('cy', function () { return _this.size.h / 2; })
					.attr('r', 0)
					.on('click', function (d) { _this.zoomInstitution(d); });

			this.graph.selectAll('text')
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
		},

		resetGraph: function () {
			var resetting = this.graph.transition().duration(1000);

			resetting.selectAll('circle')
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

			resetting.selectAll('text')
				.delay(function (d, i) { return i * 25; })
				.attr('x', function (d) { return d.x; })
				.attr('y', function (d) { return d.children ? d.y - d.r : d.y; })
				.style('font-size', function (d) { return d.children ? '1em' : (2 * d.r / (d.abbr ? d.abbr.length : d.name.length)); })
				.style('opacity', function (d) { return d.r > 15 ? 1 : 0; });
		},

		zoomInstitution: function (d) {
			var institution = this.collection.findWhere({slug: d.slug});
			if (institution) {
				Backbone.history.navigate('institutions/' + d.slug, {trigger: true});

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
			this.zoomInstitution(d);
		}

	});

	return InstitutionsView;
});
