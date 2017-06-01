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
      isSigningUp: false
    }
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
                onChangeText={(name) => this.setState({name})}
                onSubmitEditing={this._focusField.bind(this, 'emailInput')}/>
            <SignUpInput
                ref='emailInput'
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={(email) => this.setState({email})}
                onSubmitEditing={this._focusField.bind(this, 'pwdInput')}/>
            <SignUpInput
                ref='pwdInput'
                placeholder="Password"
                autoCapitalize="none"
                returnKeyType="next"
                secureTextEntry={true}
                onChangeText={(password) => this.setState({password})}
                onSubmitEditing={this._focusField.bind(this, 'confirmPwdInput')}/>
            <SignUpInput
                ref='confirmPwdInput'
                placeholder="Password Confirmation"
                autoCapitalize="none"
                returnKeyType="go"
                secureTextEntry={true}
                onChangeText={(password_confirmation) => this.setState({password_confirmation})}
                onSubmitEditing={this._doSignUp.bind(this)} />
          </View>
          <View style={styles.buttons}>
            {this.state.isSigningUp
                ? <ActivityIndicator animating={this.state.isSigningUp} style={styles.progress} size={'large'} />
                : <Icon.Button name="check" backgroundColor="#FFF"  color="#E11D32" onPress={this._doSignUp.bind(this)}>Sign Up</Icon.Button> }
            <View style={styles.loginButton}>
              <Icon.Button name="login" color="#FFF" backgroundColor="#E11D32" onPress={this._goToLogin.bind(this)}>Have an account? Log in</Icon.Button>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  _focusField(nextField) {
    // Fixme: issue trying to set focus to the TextInput custom component
    //this.refs[nextField].focus();
  }

  _doSignUp() {
    this.refs['emailInput'].getRenderedComponent().refs.refs['emailInput'].focus();

    if (this.state.isSigningUp || !this._validateData()) {
      return;
    }
    this.state.isSigningUp = true;
    let user = new Parse.User();
    user.set("name", this.state.name);
    user.set("username", this.state.email);
    user.set("email", this.state.email);
    user.set("password", this.state.password);

    let instance = this;
    user.signUp(null, {
      success: function(user) {
        instance.state.isSigningUp = false;
        instance.props.navigator.showModal({
          screen: "ppg-spots.auth.welcome",
          animationType: 'slide-up',
          passProps: {
            from: 'signUp'
          }
        });
      },
      error: function(user, error) {
        Alert.alert('Sign Up error', (error.code == 202 ? "Email already in use." : error.message), [{text: "Try again"}]);
        console.log("SignUp error", error);
        instance.state.isSigningUp = false;
        }
    });
  }

  _goToLogin() {
    this.props.navigator.showModal({
      screen: "ppg-spots.auth.login",
      animationType: 'slide-up'
    });
  }

  _validateData() {
    let error;
    if (this.state.name) {
      this.state.name = this.state.name.trim();
    }
    if (this.state.email) {
      this.state.email = this.state.email.trim();
    }
    if (!this.state.name || this.state.name.length < 3 || this.state.name.length > 30) {
      error = "Your name must be between 3 and 30 characters long.";
    } else if (!Auth.isEmailValid(this.state.email)) {
      error = "This email is invalid";
    } else if (!this.state.password || this.state.password.length < 6) {
      error = "Your password needs to be at least 6 characters long."
    } else if (this.state.password !== this.state.password_confirmation) {
      error = "Your password confirmation needs to match."
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
  loginButton: {
    marginTop: 32
  },
  input: {
    flex: 1,
    width: 250,
    height: 40,
    color: "#FFF",
  },
});

export default SpotDetail;