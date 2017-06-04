import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native';

import Location from '../helpers/Location'

class Map extends Component {

  render() {
    return (
        <View style={{flex: 1}}>
          <GeolocationExample />
        </View>
    );
  }
}

class GeolocationExample extends React.Component {
  state = {
    initialPosition: 'unknown',
    lastPosition: 'unknown',
  };

  watchID: ?number = null;

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
          var initialPosition = JSON.stringify(position);
          this.setState({initialPosition});
        },
        (error) => alert(JSON.stringify(error)),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      this.setState({lastPosition});
    });
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    return (
        <View>
          <Text>
            <Text style={styles.title}>Initial position: </Text>
            {this.state.initialPosition}
          </Text>
          <Text>
            <Text style={styles.title}>Current position: </Text>
            {this.state.lastPosition}
          </Text>
        </View>
    );
  }
}

var styles = StyleSheet.create({
  title: {
    fontWeight: '500',
  },
});

export default Map;