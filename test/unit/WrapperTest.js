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
    nowdoc = require('nowdoc'),
    sinon = require('sinon'),
    Wrapper = require('../../src/Wrapper');

describe('Wrapper', function () {
    beforeEach(function () {
        this.config = {};
        this.content = '';
        this.file = '/path/to/my/file.js';
        this.requireResolve = sinon.stub();
        this.wrapper = new Wrapper(this.requireResolve);

        this.callWrap = function () {
            return this.wrapper.wrap(this.config, this.content, this.file);
        }.bind(this);
    });

    it('should not transform a file that has no injections specified', function () {
        this.content = 'var my = "content";';

        expect(this.callWrap()).to.equal('var my = "content";');
    });

    it('should transform a file that has one injection specified with no expression suffix', function () {
        this.config = {
            inject: {
                '/my/file.js': {
                    './src/proxier': 'myVar'
                }
            }
        };
        this.file = '/my/file.js';
        this.requireResolve.returns({src: this.file});
        this.content = 'var theCode = "is here";';

        expect(this.callWrap()).to.equal(nowdoc(function () {/*<<<EOS
(function (myVar) {
var theCode = "is here";
}(require("/my/file.js")));
EOS
*/;})); //jshint ignore:line
    });

    it('should transform a file that has one injection specified with an expression suffix', function () {
        this.config = {
            inject: {
                '/my/file.js': {
                    './src/proxier': {
                        'window': '.proxyWindow'
                    }
                }
            }
        };
        this.file = '/my/file.js';
        this.requireResolve.returns({src: this.file});
        this.content = 'var theCode = "is here";';

        expect(this.callWrap()).to.equal(nowdoc(function () {/*<<<EOS
(function (window) {
var theCode = "is here";
}(require("/my/file.js").proxyWindow));
EOS
*/;})); //jshint ignore:line
    });

    it('should transform a file that has two injections specified for the same source with an expression suffix', function () {
        this.config = {
            inject: {
                '/my/file.js': {
                    './src/proxier': {
                        'window': '.proxyWindow',
                        'orange': '.orangeColour'
                    }
                }
            }
        };
        this.file = '/my/file.js';
        this.requireResolve.returns({src: this.file});
        this.content = 'var theCode = "is here";';

        expect(this.callWrap()).to.equal(nowdoc(function () {/*<<<EOS
(function (window, orange) {
var theCode = "is here";
}(require("/my/file.js").proxyWindow, require("/my/file.js").orangeColour));
EOS
*/;})); //jshint ignore:line
    });

    it('should throw an error for injection paths that cannot be resolved', function () {
        this.config = {
            inject: {
                '/an/invalid/path': {
                    './src/proxier': {
                        'window1': '.proxyWindow2'
                    }
                },
                '/my/file.js': {
                    './src/proxier': {
                        'window1': '.proxyWindow2'
                    }
                }
            }
        };
        this.file = '/my/file.js';
        this.requireResolve.withArgs('/my/file.js').returns({src: this.file});
        this.requireResolve.returns(null);
        this.content = 'var theCode = "is here";';

        expect(function () {
            this.callWrap();
        }.bind(this)).to.throw('Failed to resolve injection path "/an/invalid/path"');
    });

    it('should throw an error for source paths that cannot be resolved', function () {
        this.config = {
            inject: {
                '/my/file.js': {
                    '/an/invalid/src/path': {
                        'window1': '.proxyWindow2'
                    }
                }
            }
        };
        this.file = '/my/file.js';
        this.requireResolve.withArgs('/my/file.js').returns({src: this.file});
        this.requireResolve.returns(null);
        this.content = 'var theCode = "is here";';

        expect(function () {
            this.callWrap();
        }.bind(this)).to.throw('Failed to resolve source path "/an/invalid/src/path"');
    });
});
