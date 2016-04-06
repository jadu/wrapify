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
        this.configDir = '';
        this.content = '';
        this.resolve = sinon.stub();
        this.wrapper = new Wrapper({sync: this.resolve});

        this.resolve.withArgs('/my/file.js').returns('/resolved/my/file.js');
        this.resolve.withArgs('/resolved/my/file.js').returns('/resolved/my/file.js');

        this.callWrap = function (file) {
            return this.wrapper.wrap(this.config, this.content, file || '/resolved/my/file.js', this.configDir);
        }.bind(this);
    });

    it('should not transform a file that has no injections specified', function () {
        this.content = 'var my = "content";';

        expect(this.callWrap()).to.equal('var my = "content";');
    });

    it('should resolve the injection relative to the config dir', function () {
        this.config = {
            inject: {
                '/my/file.js': {
                    './src/proxier': 'myVar'
                }
            }
        };
        this.content = 'var my = "content";';
        this.resolve.withArgs('./src/proxier').returns('/resolved/proxier.js');
        this.configDir = '/path/to/folder/containing/packagedotjson';

        this.callWrap();

        expect(this.resolve).to.have.been.calledWith(
            '/my/file.js',
            {basedir: '/path/to/folder/containing/packagedotjson'}
        );
    });

    it('should transform a file that has one injection specified with no expression suffix', function () {
        this.config = {
            inject: {
                '/my/file.js': {
                    './src/proxier': 'myVar'
                }
            }
        };
        this.resolve.withArgs('./src/proxier').returns('/resolved/proxier.js');
        this.content = 'var theCode = "is here";';

        expect(this.callWrap()).to.equal(nowdoc(function () {/*<<<EOS
(function (myVar) {
var theCode = "is here";
}.call(this, require("/resolved/proxier.js")));
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
        this.resolve.withArgs('./src/proxier').returns('/resolved/proxier.js');
        this.content = 'var theCode = "is here";';

        expect(this.callWrap()).to.equal(nowdoc(function () {/*<<<EOS
(function (window) {
var theCode = "is here";
}.call(this, require("/resolved/proxier.js").proxyWindow));
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
        this.resolve.withArgs('./src/proxier').returns('/resolved/proxier.js');
        this.content = 'var theCode = "is here";';

        expect(this.callWrap()).to.equal(nowdoc(function () {/*<<<EOS
(function (window, orange) {
var theCode = "is here";
}.call(this, require("/resolved/proxier.js").proxyWindow, require("/resolved/proxier.js").orangeColour));
EOS
*/;})); //jshint ignore:line
    });

    it('should transform a file that has an injection for "this" with an expression suffix', function () {
        this.config = {
            inject: {
                '/my/file.js': {
                    './src/proxier': {
                        'this': '.proxyWindow',
                        'orange': '.orangeColour'
                    }
                }
            }
        };
        this.resolve.withArgs('./src/proxier').returns('/resolved/proxier.js');
        this.content = 'var theCode = "is here";';

        expect(this.callWrap()).to.equal(nowdoc(function () {/*<<<EOS
(function (orange) {
var theCode = "is here";
}.call(require("/resolved/proxier.js").proxyWindow, require("/resolved/proxier.js").orangeColour));
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
        this.resolve.returns(null);
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
        this.resolve.returns(null);
        this.content = 'var theCode = "is here";';

        expect(function () {
            this.callWrap();
        }.bind(this)).to.throw('Failed to resolve source path "/an/invalid/src/path"');
    });
});
