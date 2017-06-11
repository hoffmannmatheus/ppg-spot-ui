import React, { Component } from 'react'
import {
  Platform,
  TouchableHighlight,
  StyleSheet,
  Image,
  Text,
  View,
  ListView,
  RefreshControl} from 'react-native';

import Parse from 'parse/react-native';
import Auth from '../helpers/Auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GeoLib from 'geolib';

import Location from '../helpers/Location';

const IMAGE_HEIGHT = 190;

class SpotList extends Component {

  constructor (props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      spots: ds.cloneWithRows([  ]),
      isLoading: true,
      currentPosition: null
    };

    this.props.navigator.setOnNavigatorEvent(this._onNavigatorEvent.bind(this));
  }

  componentDidMount () {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          let currentPosition = {latitude: pos.coords.latitude, longitude: pos.coords.longitude};
          this.setState({currentPosition});
          this._showAction();
          this._querySpots();
        },
        (error) => {
          console.log(JSON.stringify(error));
          this._showAction();
          this._querySpots();
        },
        {enableHighAccuracy: false, timeout: 10000, maximumAge: 5000}
    );
  }
  _showAction() {
    if (Platform.OS === 'ios') {
    this.props.navigator.setButtons({
      rightButtons: [{
        icon: globalIconMap['add-spot-white'],
        id: 'add_spot'
      }],
      animated: true,
    });
  } else {
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
    }
  };

  _onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'add_spot') {
        this._addSpot();
      }
    }
  }

  _querySpots() {
    this.setState({isLoading: true});
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    let query = new Parse.Query(Parse.Object.extend("Spot"));
    if (this.state.currentPosition) {
      let geoPoint = new Parse.GeoPoint(this.state.currentPosition);
      query.near("location", geoPoint);
    }

    query.limit(30);
    let that = this;
    query.find().then(
      function(results) {
        that.setState({ spots: ds.cloneWithRows(results), isLoading: false })
      },
      function(error) {
        console.error("Error: " + error.code + " " + error.message);
        that.setState({isLoading: false});
      }
    );
  }

  _onRefresh() {
    this._querySpots();
  }

  _goToSpot(spot) {
    this.props.navigator.showModal({
      screen: 'ppg-spots.spots.spot-detail',
      title: spot.get('name'),
      passProps: {spot}
    });
  }

  _addSpot() {
    if (Auth.isLoggedIn()) {
      this.props.navigator.showModal({
        screen: 'ppg-spots.spots.add-spot',
        animationType: 'slide-up'
      });
    } else {
      this.props.navigator.showModal({
        screen: 'ppg-spots.auth.signup',
        animationType: 'slide-up'
      });
    }
  }

  _getDistanceFrom(spot) {
    if (!this.state.currentPosition) {
      return "";
    }
    let spotLocation = spot.get("location");
    if (!spotLocation || !spotLocation._latitude || !spotLocation._longitude) {
      return "";
    }
    let formattedLocation = {latitude: spotLocation._latitude, longitude: spotLocation._longitude};
    let distanceMeters = GeoLib.getDistance(formattedLocation, this.state.currentPosition);
    let distance = Location.metersToMiles(distanceMeters);
    return (distance < 99 ? distance.toFixed(1) : Math.floor(distance)) + " mi";
  }

  render() {
    return (
        <View style={styles.container}>
          <ListView
              style={styles.spotList}
              contentContainerStyle={styles.content}
              enableEmptySections={true}
              dataSource={this.state.spots || []}
              renderRow={this._renderCard.bind(this)}
              refreshControl={
                <RefreshControl
                  title="Finding spots close to you..."
                  refreshing={this.state.isLoading}
                  onRefresh={this._onRefresh.bind(this)}
                />
              }
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
              source={spot.get('picture') ? {uri: spot.get('picture').url()} : require('../../img/default_spot_image.jpg')}/>
        </View>
    );
  }

  _renderContent(spot) {
    return (
        <View style={styles.cardContentContainer}>
          <View style={styles.contentHeader}>
            <Text style={styles.title}>{spot.get('name')}</Text>
            <Text style={styles.rating}>{spot.get('overall_rating') ? spot.get('overall_rating')+"/5" : "No reviews"}</Text>
          </View>
          <View style={styles.contentLocation}>
            <Text style={styles.contentLocationDistance}>{this.state.currentPosition ? this._getDistanceFrom(spot) : ""}</Text>
            <Icon style={styles.contentLocationIcon} name="location-on" size={14} color="#555" />
            <Text style={styles.contentLocationAddress}>{spot.get('shortLocation')}</Text>
          </View>
        </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progressBar: {
    flex: 1,
    marginTop:100
  },
  spotList: {
    flex: 1,
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    flex: 1,
    flexDirection: 'column'
  },
  contentHeader: {
    marginBottom: 4,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontWeight: '500',
    fontSize: 16,
    flex: 1,
  },
  rating: {
    fontSize: 12,
  },
  contentLocation: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentLocationIcon: {
  },
  contentLocationDistance: {
    flex: 1,
    fontSize: 12,
    marginLeft: 4
  },
  contentLocationAddress: {
    fontSize: 12,
    marginLeft: 4
  }
});

export default SpotList;