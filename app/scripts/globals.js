/*global define*/

define('globals', function () {
	'use strict';
	
	var globals = {

		APP_NAME: 'shift-the-subsidies',

		API_EXPIRY: 24, // in hours
		API_DEVELOPMENT: [
			{mode: 'international', url: '/data/subsidies/international.json'}
			// {mode: 'national', url: '/data/subsidies/ntnl.json'}
		],
		API_PRODUCTION: [
			{mode: 'international', url: 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT * FROM 1kloSZQponDE9I60zmqnuPEHOcDRbPiPEkGOCQ8gG&key=AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo'},
			{mode: 'national', url: 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT * FROM {{NTNL_TABLE_ID}}&key=AIzaSyAxIxiJR_hGp8eoCsadSvloPYwbEaaGYDo'}
		],

		START_YEAR: 2008,
		END_YEAR: 2012,

		PRODUCTION: false

	}

	return globals;
});