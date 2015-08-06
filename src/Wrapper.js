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
    path = require('path'),
    mainDirname = path.resolve(require.main.filename, '../../..');

function Wrapper(requireResolve) {
    this.requireResolve = requireResolve;
}

Wrapper.prototype.wrap = function (config, content, file) {
    var injections = {},
        assignments = {},
        names,
        requireResolve = this.requireResolve,
        values = [];

    _.forOwn(config.inject, function (theseInjections, pathToMatch) {
        var resolvedPath = requireResolve(pathToMatch, mainDirname);

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

        resolvedSource = requireResolve(source, mainDirname);

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

    names = Object.keys(assignments);
    _.each(names, function (name) {
        values.push(assignments[name]);
    });

    content = '(function (' + names.join(', ') + ') {\n' + content + '\n}.call(this, ' + values.join(', ') + '));';

    return content;
};

module.exports = Wrapper;
