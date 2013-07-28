// Empty constructor (overwritten in `extend()`)
var Proclass = function() { };

// Make it possible to extend the class
// Save function (as `Extend`) to inject protected variables later
Proclass.extend = function Extend(_self, _parent) {

	// If `_parent` doesn't exist, define it (to avoid errors later)
	if (typeof _parent === "undefined") {
		_parent = {};
	}

	// Create base prototype for new class
	var prototype = function() {};

	// Helper function to bind a function to a particular scope
	// Optionally bind a parent function to `this._parent()`
	var attach = function(scope, fnc, parent) {
		return function() {

			// Create temp object to store previous values for protected variables
			var temp = {};

			// If parent function exists, bind temporarily
			if (parent) {
				temp._parent = scope._parent;
				scope._parent = attach(scope, parent);
			}

			// Bind actual function with the newly created scope
			var appliedFunction = fnc.apply(scope, arguments);

			// Set `scope._parent` to saved `temp._parent`
			if (parent) {
				scope._parent = temp._parent;
			}

			// Return applied function
			return appliedFunction;
		};
	};

	// Loop through `_parent` and add to saved prototype
	for (var name in _parent) {
		prototype[name] = _parent[name];
	}

	// Loop through `_self` and add to saved prototype
	for (var name in _self) {
		prototype[name] = _self[name];
	}

	// Create constructor
	function Proclass() {

		// Store protected variables
		var internalScope = {};

		// Copy prototype onto `this`
		for (var name in prototype) {

			// If variable begins with `_`, consider it protected
			var isProtected = false;
			if (/^_/.test(name)) {
				isProtected = true;
			}

			// If we're overwriting a function with a function, add `_parent` method
			var addParent = false;
			if (typeof _self[name] === "function" && typeof _parent[name] === "function") {
				addParent = true;
			}

			// If a function, attach to internalScope
			// If an object or array, clone it
			// Else, simply use the value
			if (typeof prototype[name] === "function") {
				var toCall = attach(internalScope, prototype[name], _parent[name]);
			} else if (prototype[name] === Object(prototype[name])) {
				var toCall = JSON.parse(JSON.stringify(prototype[name]));
			} else {
				var toCall = prototype[name];
			}

			// If protected, set to `undefined`
			// Else, add to `this` (public scope)
			if (isProtected) {
				this[name] = undefined;
			} else {
				this[name] = toCall;
			}

			// Always add to internalScope
			internalScope[name] = toCall;

		}

		// Run constructor function (`_init()`)
		if (internalScope._init) {
			internalScope._init.apply(this, arguments);
		}
	}

	// Make sure the correct prototype gets passed to children
	Proclass.extend = (function(fnc, prototype){
		return function() {
			return fnc.call(this, arguments[0], prototype);
		};
	})(Extend, prototype);

	// Save prototype
	Proclass.prototype = prototype;

	// Save constructor
	Proclass.prototype.constructor = Proclass;

	return Proclass;
};

// Export Proclass
module.exports = Proclass;
