/*global define*/

define('globals', function () {
	'use strict';
	
	var globals = {

		APP_NAME: 'shift-the-subsidies',

		EXPIRY: 24, // in hours
		DATACACHES: [
			{mode: 'international', url: '/data/intl.json'},
			{mode: 'national', url: '/data/ntnl.json'}
		],

		START_YEAR: 2008,
		END_YEAR: 2012
	}

	return globals;
});