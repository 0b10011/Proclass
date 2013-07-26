// Avoids running `_init()` unnecessarily
var _initializing = false;

// Empty constructor (overwritten in `extend()`)
var Proclass = function() { };

// Make it possible to extend the class
// Save function (as `Extend`) to inject protected variables later
Proclass.extend = function Extend(newObject, protectedInherited) {

	// Variables to store protected variables and parent
	var _protected = protectedInherited || {}
		, _parent = this.prototype
		;

	// Instantiate base class, but don't run constructor
	_initializing = true;
	var prototype = new this();
	_initializing = false;

	// Copy new object onto parent's prototype
	for (var name in newObject) {

		// Are we dealing with a function?
		var isFunction = (typeof newObject[name] === "function");

		// If we're overwriting a function with a function, add `_parent` method
		var addparent = false;
		if (isFunction) {
			if (/^_/.test(name)) { // Protected
				if (typeof _protected[name] === "function") {
					addparent = true;
				}
			} else { // Public
				if (typeof _parent[name] === "function") {
					addparent = true;
				}
			}
		}

		// If a function, add protected variables and `_parent` method to scope
		// Else, simply use the value
		var toCall = !isFunction ? newObject[name] : (function(name, fnc, addParent){
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
		})(name, newObject[name], addparent);

		// If variable begins with `_`, consider it protected and save it
		// Else, add it to the prototype
		if (/^_/.test(name)) {
			_protected[name] = toCall;
		} else {
			prototype[name] = toCall;
		}

	}

	// Overwrite constructor
	// In `extend()` to avoid sharing child variables with parent
	function Proclass() {
		if (!_initializing && _protected._init) {
			_protected._init.apply(this, arguments);
		}
	}

	// Make sure this function's `_protected` gets passed to children
	Proclass.extend = (function(fnc, protectedVariables){
		return function() {
			return fnc.call(this, arguments[0], protectedVariables);
		};
	})(Extend, _protected);

	// Save prototype
	Proclass.prototype = prototype;

	// Save constructor
	Proclass.prototype.constructor = Proclass;

	return Proclass;
};

// Export Proclass
module.exports = Proclass;
