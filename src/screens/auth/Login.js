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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Parse from 'parse/react-native';

import Auth from '../../helpers/Auth';

class SpotDetail extends Component {
  static navigatorStyle = {
    drawUnderNavBar: true,
    navBarTranslucent: true,
    navBarTransparent: true
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoggingIn: false
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <Icon name="rocket" size={160} color="#FFF" />
            <Text style={styles.title}>{"Log in"}</Text>
          </View>
          <View style={styles.inputs}>
            <SignUpInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onChangeText={(email) => this.setState({email})} />
            <SignUpInput
              placeholder="Password"
              autoCapitalize="none"
              returnKeyType="go"
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password})}
              onSubmitEditing={this._doLogin.bind(this)}/>
          </View>
          <View style={styles.buttons}>
            {this.state.isLoggingIn
                ? <ActivityIndicator animating={this.state.isLoggingIn} style={styles.progress} size={'large'} />
                : <Icon.Button name="login" backgroundColor="#FFF"  color="#E11D32" onPress={this._doLogin.bind(this)}>Log in</Icon.Button> }
          </View>
        </ScrollView>
      </View>
    );
  }

  _doLogin() {
    if (this.state.isLoggingIn || !this._validateData()) {
      return;
    }
    this.state.isLoggingIn = true;

    let instance = this;
    Parse.User.logIn(this.state.email, this.state.password, {
      success: function(user) {
        instance.state.isLoggingIn = false;
        instance.props.navigator.showModal({
          screen: "ppg-spots.auth.welcome",
          animationType: 'slide-up',
          passProps: {
            from: 'login'
          }
        });
      },
      error: function(user, error) {
        Alert.alert('Login error', "Invalid email or password", [{text: "Try again"}]);
        instance.state.isLoggingIn = false;
        console.log("Login error", error);
      }
    });
  }

  _validateData() {
    let error;
    if (this.state.email) {
      this.state.email = this.state.email.trim();
    }
    if (!Auth.isEmailValid(this.state.email)) {
      error = "This email is invalid";
    } else if (!this.state.password || this.state.password.length < 6) {
      error = "Your password needs to be at least 6 characters long."
    }
    if (error) {
      Alert.alert('Oops', error, [{text: 'Got it'}]);
    }
    return !error;
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
        {...this.props}
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
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '300',
    fontSize: 24
  },
  input: {
    flex: 1,
    width: 250,
    height: 40,
    color: "#FFF",
  },
});

export default SpotDetail;