Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var dataUriRegexp = /^data:([a-zA-Z]*\/[a-zA-Z+.-]*);(charset=[a-zA-Z0-9\-\/\s]*,)?base64,/;

function b64Digit(number) {
  if (number < 26) {
    return String.fromCharCode(65 + number);
  }
  if (number < 52) {
    return String.fromCharCode(97 + (number - 26));
  }
  if (number < 62) {
    return String.fromCharCode(48 + (number - 52));
  }
  if (number === 62) {
    return '+';
  }
  if (number === 63) {
    return '/';
  }
  throw new TypeError('Tried to encode large digit ' + number + ' in base64.');
}

var ParseFile = function () {
  function ParseFile(name, data, type) {
    babelHelpers.classCallCheck(this, ParseFile);

    var specifiedType = type || '';

    this._name = name;

    if (data !== undefined) {
      if (Array.isArray(data)) {
        this._source = {
          format: 'base64',
          base64: ParseFile.encodeBase64(data),
          type: specifiedType
        };
      } else if (typeof File !== 'undefined' && data instanceof File) {
        this._source = {
          format: 'file',
          file: data,
          type: specifiedType
        };
      } else if (data && typeof data.base64 === 'string') {
        var base64 = data.base64;
        var commaIndex = base64.indexOf(',');

        if (commaIndex !== -1) {
          var matches = dataUriRegexp.exec(base64.slice(0, commaIndex + 1));

          this._source = {
            format: 'base64',
            base64: base64.slice(commaIndex + 1),
            type: matches[1]
          };
        } else {
          this._source = {
            format: 'base64',
            base64: base64,
            type: specifiedType
          };
        }
      } else {
        throw new TypeError('Cannot create a Parse.File with that data.');
      }
    }
  }

  babelHelpers.createClass(ParseFile, [{
    key: 'name',
    value: function name() {
      return this._name;
    }
  }, {
    key: 'url',
    value: function url(options) {
      options = options || {};
      if (!this._url) {
        return;
      }
      if (options.forceSecure) {
        return this._url.replace(/^http:\/\//i, 'https://');
      } else {
        return this._url;
      }
    }
  }, {
    key: 'save',
    value: function save(options) {
      var _this = this;

      options = options || {};
      var controller = _CoreManager2.default.getFileController();
      if (!this._previousSave) {
        if (this._source.format === 'file') {
          this._previousSave = controller.saveFile(this._name, this._source).then(function (res) {
            _this._name = res.name;
            _this._url = res.url;
            return _this;
          });
        } else {
          this._previousSave = controller.saveBase64(this._name, this._source).then(function (res) {
            _this._name = res.name;
            _this._url = res.url;
            return _this;
          });
        }
      }
      if (this._previousSave) {
        return this._previousSave._thenRunCallbacks(options);
      }
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        __type: 'File',
        name: this._name,
        url: this._url
      };
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }

      return other instanceof ParseFile && this.name() === other.name() && this.url() === other.url() && typeof this.url() !== 'undefined';
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(obj) {
      if (obj.__type !== 'File') {
        throw new TypeError('JSON object does not represent a ParseFile');
      }
      var file = new ParseFile(obj.name);
      file._url = obj.url;
      return file;
    }
  }, {
    key: 'encodeBase64',
    value: function encodeBase64(bytes) {
      var chunks = [];
      chunks.length = Math.ceil(bytes.length / 3);
      for (var i = 0; i < chunks.length; i++) {
        var b1 = bytes[i * 3];
        var b2 = bytes[i * 3 + 1] || 0;
        var b3 = bytes[i * 3 + 2] || 0;

        var has2 = i * 3 + 1 < bytes.length;
        var has3 = i * 3 + 2 < bytes.length;

        chunks[i] = [b64Digit(b1 >> 2 & 0x3F), b64Digit(b1 << 4 & 0x30 | b2 >> 4 & 0x0F), has2 ? b64Digit(b2 << 2 & 0x3C | b3 >> 6 & 0x03) : '=', has3 ? b64Digit(b3 & 0x3F) : '='].join('');
      }

      return chunks.join('');
    }
  }]);
  return ParseFile;
}();

exports.default = ParseFile;


var DefaultController = {
  saveFile: function saveFile(name, source) {
    if (source.format !== 'file') {
      throw new Error('saveFile can only be used with File-type sources.');
    }

    var headers = {
      'X-Parse-Application-ID': _CoreManager2.default.get('APPLICATION_ID'),
      'X-Parse-JavaScript-Key': _CoreManager2.default.get('JAVASCRIPT_KEY'),
      'Content-Type': source.type || (source.file ? source.file.type : null)
    };
    var url = _CoreManager2.default.get('SERVER_URL');
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    url += 'files/' + name;
    return _CoreManager2.default.getRESTController().ajax('POST', url, source.file, headers);
  },

  saveBase64: function saveBase64(name, source) {
    if (source.format !== 'base64') {
      throw new Error('saveBase64 can only be used with Base64-type sources.');
    }
    var data = {
      base64: source.base64
    };
    if (source.type) {
      data._ContentType = source.type;
    }

    return _CoreManager2.default.getRESTController().request('POST', 'files/' + name, data);
  }
};

_CoreManager2.default.setFileController(DefaultController);