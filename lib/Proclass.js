// Avoids running `_init()` unnecessarily
var _initializing = false;

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

		// If initializing, don't run constructor
		if (_initializing) {
			return;
		}

		// Store protected variables
		var _protected = {};

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
			var toCall = !isFunction ? prototype[name] : (function(name, fnc, addParent){
				return function() {

					// Create temp object to store previous values for protected variables
					var temp = {};

					// Save previous value of `_parent` if `addParent` is `true` and
					// overwrite `this._parent` with `_parent[name]`
					if (addParent) {
						temp._parent = this._parent
						this._parent = _parent[name];
					}

					// Save previous value of all protected variables and overwrite
					// `this[x]` with `_protected[x]`
					for (var allNames in _protected) {
						temp[allNames] = this[allNames];
						this[allNames] = _protected[allNames];
					}

					// Bind actual function with the newly created scope
					var appliedFunction = fnc.apply(this, arguments);

					// Remove protected variables from `this`
					for (var nonPublic in _protected) {
						// Save new value if it changed
						if (this[nonPublic] !== _protected[nonPublic]) {
							_protected[nonPublic] = this[nonPublic];
						}
						// Set this value back to previous
						this[nonPublic] = temp[nonPublic];
					}

					// Set `this._parent` to saved `temp._parent`
					if (addParent) {
						this._parent = temp._parent;
					}

					// Return applied function
					return appliedFunction;
				};
			})(name, prototype[name], addParent);

			// If protected, add to `_protected` and set to `undefined`
			// Else, add to `this`
			if (isProtected) {
				_protected[name] = toCall;
				this[name] = undefined;
			} else {
				this[name] = toCall;
			}

		}

		// Run constructor function (`_init()`)
		if (_protected._init) {
			_protected._init.apply(this, arguments);
		}
	}

	// Make sure this function's `_protected` gets passed to children
	Proclass.extend = (function(fnc, protectedVariables){
		return function() {
			return fnc.call(this, arguments[0], protectedVariables);
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
