/*global define*/

define('links', function () {
	'use strict';
	
	var links = [
		{
			mode: 'international',
			type: 'internal',
			text: 'Click here',
			url: '#regions/international/MX'
		},
		{
			mode: 'national',
			type: 'internal',
			text: 'Click here',
			url: '#regions/national/US'
		},
		{
			mode: 'international',
			type: 'external',
			text: 'Click here',
			url: 'http://priceofoil.org/fossil-fuel-subsidies'
		}
	];
	return links;
});