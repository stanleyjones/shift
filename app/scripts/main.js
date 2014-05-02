/*global require*/
'use strict';

require.config({
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		localstorage: {
			deps: ['backbone'],
			exports: 'Store'
		},
		bootstrap: {
			deps: ['jquery'],
			exports: 'Bootstrap'
		},
		datatables: {
			deps: ['jquery'],
			exports: 'DataTables'
		}
	},
	paths: {
		jquery: '../bower_components/jquery/jquery',
		backbone: '../bower_components/backbone/backbone',
		underscore: '../bower_components/underscore/underscore',
		text: '../bower_components/requirejs-text/text',
		localstorage: '../bower_components/Backbone.localStorage/Backbone.localStorage',
		d3: '../bower_components/d3/d3',
		topojson: '../bower_components/topojson/topojson',
		bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
		datatables: '../bower_components/DataTables/media/js/jquery.dataTables'
	}
});

require(['views/app'], function (AppView) {
	new AppView();
});