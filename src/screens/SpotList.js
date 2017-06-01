import React, { Component } from 'react'
import { Platform, ScrollView, TouchableHighlight, StyleSheet, Image, Text, View, ListView, ActivityIndicator } from 'react-native';

import Parse from 'parse/react-native';
import Auth from '../helpers/Auth';

const IMAGE_HEIGHT = 190;

class SpotList extends Component {

  // Only add right button if on iOS
  static navigatorButtons = {
    rightButtons: Platform.OS === 'ios' ? [
          {
            icon: globalIconMap['add-spot-dark'],
            id: 'add_spot'
          }
        ] : null
  };

  constructor (props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = { spots: ds.cloneWithRows([  ]), isLoading: true }

    if (Platform.OS == "android") {
      this._showFab();
    }
    this.props.navigator.setOnNavigatorEvent(this._onNavigatorEvent.bind(this));
  }

  _showFab() {
    this.props.navigator.setButtons({
      fab: {
        collapsedId: 'add_spot',
        collapsedIcon: globalIconMap['add-spot-white'],
        expendedId: 'clear',
        expendedIcon: globalIconMap['add-spot-white'],
        backgroundColor: '#03A9F4'
      },
      animated: true,
    });
  };

  _onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'add_spot') {
        this._addSpot();
      }
    }
  }

  _getSpotsAsync() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    let query = new Parse.Query(Parse.Object.extend("Spot"));
    let instance = this;
    query.find().then(
      function(results) {
        instance.setState({ spots: ds.cloneWithRows(results), isLoading: false })
      },
      function(error) {
        console.error("Error: " + error.code + " " + error.message);
        instance.setState({isLoading: false});
      }
    );
  }

  _goToSpot(spot) {
    this.props.navigator.showModal({
      screen: 'ppg-spots.spots.spot-detail',
      title: spot.get('name'),
      passProps: {
        spot: spot
      }
    });
  }

  _addSpot() {
    if (Auth.isLoggedIn()) {
      console.log("_addSpot _addSpot _addSpot _addSpot ");
      //Parse.User.logOut().then(console.log);
    } else {
      this.props.navigator.showModal({
        screen: 'ppg-spots.auth.signup',
        animationType: 'slide-up'
      });
    }
  }

  componentDidMount () {
    this._getSpotsAsync()
  }

  render() {
    return (
        <View style={{flex: 1}}>
          {this.state.isLoading ? <ActivityIndicator animating={this.state.isLoading} style={styles.progress} size={'large'} /> : null}
          <ListView
              style={styles.container}
              contentContainerStyle={styles.content}
              enableEmptySections={true}
              dataSource={this.state.spots || []}
              renderRow={this._renderCard.bind(this)}
          />
        </View>
    );
  }

  _renderCard(spot) {
    return (
        <View style={styles.cardContainer}>
          <TouchableHighlight
              underlayColor={'rgba(0, 0, 0, 0.054)'}
              onPress={() => this._goToSpot(spot)}>
            <View>
              {this._renderImage(spot)}
              {this._renderContent(spot)}
            </View>
          </TouchableHighlight>
        </View>
    );
  }

  _renderImage(spot) {
    return (
        <View style={styles.imageContainer}>
          <Image
              style={styles.image}
              source={{uri: spot.get('picture').url()}}/>
        </View>
    );
  }

  _renderContent(spot) {
    return (
        <View style={styles.cardContentContainer}>
          <Text style={styles.title}>{spot.get('name')}</Text>
          <Text style={styles.rating}>{spot.get('overall_rating')}/5</Text>
        </View>
    );
  }

}

const styles = StyleSheet.create({
  progress: {
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 0
  },
  content: {
    marginHorizontal: 8,
  },
  cardContainer: {
    marginVertical: 8,
    elevation: 2,
    borderRadius: 2,
    backgroundColor: '#F5F5F5'
  },
  imageContainer: {
    justifyContent: 'flex-start'
  },
  image: {
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
  },
  cardContentContainer: {
    padding: 8,
    flex: 1,
    flexDirection: 'row'
  },
  title: {
    fontWeight: '500',
    fontSize: 17,
    flex: 1,
  },
  rating: {

  }
});

export default SpotList;