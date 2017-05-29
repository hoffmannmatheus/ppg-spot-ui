import React, { Component } from 'react'
import { Platform, ScrollView, TouchableHighlight, StyleSheet, Image, Text, View, ListView, ActivityIndicator } from 'react-native';
import { SharedElementTransition } from 'react-native-navigation';

import Parse from 'parse/react-native';

const IMAGE_HEIGHT = 190;

class SpotList extends Component {

  constructor (props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = { spots: ds.cloneWithRows([  ]), isLoading: true }
  }

  _getSpotsAsync() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    Parse.initialize("ParamotorSpots");
    Parse.serverURL = "http://104.131.179.248:1337/parse";

    let query = new Parse.Query(Parse.Object.extend("Spot"));
    let instance = this;
    query.find().then(
      function(results) {
        console.log("success got data: ", results);
        instance.setState({ spots: ds.cloneWithRows(results), isLoading: false })
      },
      function(error) {
        console.error("Error: " + error.code + " " + error.message);
        instance.setState({isLoading: false});
      }
    );
  }

  _goToCard(spot) {
    this.props.navigator.showModal({
      screen: 'ppg-spots.spots.spot-detail',
      title: spot.get('name'),
      sharedElements: [`image${spot.id}`],
      passProps: {
        sharedImageId: `image${spot.id}`,
        spot: spot
      }
    });
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
              onPress={() => this._goToCard(spot)}>
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
        <SharedElementTransition
            style={styles.imageContainer}
            sharedElementId={`image${spot.id}`}>
          <Image
              style={styles.image}
              source={{uri: spot.get('picture').url()}}/>
        </SharedElementTransition>
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