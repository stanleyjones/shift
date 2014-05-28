/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'datatables',
	'globals',
	'helpers',
	'charts',
	'text!templates/region.html'
], function ($, _, Backbone, d3, DataTables, G, Help, Chart, regionTemplate) {
	'use strict';

	var RegionView = Backbone.View.extend({
		el: '#card',

		template: _.template(regionTemplate),

		events: {
			'click .handle.toggle': 'toggleView',
			'click .fields .btn': 'setField',
			'mouseenter .legend li': 'highlight',
			'mouseleave .legend li': 'unhighlight',
			'click .csv-link': 'downloadCSV'
		},

		initialize: function (options) {
			this.viewState = new Backbone.Model({
				view: 'chart',
				field: 'sector',
				mode: (options && options.mode) ? options.mode : 'international'
			});
			this.viewState.on('change:field', this.render, this);

			this.chart = this.$('.view-chart');
			this.render();
		},

		render: function () {
			this.$el.html(this.template(_.extend(this.model.toJSON(), {mode: this.viewState.get('mode')})));
			this.renderChart();
			this.renderLegend();
			this.renderTable();
			return this;
		},

		renderChart: function () {
			Chart.barchart(this);
		},

		renderLegend: function () {
			var field = this.viewState.get('field'),
				mode = this.viewState.get('mode'),
				legendFields = this.model.uniqFields(field, mode);

			var legend = '';
			_.each(legendFields, function (field) {
				legend += '<li class="' + Help.slugify(field) + '"><span>' + field + '</span></li>';
			});

			this.$('.legend').html(legend);
			$('.fields .btn[data-field="' + field + '"]').addClass('active');
		},

		renderTable: function () {
			this.table = $('.view-table table').DataTable({
				scrollY: '35vh',
				scrollCollapse: true,
				paging: false,
				searching: false,
				info: false
			});
			this.table.columns.adjust().draw();
		},

		downloadCSV: function () {
			var mode = this.viewState.get('mode'),
				subsidies = _.map(this.model.get('subsidies'), function (sub) {
					if (sub.get('mode') === mode) { return sub.attributes; }
				});
			var CSV = Help.toCSV(subsidies);
			window.open('data:text/csv;charset=utf-8,' + encodeURI(CSV));
		},

		setField: function (ev) {
			var field = $(ev.target).data('field');
			this.viewState.set({field: field});
		},

		highlight: function (ev) {
			var field = $(ev.target).attr('class');
			d3.select('.stack.' + field).classed('highlight', true);
		},

		unhighlight: function () {
			d3.selectAll('.stack').classed('highlight', false);
		},

		toggleView: function () {
			var view = (this.viewState.get('view') === 'chart') ? 'table' : 'chart';
			this.viewState.set({view: view});
			$('.view-' + view).show().siblings('.view').hide();
			this.table.columns.adjust().draw();
		}
	});

	return RegionView;
});
