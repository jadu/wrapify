/*
 * Wrapify - Browserify transform
 * Copyright (c) Jadu Ltd
 * https://github.com/jadu/wrapify
 *
 * Released under the MIT license
 * https://github.com/jadu/wrapify/raw/master/MIT-LICENSE.txt
 */

'use strict';

var expect = require('chai').expect,
    wrapify = require('../..');

describe('Public API', function () {
    it('should export a function', function () {
        expect(wrapify).to.be.a('function');
    });
});
