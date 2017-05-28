import React, { Component } from 'react'
import { AppRegistry, StyleSheet, Text, View, Button } from 'react-native'
import { NavigationComponent } from 'react-native-material-bottom-navigation'
import { TabNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/MaterialIcons'

import SpotList from '../SpotList';


/**
 * Spot List Tab
 */
class SpotListTab extends Component {
  static navigationOptions = {
    tabBarLabel: "Spots",
    tabBarIcon: () => <Icon size={24} name="list" color="white" />
  };

  render() {
    return (
      <SpotList/>
    )}
}

/**
 * Map Tab
 */
class MapTab extends Component {
  static navigationOptions = {
    tabBarLabel: "Map",
    tabBarIcon: () => <Icon size={24} name="pin-drop" color="white" />
  };

  render() {
    return <View><Text>Movies & TV</Text></View>
  }
}

/**
 * Top Spotters Tab
 */
class TopSpottersTab extends Component {
  static navigationOptions = {
    tabBarLabel: "Top Spotters",
    tabBarIcon: () => <Icon size={24} name="assistant-photo" color="white" />
  };

  render() {
    return <View><Text>Books</Text></View>
  }
}

/**
 * react-navigation's TabNavigator.
 */
const MainNavigation = TabNavigator({
  SpotListTab: { screen: SpotListTab },
  MapTab: { screen: MapTab },
  TopSpottersTab: { screen: TopSpottersTab }
}, {
  tabBarComponent: NavigationComponent,
  tabBarPosition: 'bottom',
  tabBarOptions: {
    bottomNavigationOptions: {
      labelColor: 'white',
      rippleColor: 'white',
      shifting: false,
      tabs: {
        SpotListTab: {
          barBackgroundColor: '#37474F'
        },
        MapTab: {
          barBackgroundColor: '#00796B'
        },
        TopSpottersTab: {
          barBackgroundColor: '#5D4037'
        }
      }
    }
  }
})

export default MainNavigation;