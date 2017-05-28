Object.defineProperty(exports, "__esModule", {
  value: true
});


var _isPromisesAPlusCompliant = true;

var ParsePromise = function () {
  function ParsePromise(executor) {
    babelHelpers.classCallCheck(this, ParsePromise);

    this._resolved = false;
    this._rejected = false;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];

    if (typeof executor === 'function') {
      executor(this.resolve.bind(this), this.reject.bind(this));
    }
  }

  babelHelpers.createClass(ParsePromise, [{
    key: 'resolve',
    value: function resolve() {
      if (this._resolved || this._rejected) {
        throw new Error('A promise was resolved even though it had already been ' + (this._resolved ? 'resolved' : 'rejected') + '.');
      }
      this._resolved = true;

      for (var _len = arguments.length, results = Array(_len), _key = 0; _key < _len; _key++) {
        results[_key] = arguments[_key];
      }

      this._result = results;
      for (var i = 0; i < this._resolvedCallbacks.length; i++) {
        this._resolvedCallbacks[i].apply(this, results);
      }

      this._resolvedCallbacks = [];
      this._rejectedCallbacks = [];
    }
  }, {
    key: 'reject',
    value: function reject(error) {
      if (this._resolved || this._rejected) {
        throw new Error('A promise was rejected even though it had already been ' + (this._resolved ? 'resolved' : 'rejected') + '.');
      }
      this._rejected = true;
      this._error = error;
      for (var i = 0; i < this._rejectedCallbacks.length; i++) {
        this._rejectedCallbacks[i](error);
      }
      this._resolvedCallbacks = [];
      this._rejectedCallbacks = [];
    }
  }, {
    key: 'then',
    value: function then(resolvedCallback, rejectedCallback) {
      var _this = this;

      var promise = new ParsePromise();

      var wrappedResolvedCallback = function wrappedResolvedCallback() {
        for (var _len2 = arguments.length, results = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          results[_key2] = arguments[_key2];
        }

        if (typeof resolvedCallback === 'function') {
          if (_isPromisesAPlusCompliant) {
            try {
              results = [resolvedCallback.apply(this, results)];
            } catch (e) {
              results = [ParsePromise.error(e)];
            }
          } else {
            results = [resolvedCallback.apply(this, results)];
          }
        }
        if (results.length === 1 && ParsePromise.is(results[0])) {
          results[0].then(function () {
            promise.resolve.apply(promise, arguments);
          }, function (error) {
            promise.reject(error);
          });
        } else {
          promise.resolve.apply(promise, results);
        }
      };

      var wrappedRejectedCallback = function wrappedRejectedCallback(error) {
        var result = [];
        if (typeof rejectedCallback === 'function') {
          if (_isPromisesAPlusCompliant) {
            try {
              result = [rejectedCallback(error)];
            } catch (e) {
              result = [ParsePromise.error(e)];
            }
          } else {
            result = [rejectedCallback(error)];
          }
          if (result.length === 1 && ParsePromise.is(result[0])) {
            result[0].then(function () {
              promise.resolve.apply(promise, arguments);
            }, function (error) {
              promise.reject(error);
            });
          } else {
            if (_isPromisesAPlusCompliant) {
              promise.resolve.apply(promise, result);
            } else {
              promise.reject(result[0]);
            }
          }
        } else {
          promise.reject(error);
        }
      };

      var runLater = function runLater(fn) {
        fn.call();
      };
      if (_isPromisesAPlusCompliant) {
        if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
          runLater = function runLater(fn) {
            process.nextTick(fn);
          };
        } else if (typeof setTimeout === 'function') {
          runLater = function runLater(fn) {
            setTimeout(fn, 0);
          };
        }
      }

      if (this._resolved) {
        runLater(function () {
          wrappedResolvedCallback.apply(_this, _this._result);
        });
      } else if (this._rejected) {
        runLater(function () {
          wrappedRejectedCallback(_this._error);
        });
      } else {
        this._resolvedCallbacks.push(wrappedResolvedCallback);
        this._rejectedCallbacks.push(wrappedRejectedCallback);
      }

      return promise;
    }
  }, {
    key: 'always',
    value: function always(callback) {
      return this.then(callback, callback);
    }
  }, {
    key: 'done',
    value: function done(callback) {
      return this.then(callback);
    }
  }, {
    key: 'fail',
    value: function fail(callback) {
      return this.then(null, callback);
    }
  }, {
    key: 'catch',
    value: function _catch(callback) {
      return this.then(null, callback);
    }
  }, {
    key: '_thenRunCallbacks',
    value: function _thenRunCallbacks(optionsOrCallback, model) {
      var options = {};
      if (typeof optionsOrCallback === 'function') {
        options.success = function (result) {
          optionsOrCallback(result, null);
        };
        options.error = function (error) {
          optionsOrCallback(null, error);
        };
      } else if (typeof optionsOrCallback === 'object') {
        if (typeof optionsOrCallback.success === 'function') {
          options.success = optionsOrCallback.success;
        }
        if (typeof optionsOrCallback.error === 'function') {
          options.error = optionsOrCallback.error;
        }
      }

      return this.then(function () {
        for (var _len3 = arguments.length, results = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          results[_key3] = arguments[_key3];
        }

        if (options.success) {
          options.success.apply(this, results);
        }
        return ParsePromise.as.apply(ParsePromise, arguments);
      }, function (error) {
        if (options.error) {
          if (typeof model !== 'undefined') {
            options.error(model, error);
          } else {
            options.error(error);
          }
        }

        return ParsePromise.error(error);
      });
    }
  }, {
    key: '_continueWith',
    value: function _continueWith(continuation) {
      return this.then(function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return continuation(args, null);
      }, function (error) {
        return continuation(null, error);
      });
    }
  }], [{
    key: 'is',
    value: function is(promise) {
      return promise != null && typeof promise.then === 'function';
    }
  }, {
    key: 'as',
    value: function as() {
      var promise = new ParsePromise();

      for (var _len5 = arguments.length, values = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        values[_key5] = arguments[_key5];
      }

      promise.resolve.apply(promise, values);
      return promise;
    }
  }, {
    key: 'resolve',
    value: function resolve(value) {
      return new ParsePromise(function (resolve, reject) {
        if (ParsePromise.is(value)) {
          value.then(resolve, reject);
        } else {
          resolve(value);
        }
      });
    }
  }, {
    key: 'error',
    value: function error() {
      var promise = new ParsePromise();

      for (var _len6 = arguments.length, errors = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        errors[_key6] = arguments[_key6];
      }

      promise.reject.apply(promise, errors);
      return promise;
    }
  }, {
    key: 'reject',
    value: function reject() {
      for (var _len7 = arguments.length, errors = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        errors[_key7] = arguments[_key7];
      }

      return ParsePromise.error.apply(null, errors);
    }
  }, {
    key: 'when',
    value: function when(promises) {
      var objects;
      var arrayArgument = Array.isArray(promises);
      if (arrayArgument) {
        objects = promises;
      } else {
        objects = arguments;
      }

      var total = objects.length;
      var hadError = false;
      var results = [];
      var returnValue = arrayArgument ? [results] : results;
      var errors = [];
      results.length = objects.length;
      errors.length = objects.length;

      if (total === 0) {
        return ParsePromise.as.apply(this, returnValue);
      }

      var promise = new ParsePromise();

      var resolveOne = function resolveOne() {
        total--;
        if (total <= 0) {
          if (hadError) {
            promise.reject(errors);
          } else {
            promise.resolve.apply(promise, returnValue);
          }
        }
      };

      var chain = function chain(object, index) {
        if (ParsePromise.is(object)) {
          object.then(function (result) {
            results[index] = result;
            resolveOne();
          }, function (error) {
            errors[index] = error;
            hadError = true;
            resolveOne();
          });
        } else {
          results[i] = object;
          resolveOne();
        }
      };
      for (var i = 0; i < objects.length; i++) {
        chain(objects[i], i);
      }

      return promise;
    }
  }, {
    key: 'all',
    value: function all(promises) {
      var total = 0;
      var objects = [];

      for (var _iterator = promises, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var p = _ref;

        objects[total++] = p;
      }

      if (total === 0) {
        return ParsePromise.as([]);
      }

      var hadError = false;
      var promise = new ParsePromise();
      var resolved = 0;
      var results = [];
      objects.forEach(function (object, i) {
        if (ParsePromise.is(object)) {
          object.then(function (result) {
            if (hadError) {
              return false;
            }
            results[i] = result;
            resolved++;
            if (resolved >= total) {
              promise.resolve(results);
            }
          }, function (error) {
            promise.reject(error);
            hadError = true;
          });
        } else {
          results[i] = object;
          resolved++;
          if (!hadError && resolved >= total) {
            promise.resolve(results);
          }
        }
      });

      return promise;
    }
  }, {
    key: 'race',
    value: function race(promises) {
      var completed = false;
      var promise = new ParsePromise();
      for (var _iterator2 = promises, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']();;) {
        var _ref2;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref2 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref2 = _i2.value;
        }

        var p = _ref2;

        if (ParsePromise.is(p)) {
          p.then(function (result) {
            if (completed) {
              return;
            }
            completed = true;
            promise.resolve(result);
          }, function (error) {
            if (completed) {
              return;
            }
            completed = true;
            promise.reject(error);
          });
        } else if (!completed) {
          completed = true;
          promise.resolve(p);
        }
      }

      return promise;
    }
  }, {
    key: '_continueWhile',
    value: function _continueWhile(predicate, asyncFunction) {
      if (predicate()) {
        return asyncFunction().then(function () {
          return ParsePromise._continueWhile(predicate, asyncFunction);
        });
      }
      return ParsePromise.as();
    }
  }, {
    key: 'isPromisesAPlusCompliant',
    value: function isPromisesAPlusCompliant() {
      return _isPromisesAPlusCompliant;
    }
  }, {
    key: 'enableAPlusCompliant',
    value: function enableAPlusCompliant() {
      _isPromisesAPlusCompliant = true;
    }
  }, {
    key: 'disableAPlusCompliant',
    value: function disableAPlusCompliant() {
      _isPromisesAPlusCompliant = false;
    }
  }]);
  return ParsePromise;
}();

exports.default = ParsePromise;