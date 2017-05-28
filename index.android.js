import React, { Component } from 'react';
import { AppRegistry, ListView, Text, View } from 'react-native';
import MainNavigation from './src/components/MainNavigation';
import SpotList from './src/components/SpotList';


class App extends Component {
  render() {
    return(
        <MainNavigation/>
    )
  }
}


// App registration and rendering
AppRegistry.registerComponent('paramotor_spots', () => App);