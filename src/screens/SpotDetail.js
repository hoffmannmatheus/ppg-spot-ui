import React, { Component } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  View,
  Platform,
  ScrolView
} from 'react-native';
import { SharedElementTransition } from 'react-native-navigation';
import * as Animatable from 'react-native-animatable';

const SHOW_DURATION = 400;
const HIDE_DURATION = 300;

class SpotDetail extends Component {

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    console.log("props:", this.props);

    this.state = {
      animationType: 'fadeInRight',
      animationDuration: SHOW_DURATION
    }
  }

  onNavigatorEvent(event) {
    if (event.id === 'backPress') {
      this.setState({
        animationType: 'fadeOutRight',
        animationDuration: HIDE_DURATION
      });
      this.props.navigator.pop();
    }
  }

  render() {
    let spot = this.props.spot;
    return (
        <View style={styles.container}>
          {this._renderImage(spot)}
          {this._renderContent(spot)}
        </View>
    );
  }

  _renderImage(spot) {
    return (
        <SharedElementTransition
            style={styles.imageContainer}
            sharedElementId={this.props.sharedImageId}
            showDuration={SHOW_DURATION}
            hideDuration={HIDE_DURATION}
            animateClipBounds={true}
            showInterpolation={
                    {
                        type: 'linear',
                        easing: 'FastOutSlowIn'
                    }
                }
            hideInterpolation={
                    {
                        type: 'linear',
                        easing: 'FastOutSlowIn'
                    }
                }
        >
          <Image
            style={styles.image}
            source={{uri: spot.get('picture').url()}}/>
        </SharedElementTransition>
    );
  }

  _renderContent(spot) {
    return (
        <Animatable.View
            style={styles.content}
            duration={this.state.animationDuration}
            animation={this.state.animationType}
            useNativeDriver={true}
        >
          <Text style={styles.text}>Line 1</Text>
          <Text style={styles.text}>Line 2</Text>
          <Text style={styles.text}>Line 3</Text>
          <Text style={styles.text}>Line 4</Text>
          <Text style={styles.text}>Line 5</Text>
          <Text style={styles.text}>Line 6</Text>
          <Text style={styles.text}>Line 7</Text>
          <Text style={styles.text}>Line 8</Text>
        </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    marginTop: 190,
    backgroundColor: 'white'
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    height: 190
  },
  text: {
    fontSize: 17,
    paddingVertical: 4,
    paddingLeft: 8
  }
});

export default SpotDetail;