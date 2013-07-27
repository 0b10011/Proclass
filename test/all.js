/**
 * Test dependencies.
 */

var assert = require("assert");

/**
 * Setup.
 */

var Proclass = require("../lib/Proclass");

/**
 * Tests.
 */

describe("Proclass", function() {

	it("should call _init with provided arguments", function(done) {

		var foo = false;

		var A = Proclass.extend({
			_init: function(bar) {
				foo = bar;
			}
		});

		var a = new A(true);

		if (foo !== true) {
			throw(new Error("`a.foo` was not updated."));
		}

		done();

	});

	it("should allow for functions to be overwritten", function(done) {

		var foo = 0;

		var A = Proclass.extend({
			_init: function(bar) {
				foo = bar + 1;
			}
		});

		var B = A.extend({
			_init: function(bar) {
				foo = bar + 2;
			}
		});

		var a = new B(3);

		assert.strictEqual(foo, 5);

		done();

	});

	it("should allow for overwritten functions to still be called", function(done) {

		var foo = "";

		var A = Proclass.extend({
			_init: function(bar) {
				foo += bar + "a";
			}
		});

		var B = A.extend({
			_init: function(bar) {
				this._parent(bar);
				foo += bar + "b";
			}
		});

		var a = new B("c");

		assert.strictEqual(foo, "cacb");

		done();

	});

	it("should allow for public variables to be changed", function(done) {

		var A = Proclass.extend({
			foo: false
		});

		var a = new A();

		if (a.foo !== false) {
			throw(new Error("`a.foo` could not be read."));
		}

		a.foo = true;

		if (a.foo !== true) {
			throw(new Error("`a.foo` could not be changed."));
		}

		done();

	});

	it("should not allow for protected variables to be read externally", function(done) {

		var A = Proclass.extend({
			_foo: false
		});

		var a = new A();

		if (typeof a._foo !== "undefined") {
			throw(new Error("`a._foo` could be read."));
		}

		done();

	});

	it("should allow for protected variables to be changed internally", function(done) {

		var A = Proclass.extend({
			_foo: false,
			getFoo: function() {
				return this._foo;
			},
			setFoo: function(newValue) {
				this._foo = newValue;
			}
		});

		var a = new A();

		assert.strictEqual(a.getFoo(), false);

		a.setFoo(true);

		assert.strictEqual(a.getFoo(), true, "a.setFoo() doesn't set a._foo");

		done();

	});

	it("should allow for children to make changes to parent", function(done) {

		var A = Proclass.extend({
			_foo: false
		});

		var B = A.extend({
			getFoo: function() {
				return this._foo;
			},
			setFoo: function(newValue) {
				this._foo = newValue;
			}
		});

		var b = new B();

		assert.strictEqual(b.getFoo(), false);

		b.setFoo(true);

		assert.strictEqual(b.getFoo(), true, "b.setFoo() doesn't set a._foo");

		done();

	});

	it("should not allow parents to access children's methods", function(done) {

		var A = Proclass.extend({
			foo: true
		});

		var B = A.extend({
			bar: true
		});

		var a = new A();

		assert.strictEqual(a.bar, undefined, "`a.bar` is accessing child's value");

		done();

	});

	it("should not share protected data between instances", function(done) {

		var A = Proclass.extend({
			_foo: true,
			getFoo: function() {
				return this._foo;
			},
			setFoo: function(newValue) {
				this._foo = newValue;
			}
		});

		var a = new A();

		var b = new A();
		b.setFoo(false);

		assert.strictEqual(a.getFoo(), true);

		done();

	});

});