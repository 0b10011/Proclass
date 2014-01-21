[![Build Status](https://travis-ci.org/bfrohs/Proclass.png?branch=master)](https://travis-ci.org/bfrohs/Proclass) [![NPM version](https://badge.fury.io/js/proclass.png)](http://badge.fury.io/js/proclass)

Basic classical inheritance with protected members and accessible overwritten methods.

# Usage

Include Proclass in your application using **strict mode** ([available on npm](https://npmjs.org/package/proclass)) and let the inheritance begin!

## Example

	"use strict";

	var Proclass = require("proclass");

	var Foo = Proclass.extend({

		_init: function(baz){
			// Constructor function for class
			// Only available as constructor or within constructor of Class objects
			// that inherit from this (via `this._parent()`)
		},

		somePublicFunction: function() {
			// Available to this class, Class objects that inherit from this,
			// and anywhere outside of this class
		},

		_someProtectedFunction: function() {
			// Only available to this class and Class objects that inherit from this
		}

	});

	var Bar = Foo.extend({

		somePublicFunction: function() {
			// Will overwrite `Foo.somePublicFunction()`
			// `Foo.somePublicFunction()` still accessible via `this._parent()`
		}

	});

	var bar = new Bar(baz);

# Why another "Class" script?

Other "Class" scripts I tried didn't have all of the functionality I needed. Specifically, I was looking for the ability to have `protected` variables, or variables that can be inherited, but aren't publicly visible. Additionally, I wanted to be able to overwrite functions that were inherited from a parent class, but still be able to call them from within the new function (e.g., to add functionality without having to duplicate code). And I wanted constructors that could accept arguments.

# Thanks

[John Resig's Simple JavaScript Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) was a huge inspiration to this project. After trying several different approaches, I kept coming back to using a method very similar to his. (And I learned quite a bit because of it.) So, thanks!

Also, [prodecjs](https://github.com/nemisj/prodecjs) gave me hope that protected members were indeed possible in JavaScript, and helped me with the basic implementation. Thanks!
