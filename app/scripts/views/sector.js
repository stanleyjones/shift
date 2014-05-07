/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var SectorView = Backbone.View.extend({
        template: JST['app/scripts/templates/sector.ejs']
    });

    return SectorView;
});
