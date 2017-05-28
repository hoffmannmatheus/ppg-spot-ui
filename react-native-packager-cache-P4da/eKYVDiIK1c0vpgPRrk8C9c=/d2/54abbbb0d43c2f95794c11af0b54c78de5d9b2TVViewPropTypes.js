
'use strict';

var PropTypes = require('React').PropTypes;

var TVViewPropTypes = {
  isTVSelectable: PropTypes.bool,

  hasTVPreferredFocus: PropTypes.bool,

  tvParallaxProperties: PropTypes.object,

  tvParallaxShiftDistanceX: PropTypes.number,

  tvParallaxShiftDistanceY: PropTypes.number,

  tvParallaxTiltAngle: PropTypes.number,

  tvParallaxMagnification: PropTypes.number

};

module.exports = TVViewPropTypes;