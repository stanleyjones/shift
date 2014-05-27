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
		},

		toCSV: function (json) {
			var array = json; //typeof json !== 'object' ? JSON.parse(json) : json;

			var CSV = '';
			var line = '';

			// Headers
			var head = array[0];
			for (var index in array[0]) {
				var value = index + "";
				line += '"' + value.replace(/"/g, '""') + '",';
			}
			line = line.slice(0, -1);
			CSV += line + '\r\n';

			// Rows
			for (var i = 0; i < array.length; i++) {
				var line = '';
				for (var index in array[i]) {
					var value = array[i][index] + "";
					line += '"' + value.replace(/"/g, '""') + '",';
				}
				line = line.slice(0, -1);
				CSV += line + '\r\n';
			}
			return CSV;
		}

	};

	return helpers;
});