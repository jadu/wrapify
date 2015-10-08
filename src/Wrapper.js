/*
 * Wrapify - Browserify transform
 * Copyright (c) Jadu Ltd
 * https://github.com/jadu/wrapify
 *
 * Released under the MIT license
 * https://github.com/jadu/wrapify/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('lodash'),
    hasOwn = {}.hasOwnProperty;

function Wrapper(resolve) {
    this.resolve = resolve;
}

Wrapper.prototype.wrap = function (config, content, file, configDir) {
    var injections = {},
        assignments = {},
        names,
        resolve = this.resolve,
        thisValue = 'this',
        values = [];

    _.forOwn(config.inject, function (theseInjections, pathToMatch) {
        var resolvedPath = resolve(pathToMatch, {basedir: configDir});

        if (!resolvedPath) {
            throw new Error('Failed to resolve injection path "' + pathToMatch + '"');
        }

        if (file === resolvedPath.src) {
            _.extend(injections, theseInjections);
        }
    });

    if (Object.keys(injections).length === 0) {
        return content;
    }

    _.each(injections, function (map, source) {
        var resolvedSource,
            sourceRequire;

        resolvedSource = resolve(source, {basedir: configDir});

        if (!resolvedSource) {
            throw new Error('Failed to resolve source path "' + source + '"');
        }

        sourceRequire = 'require(' + JSON.stringify(resolvedSource.src) + ')';

        if (_.isPlainObject(map)) {
            _.forOwn(map, function (expression, variable) {
                assignments[variable] = sourceRequire + expression;
            });
        } else if (_.isString(map)) {
            assignments[map] = sourceRequire;
        } else {
            throw new Error('Unsupported map value for source "' + source + '"');
        }
    });

    // Handle 'this' as a special case for setting the context object
    if (hasOwn.call(assignments, 'this')) {
        thisValue = assignments.this;
        delete assignments.this;
    }

    names = Object.keys(assignments);
    _.each(names, function (name) {
        values.push(assignments[name]);
    });

    content = '(function (' + names.join(', ') + ') {\n' + content + '\n}.call(' + thisValue + ', ' + values.join(', ') + '));';

    return content;
};

module.exports = Wrapper;
