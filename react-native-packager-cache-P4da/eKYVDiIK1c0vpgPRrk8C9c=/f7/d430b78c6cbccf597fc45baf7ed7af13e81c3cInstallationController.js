var _CoreManager = require('./CoreManager');

var _CoreManager2 = babelHelpers.interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = babelHelpers.interopRequireDefault(_ParsePromise);

var _Storage = require('./Storage');

var _Storage2 = babelHelpers.interopRequireDefault(_Storage);

var iidCache = null;

function hexOctet() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function generateId() {
  return hexOctet() + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + hexOctet() + hexOctet();
}

var InstallationController = {
  currentInstallationId: function currentInstallationId() {
    if (typeof iidCache === 'string') {
      return _ParsePromise2.default.as(iidCache);
    }
    var path = _Storage2.default.generatePath('installationId');
    return _Storage2.default.getItemAsync(path).then(function (iid) {
      if (!iid) {
        iid = generateId();
        return _Storage2.default.setItemAsync(path, iid).then(function () {
          iidCache = iid;
          return iid;
        });
      }
      iidCache = iid;
      return iid;
    });
  },
  _clearCache: function _clearCache() {
    iidCache = null;
  },
  _setInstallationIdCache: function _setInstallationIdCache(iid) {
    iidCache = iid;
  }
};

module.exports = InstallationController;