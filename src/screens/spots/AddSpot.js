import React, { Component } from 'react';
import {
  ScrollView,
  TouchableHighlight,
  StyleSheet,
  Image,
  Text,
  TextInput,
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
      contentAnimationType: 'fadeInRight',
      animationDuration: SHOW_DURATION
    };

    this.props.navigator.setTitle({
      title: 'Add a spot'
    });
    this.props.navigator.setButtons({
      rightButtons: [{
        icon: globalIconMap['send'],
        id: 'add_spot'
      }]
    });
  }

  onNavigatorEvent(event) {
    if (event.id === 'backPress') {
      this.setState({
        imageAnimationType: 'fadeOutUp',
        contentAnimationType: 'fadeOutRight',
        animationDuration: HIDE_DURATION
      });
      this.props.navigator.pop();
    }
  }
  _chooseMyLocation() {

  }

  _addPicture() {

  }

  render() {
    return (
        <ScrollView style={styles.container}>
          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="home" size={24} color="#555" />

            <View style={styles.formRowContent}>
              <Text style={styles.formRowTitle}>Name*</Text>
              <View style={styles.formRowContent}>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Valkaria airport"
                    placeholderTextColor="#555"
                    keyboardAppearance="dark"
                    underlineColorAndroid="#555"
                    returnKeyType="next"
                    editable={true}
                    multiline={false}
                    spellCheck={false}
                    numberOfLines={1}
                    maxLength={70} />
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="location-on" size={24} color="#555" />
            <View style={styles.notStretchRowContent}>
              <Text style={styles.formRowTitle}>Location*</Text>
              <Icon.Button name="my-location" backgroundColor="#679"  color="#FFF" onPress={this._chooseMyLocation.bind(this)}>Choose current Location</Icon.Button>
            </View>
          </View>

          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="photo-camera" size={24} color="#555" />
            <View style={styles.notStretchRowContent}>
              <Text style={styles.formRowTitle}>Pictures</Text>
              <TouchableHighlight style={styles.pictureFrame} underlayColor="#EEE" onPress={this._addPicture.bind(this)}>
                <View>
                  <Icon name="add-a-photo" size={24} color="#555" />
                  <Text>Add</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>

          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="description" size={24} color="#555" />
            <View style={styles.formRowContent}>
              <Text style={styles.formRowTitle}>Description</Text>
              <View style={styles.formRowContent}>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Best take off is facing east. Watch out for fire ants!"
                    placeholderTextColor="#555"
                    keyboardAppearance="dark"
                    underlineColorAndroid="#555"
                    returnKeyType="next"
                    editable={true}
                    multiline={true}
                    spellCheck={false}
                    numberOfLines={3}
                    maxLength={1000} />
              </View>

            </View>
          </View>

          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="star" size={24} color="#555" />
            <View style={styles.notStretchRowContent}>
              <Text style={styles.formRowTitle}>Ratings</Text>
              <StarRating
                  maxStars={5}
                  starSize={28}
                  starColor={"#555"}
                  emptyStarColor={"#555"}
                  halfStar={'star-half-full'}
                  emptyStar={'star-o'}
                  fullStar={'star'}
                  iconSet={'FontAwesome'}
                  rating={2.5}/>
              <Text style={styles.ratings_section_count}>5 reviews</Text>
            </View>
          </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: 'column',
    paddingTop: 4,
    paddingBottom: 16
  },
  formRow: {
    flexDirection: 'row',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
  },
  formRowIcon: {
    marginRight:24,
  },
  formRowContent: {
    flexDirection: 'column',
    flex: 1
  },
  notStretchRowContent: {
    flexDirection: 'column'
  },
  formRowTitle: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12
  },
  pictureFrame: {
    width: 75,
    height: 75,
    borderColor: "#555",
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    marginTop: -8,
    color: "#333",
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
  action_button: {
    margin: 4
  }
});

export default SpotDetail;