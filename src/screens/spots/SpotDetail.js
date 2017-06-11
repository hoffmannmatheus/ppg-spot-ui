import React, { Component } from 'react';
import {
  ScrollView,
  TouchableHighlight,
  StyleSheet,
  Image,
  Text,
  View,
  Platform
} from 'react-native';

import * as Animatable from 'react-native-animatable';
import { Navigation } from 'react-native-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StarRating from 'react-native-star-rating';

const SHOW_DURATION = 300;
const HIDE_DURATION = 250;

class SpotDetail extends Component {

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.state = {
      imageAnimationType: 'fadeInDown',
      contentAnimationType: 'fadeInUp',
      animationDuration: SHOW_DURATION
    }
  }

  onNavigatorEvent(event) {
    if (event.id === 'backPress') {
      this.setState({
        imageAnimationType: 'fadeOutUp',
        contentAnimationType: 'fadeOutDown',
        animationDuration: HIDE_DURATION
      });
      this.props.navigator.pop();
    }
  }

  _onGetDirectionsPressed(spot) {
    this.props.navigator.showSnackbar({
      text: 'Directions pressed',
      actionId: 'fabClicked', // Mandatory if you've set actionText
      actionColor: 'green',
      textColor: 'red',
      backgroundColor: 'blue',
      duration: 'indefinite'
    });
  }

  _formatRatings(value) {
    return Math.round(value * 10) / 10;
  }

  render() {
    let spot = this.props.spot;
    return (
        <ScrollView style={styles.container}>
          {this._renderImage.call(this, spot)}
          {this._renderContent.call(this, spot)}
        </ScrollView>
    );
  }

  _renderImage(spot) {
    return (
        <Animatable.View
          style={styles.imageContainer}
          duration={this.state.animationDuration}
          animation={this.state.imageAnimationType}
          useNativeDriver={true}>
          <Image
            style={styles.image}
            source={{uri: spot.get('picture').url()}}/>
        </Animatable.View>
    );
  }

  _renderContent(spot) {
    return (
        <Animatable.View
            style={styles.content}
            duration={this.state.animationDuration}
            animation={this.state.contentAnimationType}
            useNativeDriver={true}>
          <View style={styles.main_section}>
            <View style={styles.main_section_left}>
              <Text style={styles.main_section_title}>{spot.get('name')}</Text>
              <Text style={styles.main_section_subtext}>{spot.get('address') || 'location?'}</Text>
            </View>
            <TouchableHighlight
                underlayColor={'rgba(0, 0, 0, 0.054)'}
                onPress={() => this._onGetDirectionsPressed(spot)}>
              <Icon style={styles.action_button} name="directions"  size={30} color="#FFF" />
            </TouchableHighlight>
          </View>
          <View style={styles.ratings_section}>
            <View style={styles.ratings_section_label_container}>
              <Text></Text>
              <Text style={styles.ratings_section_label}>{this._formatRatings(spot.get('overall_rating'))}</Text>
            </View>
            <StarRating
                disabled={true}
                maxStars={5}
                starSize={28}
                starColor={"#00528b"}
                emptyStarColor={"#00528b"}
                halfStar={'star-half-full'}
                emptyStar={'star-o'}
                fullStar={'star'}
                iconSet={'FontAwesome'}
                rating={2.5}/>
            <Text style={styles.ratings_section_count}>5 reviews</Text>
          </View>
        </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',

  },
  image: {
    height: 190
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    marginTop: 190,
    flexDirection: 'column',
  },
  main_section: {
    height: 75,
    backgroundColor: '#00528b',
    padding: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  main_section_left: {
    flex: 1,
    flexDirection: 'column'
  },
  main_section_title: {
    color: '#fff',
    fontWeight: '300',
    fontSize: 18
  },
  main_section_subtext: {
    color: '#fff',
    fontWeight: '200',
    fontSize: 14
  },
  ratings_section: {
    padding: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#bbb',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  ratings_section_label_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex:1,
  },
  ratings_section_label: {
    marginRight: 16,
    fontWeight: '300',
    fontSize: 15
  },
  ratings_section_rating: {
    flex:1
  },
  ratings_section_count: {
    justifyContent: 'flex-start',
    flex:1,
    marginLeft: 16,
    fontWeight: '300',
    fontSize: 15
  },
  action_button: {
    margin: 4
  }
});

export default SpotDetail;