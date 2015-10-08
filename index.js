/*
 * Wrapify - Browserify transform
 * Copyright (c) Jadu Ltd
 * https://github.com/jadu/wrapify
 *
 * Released under the MIT license
 * https://github.com/jadu/wrapify/raw/master/MIT-LICENSE.txt
 */

'use strict';

var Wrapper = require('./src/Wrapper'),
    resolve = require('resolve'),
    transformTools = require('browserify-transform-tools'),
    wrapper = new Wrapper(resolve);

module.exports = transformTools.makeStringTransform(
    'wrapify',
    {
        jsFilesOnly: true
    },
    function (content, transformOptions, done) {
        var config = transformOptions.config,
            configDir = transformOptions.configData.configDir,
            file = transformOptions.file;

        if (!config) {
            return done(new Error('Could not find wrapify configuration.'));
        }

        done(null, wrapper.wrap(config, content, file, configDir));
    }
);
