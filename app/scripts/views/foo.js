/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var FooView = Backbone.View.extend({
        template: JST['app/scripts/templates/foo.ejs']
    });

    return FooView;
});
