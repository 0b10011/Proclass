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

			// If a function, add protected variables and `_parent` method to scope
			// Else, simply use the value
			var isFunction = (typeof prototype[name] === "function");
			var toCall = !isFunction ? prototype[name] : (function(fnc){
				return function() {

					// Create temp object to store previous values for protected variables
					var temp = {};

					// Save previous value of `_parent` if `addParent` is `true` and
					// overwrite `internalScope._parent` with `_parent[name]`
					if (addParent) {
						temp._parent = internalScope._parent
						internalScope._parent = _parent[name];
					}

					// Bind actual function with the newly created scope
					var appliedFunction = fnc.apply(internalScope, arguments);

					// Set `internalScope._parent` to saved `temp._parent`
					if (addParent) {
						internalScope._parent = temp._parent;
					}

					// Return applied function
					return appliedFunction;
				};
			})(prototype[name]);

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
