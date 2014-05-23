/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'topojson',
	'text!vendor/world.json',
	'text!templates/regions.html'
], function ($, _, Backbone, d3, Topojson, World, regionsTemplate) {
	'use strict';

	var RegionsView = Backbone.View.extend({
		el: '#regions',

		template: _.template(regionsTemplate),

		events: {
			'mousedown': 'grab',
			'mousemove': 'drag',
			'mouseup': 'release'
		},

		initialize: function () {
			this.viewState = new Backbone.Model({mode: null});

			this.listenTo(this.viewState, 'change:mode', this.render);

			this.size = {
				w: Math.max(640, this.$el.width()),
				h: Math.max(640, this.$el.height())
			};
			this.initial = {
				scale: this.size.h / 2.75,
				rotate: [30,-10]
			}
			this.projection = d3.geo.orthographic()
				.scale(this.initial.scale)
				.translate([this.size.w / 2, this.size.h / 2])
				.precision(0.5)
				.clipAngle(90)
				.rotate(this.initial.rotate);
			this.path = d3.geo.path().projection(this.projection);
			this.m0 = null;
			this.o0 = null;

			this.render();
		},

		render: function () {
			this.$el.html(this.template());

			this.globe = d3.select('.globe').append('svg')
				.attr('height', this.size.h)
				.attr('width', this.size.w);

			this.renderShadow();
			this.renderShading();
			this.renderGraticule();
			this.renderRegions();

			this.resetGlobe();
			this.colorRegions();

			return this;
		},

		renderRegions: function () {
			var worldJSON = JSON.parse(World),
				regions = Topojson.feature(worldJSON, worldJSON.objects.countries).features,
				_this = this;
			this.globe.selectAll('.region')
				.data(regions)
				.enter().append('path')
					.attr('class', 'region')
					.attr('id', function (d) { return d.id; })
					.attr('d', this.path)
					.on('click', function (d) { _this.zoomRegion(d); });
		},

		renderShadow: function () {
			var shadow = this.globe.append('defs').append('radialGradient')
				.attr('cx', '50%').attr('cy', '50%')
				.attr('id', 'globeShadow');
			shadow.append('stop')
				.attr('offset','20%')
				.attr('stop-color', '#000')
				.attr('stop-opacity','.5');
			shadow.append('stop')
				.attr('offset','100%')
				.attr('stop-color', '#000')
				.attr('stop-opacity','0');
			this.globe.append('ellipse').attr('class', 'globeShadow')
				.attr('cx', '50%').attr('cy', '85%')
				.attr('rx', this.projection.scale() * 0.90)
				.attr('ry', this.projection.scale() * 0.25)
				.style('fill', 'url(#globeShadow)');
		},

		renderShading: function () {
			var shading = this.globe.append('defs').append('radialGradient')
				.attr('cx', '50%').attr('cy', '40%')
				.attr('id', 'globeShading');
			shading.append('stop')
				.attr('offset','50%').attr('stop-color', '#eee');
			shading.append('stop')
				.attr('offset','100%').attr('stop-color', '#bbb');
			this.globe.append('circle').attr('class', 'globeShading')
				.attr('cx', '50%').attr('cy', '50%')
				.attr('r', this.projection.scale())
				.attr('fill','url(#globeShading)');
		},

		renderGraticule: function () {
			this.globe.append('path')
				.datum(d3.geo.graticule())
				.attr('class', 'graticule')
				.attr('d', this.path);
		},

		colorRegions: function () {
			var _this = this,
				mode = this.viewState.get('mode');
			var regions = this.globe.selectAll('.region');
			regions.classed('disabled', true);
			regions.filter(function (d) {
					var region = _this.collection.findWhere({cc: d.id});
					return region ? region.get(mode) : false;
				})
				.classed('disabled', false)
				.transition().duration(500).delay(function (d, i) { return i * 10; })
				.style('fill', function (d) {
					return _this.colorRegion(_this.collection.findWhere({cc: d.id}));
				});
		},

		colorRegion: function (region) {
			var color, value;			
			if (this.viewState.get('mode') === 'international') {
				color = d3.scale.linear()
					.domain([-1, 0, 1])
					.range(['#333', '#ccc', '#3f3']);
				value = region.get('ratio');
			}
			if (this.viewState.get('mode') === 'national') {
				color = d3.scale.pow().exponent(0.5)
					.domain([this.collection.range.min, this.collection.range.max])
					.range(['#cc9', '#333']);
				value = region.get('total');
			}
			return color(value);
		},

		rotateGlobe: function (command) {
			var rotations = 1,
				seconds = 120,
				_this = this;
			switch( command || 'start' ) {
				case 'start':
					d3.transition().ease('linear').duration(seconds * 1000)
						.tween('rotate', function () {
							var current = _this.projection.rotate(),
							r = d3.interpolate(current, [current[0] + (rotations * 360), current[1]]);
							return function (t) {
								_this.projection.rotate(r(t));
								_this.refreshGlobe();
							};
						});
					break;
				case 'stop':
					d3.transition().duration(0);
					break;
			}
		},

		refreshGlobe: function () {
			this.globe.selectAll('path')
				.attr('d', this.path);
			this.globe.selectAll('.globeShadow')
				.attr('rx', this.projection.scale() * 0.90)
				.attr('ry', this.projection.scale() * 0.25);
			this.globe.selectAll('.globeShading')
				.attr('r', this.projection.scale());
		},

		resetGlobe: function () {
			var _this = this;
			d3.transition().duration(1000)
				.tween('rotate', function () {
					var r = d3.interpolate(_this.projection.rotate(), _this.initial.rotate),
						z = d3.interpolate(_this.projection.scale(), _this.initial.scale);
					return function (t) {
						_this.projection.rotate(r(t));
						_this.projection.scale(z(t));
						_this.refreshGlobe();
					};
				}).each('end', function() {
					_this.rotateGlobe();
				});
			d3.selectAll('.region').classed('active', false);
			// this.colorRegions();
		},

		zoomRegion: function (regionPath) {
			var _this = this,
				mode = this.viewState.get('mode'),
				region = this.collection.findWhere({cc: regionPath.id});
			if (region && region.get(mode)) {
				Backbone.history.navigate('regions/' + mode + '/' + region.get('cc'), {trigger: true});

				d3.selectAll('.region').classed('active', false);
				d3.select('.region#' + regionPath.id).classed('active', true);
				this.rotateGlobe('stop');

				d3.transition().duration(1000)
					.tween('rotate',function() {
						var p = d3.geo.centroid(regionPath),
						r = d3.interpolate(_this.projection.rotate(), [-p[0], -p[1] + 15]),
						z = d3.interpolate(_this.projection.scale(), _this.size.h);
					return function(t) {
						_this.projection.rotate(r(t));
						_this.projection.scale(z(t));
						_this.refreshGlobe();
					};
				});
			}
		},

		highlight: function (cc) {
			var worldJSON = JSON.parse(World),
				regions = Topojson.feature(worldJSON, worldJSON.objects.countries).features,
				regionPath = _.find(regions, function (r) { return r.id == cc; });
			this.zoomRegion(regionPath);
		},

		grab: function (ev) {
			this.rotateGlobe('stop');
			this.m0 = [ev.pageX, ev.pageY];
			this.o0 = this.projection.rotate();
		},

		drag: function (ev) {
			if (this.m0) {
				var m1 = [ev.pageX, ev.pageY],
					o1 = [this.o0[0] + (m1[0] - this.m0[0]) / 6, this.o0[1] + (this.m0[1] - m1[1]) / 6];
				this.projection.rotate(o1);
				this.refreshGlobe();
			}
		},

		release: function () {
			if (this.m0) { this.m0 = null; }
		}

	});

	return RegionsView;
});
