/*global describe, it, assert */
'use strict';
(function () {
    describe('Give it some context', function () {
        describe('maybe a bit more context here', function () {
            it('should run here few assertions', function () {
                assert.equal(0,1);
            });
        });
    });
})();
