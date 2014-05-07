/*global define*/

define('helpers', function () {
	'use strict';
	
	var helpers = {

		slugify: function (string) {
			return string.toLowerCase().replace(/[^\w]+/g,'-');
		},

		suffix: function (num) {
			var sizes = ' KMBT';
			if (num <= 0) return '0';
			var t2 = Math.min(Math.floor(Math.log(num) / Math.log(1000)), 12);
			return (Math.round(num * 100 / Math.pow(1000, t2)) / 100) + sizes.charAt(t2).replace(' ', '');
		},

		monetize: function (num) {
			var amount = Math.floor(num, 1).toString(),
				pattern = /(\d+)(\d{3})/;
			while (pattern.test(amount)) { amount = amount.replace(pattern, '$1' + ',' + '$2');	}
			return '$' + amount;
		}
	};

	return helpers;
});