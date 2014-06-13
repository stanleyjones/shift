/*global define*/

define('globals', function () {
	'use strict';

	var globals = {

		APP_NAME: 'shift-the-subsidies',

		EXPIRY: 24, // in hours
		DATACACHES: [
			{mode: 'international', url: '/data/intl0.json'},
			{mode: 'international', url: '/data/intl1.json'},
			{mode: 'international', url: '/data/intl2.json'},
			{mode: 'international', url: '/data/intl3.json'},
			{mode: 'international', url: '/data/intl4.json'},
			{mode: 'international', url: '/data/intl5.json'},
			{mode: 'international', url: '/data/intl6.json'},
			{mode: 'international', url: '/data/intl7.json'},
			{mode: 'international', url: '/data/intl8.json'},
			{mode: 'international', url: '/data/intl9.json'},
			{mode: 'national', url: '/data/ntnl.json'}
		],

		START_YEAR: 2008,
		END_YEAR: 2013
	};

	return globals;
});