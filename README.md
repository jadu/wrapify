Wrapify
=======

[![Build Status](https://secure.travis-ci.org/jadu/wrapify.png?branch=master)](http://travis-ci.org/jadu/wrapify)

Browserify transform to wrap modules or inject variables.

Usage
=====
```javascript
npm install --save-dev wrapify
```

Add to `package.json` -
```json
{
  "version": "1.0.0",
  "name": "my-pkg",
  "browserify": {
    "transform": [
      "wrapify"
    ]
  },
  "wrapify": {
    "inject": {
      "jquery/dist/jquery": {
        "./src/wrapper/windowProxy": {
          "window": ".proxyWindow"
        }
      }
    }
  }
}
```

will transform into
```javascript
(function (window) {
/*!
 * jQuery JavaScript Library v1.11.3
 * http://jquery.com/
 ...
 */
 ...
}(require("/my-lib/src/wrapper/windowProxy.js").proxyWindow));
```
