import React, { Component } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  Text,
  View,
  Platform
} from 'react-native';

import * as Animatable from 'react-native-animatable';
import { Navigation } from 'react-native-navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SHOW_DURATION = 300;
const HIDE_DURATION = 250;

class SpotDetail extends Component {
  static navigatorStyle = {
    drawUnderNavBar: true,
    navBarTranslucent: true,
    navBarTransparent: true
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      animationType: 'fadeInDown',
      animationDuration: SHOW_DURATION
    }
  }

  onNavigatorEvent(event) {
    if (event.id === 'backPress') {
      this.setState({
        animationType: 'fadeOutUp',
        animationDuration: HIDE_DURATION
      });
      this.props.navigator.pop();
    }
  }

  _onGetDirectionsPressed(spot) {
    console.log("pressed....");
    this.props.navigator.showSnackbar({
      text: 'Directions pressed',
      actionId: 'fabClicked', // Mandatory if you've set actionText
      actionColor: 'green',
      textColor: 'red',
      backgroundColor: 'blue',
      duration: 'indefinite'
    });
    Navigation.showInAppNotification('Directions pressed!');
  }

  _formatRatings(value) {
    return Math.round(value * 10) / 10;
  }

  render() {
    return (
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.header}>
              <Icon name="rocket" size={160} color="#FFF" />
              <Text style={styles.title}>{"Let's Sign Up!"}</Text>
            </View>
            <View style={styles.inputs}>
              <SignUpInput
                placeholder="Your Name"
                autoCapitalize="words"
                returnKeyType="next"
                onChangeText={(text) => this.setState({text})}
                value={this.state.name}/>
              <SignUpInput
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onChangeText={(text) => this.setState({text})}
                  value={this.state.name}/>
              <SignUpInput
                  placeholder="Password"
                  autoCapitalize="none"
                  returnKeyType="go"
                  secureTextEntry={true}
                  onChangeText={(text) => this.setState({text})}
                  value={this.state.name}
                  onSubmitEditing={this._doSignup}/>
            </View>
            <View style={styles.buttons}>
              <Icon.Button name="check" backgroundColor="#FFF"  color="#E11D32" onPress={this._goToLogin}>Sign Up</Icon.Button>
              <Text style={styles.or}>Already have an account?</Text>
              <Icon.Button name="login" backgroundColor="#FFF" color="#E11D32" onPress={this._goToLogin}>Login</Icon.Button>
            </View>
          </ScrollView>
        </View>
    );
  }

  _doSignup() {

  }
  _goToLogin() {

  }
}

class SignUpInput extends Component {
  render() {
    return (
        <TextInput
            style={styles.input}
            placeholderTextColor="#F5F5F5"
            keyboardAppearance="dark"
            underlineColorAndroid="#FFFFFF"
            editable = {true}
            multiline = {false}
            spellCheck = {false}
            numberOfLines = {1}
            maxLength = {70}
            {...this.props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
        />
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#E11D32"
  },
  header: {
    flex: 1,
    marginTop: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputs: {
    flex: 1,
    marginTop: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    flex: 1,
    marginTop: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '300',
    fontSize: 24
  },
  or: {
    marginTop: 30,
    marginBottom: 16,
    color: '#fff',
    fontWeight: '200',
    fontSize: 16
  },
  input: {
    flex: 1,
    width: 250,
    height: 40,
    color: "#FFF",
  },
});

export default SpotDetail;