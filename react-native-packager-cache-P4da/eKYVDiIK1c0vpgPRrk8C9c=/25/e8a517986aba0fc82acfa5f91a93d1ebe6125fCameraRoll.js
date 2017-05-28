
'use strict';

var _require = require('React'),
    PropTypes = _require.PropTypes,
    checkPropTypes = _require.checkPropTypes;

var RCTCameraRollManager = require('NativeModules').CameraRollManager;

var createStrictShapeTypeChecker = require('createStrictShapeTypeChecker');
var deepFreezeAndThrowOnMutationInDev = require('deepFreezeAndThrowOnMutationInDev');
var invariant = require('fbjs/lib/invariant');

var GROUP_TYPES_OPTIONS = ['Album', 'All', 'Event', 'Faces', 'Library', 'PhotoStream', 'SavedPhotos'];

var ASSET_TYPE_OPTIONS = ['All', 'Videos', 'Photos'];

deepFreezeAndThrowOnMutationInDev(GROUP_TYPES_OPTIONS);
deepFreezeAndThrowOnMutationInDev(ASSET_TYPE_OPTIONS);

var getPhotosParamChecker = createStrictShapeTypeChecker({
  first: PropTypes.number.isRequired,

  after: PropTypes.string,

  groupTypes: PropTypes.oneOf(GROUP_TYPES_OPTIONS),

  groupName: PropTypes.string,

  assetType: PropTypes.oneOf(ASSET_TYPE_OPTIONS),

  mimeTypes: PropTypes.arrayOf(PropTypes.string)
});

var getPhotosReturnChecker = createStrictShapeTypeChecker({
  edges: PropTypes.arrayOf(createStrictShapeTypeChecker({
    node: createStrictShapeTypeChecker({
      type: PropTypes.string.isRequired,
      group_name: PropTypes.string.isRequired,
      image: createStrictShapeTypeChecker({
        uri: PropTypes.string.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        isStored: PropTypes.bool
      }).isRequired,
      timestamp: PropTypes.number.isRequired,
      location: createStrictShapeTypeChecker({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        altitude: PropTypes.number,
        heading: PropTypes.number,
        speed: PropTypes.number
      })
    }).isRequired
  })).isRequired,
  page_info: createStrictShapeTypeChecker({
    has_next_page: PropTypes.bool.isRequired,
    start_cursor: PropTypes.string,
    end_cursor: PropTypes.string
  }).isRequired
});

var CameraRoll = function () {
  function CameraRoll() {
    babelHelpers.classCallCheck(this, CameraRoll);
  }

  babelHelpers.createClass(CameraRoll, null, [{
    key: 'saveImageWithTag',
    value: function saveImageWithTag(tag) {
      console.warn('CameraRoll.saveImageWithTag is deprecated. Use CameraRoll.saveToCameraRoll instead');
      return this.saveToCameraRoll(tag, 'photo');
    }
  }, {
    key: 'saveToCameraRoll',
    value: function saveToCameraRoll(tag, type) {
      invariant(typeof tag === 'string', 'CameraRoll.saveToCameraRoll must be a valid string.');

      invariant(type === 'photo' || type === 'video' || type === undefined, 'The second argument to saveToCameraRoll must be \'photo\' or \'video\'. You passed ' + type);

      var mediaType = 'photo';
      if (type) {
        mediaType = type;
      } else if (['mov', 'mp4'].indexOf(tag.split('.').slice(-1)[0]) >= 0) {
        mediaType = 'video';
      }

      return RCTCameraRollManager.saveToCameraRoll(tag, mediaType);
    }
  }, {
    key: 'getPhotos',
    value: function getPhotos(params) {
      if (__DEV__) {
        checkPropTypes({ params: getPhotosParamChecker }, { params: params }, 'params', 'CameraRoll.getPhotos');
      }
      if (arguments.length > 1) {
        console.warn('CameraRoll.getPhotos(tag, success, error) is deprecated.  Use the returned Promise instead');
        var successCallback = arguments[1];
        if (__DEV__) {
          var callback = arguments[1];
          successCallback = function successCallback(response) {
            checkPropTypes({ response: getPhotosReturnChecker }, { response: response }, 'response', 'CameraRoll.getPhotos callback');
            callback(response);
          };
        }
        var errorCallback = arguments[2] || function () {};
        RCTCameraRollManager.getPhotos(params).then(successCallback, errorCallback);
      }

      return RCTCameraRollManager.getPhotos(params);
    }
  }]);
  return CameraRoll;
}();

CameraRoll.GroupTypesOptions = GROUP_TYPES_OPTIONS;
CameraRoll.AssetTypeOptions = ASSET_TYPE_OPTIONS;

module.exports = CameraRoll;