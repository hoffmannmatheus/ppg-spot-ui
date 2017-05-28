
'use strict';

var AnimatedImplementation = require('AnimatedImplementation');
var Image = require('Image');
var Text = require('Text');
var View = require('View');

var AnimatedScrollView = void 0;

var Animated = {
  View: AnimatedImplementation.createAnimatedComponent(View),
  Text: AnimatedImplementation.createAnimatedComponent(Text),
  Image: AnimatedImplementation.createAnimatedComponent(Image),
  get ScrollView() {
    if (!AnimatedScrollView) {
      AnimatedScrollView = AnimatedImplementation.createAnimatedComponent(require('ScrollView'));
    }
    return AnimatedScrollView;
  }
};

babelHelpers.extends(Animated, AnimatedImplementation);

module.exports = Animated;