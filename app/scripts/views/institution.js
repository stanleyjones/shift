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
	'text!templates/institution.html'
], function ($, _, Backbone, d3, DataTables, G, Help, Chart, institutionTemplate) {
	'use strict';

	var InstitutionView = Backbone.View.extend({
		el: '#card',

		template: _.template(institutionTemplate),

		events: {
			'click .handle.toggle': 'toggleView',
			'click .fields .btn': 'setField',
			'mouseenter .legend li': 'highlight',
			'mouseleave .legend li': 'unhighlight',
			'click .csv-link': 'downloadCSV'
		},

		initialize: function () {
			this.viewState = new Backbone.Model({view: 'chart', field: 'sector'});
			this.viewState.on('change:field', this.render, this);

			this.chart = this.$('.view-chart');
			this.render();
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
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
				legendFields = this.model.uniqFields(field);

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
				info: false,
				order: [[0, 'desc']]
			});
			this.table.columns.adjust().draw();
		},

		downloadCSV: function () {
			var subsidies = _.chain(this.model.get('subsidies'))
					.map(function (sub) { return sub.attributes; })
					.value();
			this.$('#csv').attr('href', function () {
				return window.URL.createObjectURL(new Blob([Help.toCSV(subsidies)], {type: 'text/csv'}));
			});
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
			$('.handle.toggle').text(view);
			$('.view-' + view).show().siblings('.view').hide();
			this.table.columns.adjust().draw();
		}

	});

	return InstitutionView;
});
