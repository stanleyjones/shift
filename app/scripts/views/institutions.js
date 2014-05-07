/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'text!templates/institutions.html'
], function ($, _, Backbone, d3, institutionsTemplate) {
	'use strict';

	var InstitutionsView = Backbone.View.extend({
		el: '#institutions',

		template: _.template(institutionsTemplate),

		events: {
		},

		initialize: function () {
			this.size = {
				w: Math.max($(window).width(), this.$el.width()),
				h: Math.max($(window).height(), this.$el.height())
			};
			this.initial = {
				scale: this.size.h / 2.75,
				rotate: [30,-10]
			};

			this.render();
		},

		render: function () {
			this.$el.html(this.template());

			this.graph = d3.select('.graph').append('svg')
				.attr('height', this.size.h)
				.attr('width', this.size.w);

			this.renderGraph();

			return this;
		},

		renderGraph: function () {
			var _this = this;
			var flat = _.map(this.collection.models, function (institution) {
				return institution.toJSON();
			});

			var groups = _.uniq(_.pluck(flat, 'group'));
			var grouped = { name: 'institutions', children: [] };
			_.each(groups, function (group) {
				var groupInstitutions = _.where(flat, {group: group});
				if (group) {
					grouped.children.push({
						name: group,
						children: _.map(groupInstitutions, function (institution) {
							return {
								name: institution.name,
								value: institution.total,
								ratio: institution.ratio
							};
						})
					});
				} else {
					_.each(groupInstitutions, function (institution) {
						grouped.children.push({
							name: institution.name,
							value: institution.total,
							ratio: institution.ratio
						});
					});
				}
			});
			// console.log(grouped);

			var nodes = d3.layout.pack()
				.size([this.size.w, this.size.h])
				.padding(2)
				.nodes(grouped);
			// console.log(nodes);

			var bubbles = this.graph.selectAll('circle')
				.data(nodes)
				.enter().append('circle')
					.attr('class', function (d) { return d.parent ? (d.children ? 'bubble group' : 'bubble') : 'root'; })
					.attr('cx', function (d) { return _this.size.w / 2; })
					.attr('cy', function (d) { return _this.size.h / 2; })
					.attr('r', 0);

			bubbles.transition().duration(1000)
				.delay(function (d, i) { return i * 25; })
				.attr('cx', function (d) { return d.x; })
				.attr('cy', function (d) { return d.y; })
				.attr('r', function (d) { return d.r; })
				.style('fill', function (d) {
					var color = d3.scale.linear()
						.domain([-1, 1])
						.range(['#333', '#3f3']);
					return d.ratio ? color(d.ratio) : 'none';
				});
		}

	});

	return InstitutionsView;
});
