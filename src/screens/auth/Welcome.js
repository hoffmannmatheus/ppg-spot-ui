import React, { Component } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  Text,
  View,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';

import { Navigation } from 'react-native-navigation';
import * as Animatable from 'react-native-animatable';
import Parse from 'parse/react-native';

import Auth from '../../helpers/Auth';

const SHOW_DURATION = 1000;
const HIDE_DURATION = 300;

class SpotDetail extends Component {
  static navigatorStyle = {
    drawUnderNavBar: true,
    navBarTranslucent: true,
    navBarTransparent: true
  };

  constructor(props) {
    super(props);
    this.state = {
      shouldShow: Auth.isLoggedIn(),
      name: Auth.isLoggedIn() && Parse.User.current().get('name'),
      imageAnimationType: 'fadeInDown',
      contentAnimationType: 'fadeInRight',
      animationDuration: SHOW_DURATION
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.props.navigator.toggleNavBar({to:'hidden'});
  }

  onNavigatorEvent(event) {
    switch(event.id) {
      case 'didAppear':
        this.triggerExit();
        break;
    }
  }

  triggerExit() {
    let context = this;
    setTimeout(function () {
      context.setState({
        imageAnimationType: 'fadeOutUp',
        contentAnimationType: 'fadeOutRight',
        animationDuration: HIDE_DURATION
      });
      context.props.navigator.dismissAllModals({animationType: 'slide-down'});
    }, 2000);
  }

  render() {
    return (
      <View style={styles.container}>
        <Animatable.View
            style={styles.animatedText}
            duration={this.state.animationDuration}
            animation={this.state.imageAnimationType}
            useNativeDriver={true}>
          <Text style={styles.title}>Welcome{this.props.from=='signUp' ? '' : ' back'},</Text>
          <Text style={styles.subtitle}>{this.state.name}!</Text>
        </Animatable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E11D32"
  },
  animatedText: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    marginTop: 32,
    fontWeight: '300',
    fontSize: 24
  },
  subtitle: {
    color: '#fff',
    marginTop: 8,
    fontWeight: '200',
    fontSize: 26
  }
});

export default SpotDetail;