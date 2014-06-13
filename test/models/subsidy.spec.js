/*global define, beforeEach, describe, it, expect  */
'use strict';

define(function(require) {
	var SubsidyModel = require('scripts/models/subsidy.js');

	describe('Subsidy Model', function () {

		beforeEach(function () {
			this.SubsidyModel = new SubsidyModel();
		});

		describe('Test', function () {
			it('should return true', function () {
				expect(true).to.be.equal(true);
			});
		});
	});

});