import React, { Component } from 'react';
import {
  ScrollView,
  TouchableHighlight,
  StyleSheet,
  Image,
  Text,
  TextInput,
  Alert,
  View,
  Platform
} from 'react-native';

import { Navigation } from 'react-native-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView from 'react-native-maps';
import Modal from 'react-native-modal'
import ImagePicker from 'react-native-image-picker';
import Parse from 'parse/react-native';

import Location from '../../helpers/Location';

const SHOW_DURATION = 300;
const HIDE_DURATION = 250;

const INITIAL_LAT = 37.78825;
const INITIAL_LON =-122.4324;
const INITIAL_LAT_DELTA = 0.0922;
const INITIAL_LON_DELTA = 0.0421;

class SpotDetail extends Component {

  state = {
    isMapModalVisible: false,
    imageAnimationType: 'fadeInDown',
    contentAnimationType: 'fadeInRight',
    animationDuration: SHOW_DURATION,

    name: "",
    description: "",
    currentAddress: '?',
    picture: null,
    mapRegion: {
      latitude: INITIAL_LAT,
      longitude: INITIAL_LON,
      latitudeDelta: INITIAL_LAT_DELTA,
      longitudeDelta: INITIAL_LON_DELTA
    }
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    this.props.navigator.setTitle({
      title: 'New paramotor spot'
    });
    this.props.navigator.setButtons({
      rightButtons: [{
        icon: globalIconMap['send'],
        title: 'save',
        id: 'save_spot'
      }]
    });

  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          let mapRegion = {latitudeDelta: INITIAL_LAT_DELTA, longitudeDelta: INITIAL_LON_DELTA};
          mapRegion.latitude = pos.coords.latitude;
          mapRegion.longitude = pos.coords.longitude;
          this.setState({mapRegion});
          this._updateAddress();
        },
        (error) => console.log(JSON.stringify(error)),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  onNavigatorEvent(event) {
    if (event.id === 'backPress') {
      this.setState({
        imageAnimationType: 'fadeOutUp',
        contentAnimationType: 'fadeOutRight',
        animationDuration: HIDE_DURATION
      });
      this.props.navigator.pop();
    } else if (event.id === 'save_spot') {
      this._save();
    }
  }

  _chooseLocation() {
    this.setState({ isMapModalVisible: true });
  }

  _chooseLocationDone() {
    this.setState({ isMapModalVisible: false });
  }

  _onMapRegionChange(mapRegion) {
    this.setState({ mapRegion });
  }

  _updateAddress() {
    Location.getAddress(this.state.mapRegion.latitude, this.state.mapRegion.longitude,
        (err, result) => {
          if (result) {
            let address = (result.streetName ? result.streetName + ", " : "")
                + (result.city ? result.city + ", " : "")
                + (result.administrativeLevels.level1short || "");
            this.setState({currentAddress: (address || "")});
          }
        }
    );
  }

  _addPicture() {
    const options = {
      title: 'Add picture',
      takePhotoButtonTitle: 'Use camera',
      chooseFromLibraryButtonTitle: 'Pick from gallery',
      mediaType: 'photo',
      maxWidth: 1280,
      maxHeight: 720,
      quality: 0.8,
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        this.setState({
          picture: { uri: response.uri },
          pictureBase64: response.data
        });
      }
    });
  }

  _save() {
    if (!this._validateData()) {
      return;
    }

    let SpotClass = Parse.Object.extend("Spot");
    let spot = new SpotClass();
    let geoPoint = new Parse.GeoPoint({
      latitude: this.state.mapRegion.latitude,
      longitude: this.state.mapRegion.longitude
    });
    let picture = this.state.pictureBase64
        && new Parse.File("spot_"+(new Date()).getTime()+".jpeg", { base64: this.state.pictureBase64 });


    spot.set("name", this.state.name);
    spot.set("location", geoPoint);
    spot.set("shortLocation", this.state.currentAddress);
    spot.set("spotter", Parse.User.current());
    spot.set("description", this.state.description);
    if (picture) {
      spot.set("picture", picture);
    }

    spot.save(null, {
      success: function(spot) {
        Alert.alert('Spot saved!', "Your new spot is online! How about leaving its first review?",
            [{text: 'Let\'s do it'}]);
        Navigation.dismissModal({animationType: 'slide-down'});
      },
      error: function(gameScore, error) {
        Alert.alert('Failed to save spot', error.message, [{text: 'Try again'}]);
      }
    });
  }

  _validateData() {
    let error;
    if (!this.state.name || this.state.name.length < 5) {
      error = "The name must be at least 5 characters."
    }
    if (!this.state.mapRegion || !this.state.mapRegion.latitude || !this.state.mapRegion.longitude) {
      error = "The current location cannot be identified. Please use the map to select a location."
    }
    if (error) {
      Alert.alert('Oops', error, [{text: 'Got it'}]);
    }
    return !error;
  }

  render() {
    return (
        <ScrollView style={styles.container}>
          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="info-outline" size={24} color="#555" />

            <View style={styles.formRowContent}>
              <Text style={styles.formRowTitle}>Name*</Text>
              <View style={styles.formRowContent}>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Valkaria airport"
                    placeholderTextColor="#888"
                    keyboardAppearance="dark"
                    underlineColorAndroid="#555"
                    returnKeyType="next"
                    editable={true}
                    multiline={false}
                    spellCheck={false}
                    numberOfLines={1}
                    maxLength={70}
                    onChangeText={(name) => this.setState({name})} />
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="location-on" size={24} color="#555" />
            <View style={styles.formRowContent}>
              <Text style={styles.formRowTitle}>Location*</Text>
              <Text style={styles.address}>{this.state.currentAddress}</Text>
              <View>
                <MapView
                    style={styles.mapPreview}
                    region={this.state.mapRegion}
                    onRegionChange={this._onMapRegionChange.bind(this)}/>
                <View
                  style={styles.mapOverlay}>
                  <Icon.Button name="my-location" backgroundColor="#2974aa"  color="#FFF" onPress={this._chooseLocation.bind(this)}>Change location</Icon.Button>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <Icon style={styles.formRowIcon} name="photo-camera" size={24} color="#555" />
            <View style={styles.notStretchRowContent}>
              <Text style={styles.formRowTitle}>Pictures</Text>
              <View style={{flexDirection: 'row'}}>
                <Image style={styles.pictureFrame} source={this.state.picture} />
                <TouchableHighlight style={styles.pictureFrame} underlayColor="#EEE" onPress={this._addPicture.bind(this)}>
                  <View>
                    <Icon name="add-a-photo" size={24} color="#555" />
                    <Text>Add</Text>
                  </View>
                </TouchableHighlight>
              </View>
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
                    placeholderTextColor="#888"
                    keyboardAppearance="dark"
                    underlineColorAndroid="#555"
                    returnKeyType="next"
                    editable={true}
                    multiline={true}
                    spellCheck={false}
                    numberOfLines={3}
                    maxLength={1000}
                    onChangeText={(description) => this.setState({description})} />
              </View>

            </View>
          </View>


          <Modal
              isVisible={this.state.isMapModalVisible}
              onBackButtonPress={this._chooseLocationDone.bind(this)}
              onModalHide={this._updateAddress.bind(this)}>
            <View style={styles.modalStyle}>
              <MapView
                  style={styles.fullMap}
                  region={this.state.mapRegion}
                  onRegionChange={this._onMapRegionChange.bind(this)}/>
              <View style={styles.fullMapCenterMarker}>
                <Icon name="location-on" size={32} color="#C11" />
              </View>
              <View style={styles.fullMapDoneButton}>
                <Icon.Button name="my-location" backgroundColor="#2974aa"  color="#FFF" onPress={this._chooseLocationDone.bind(this)}>Change location</Icon.Button>
              </View>
            </View>
          </Modal>
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
    paddingBottom: 32
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
  mapPreview: {
    height: 100,
  },
  modalStyle: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fullMap: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullMapCenterMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullMapDoneButton: {
    marginBottom: 32,
    flexDirection: 'row'
  },
  mapOverlay: {
    flex: 1,
    height: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  address: {
    textAlign: 'left',
    color: "#333"
  },
  pictureFrame: {
    width: 75,
    height: 75,
    marginRight: 8,
    borderColor: "#555",
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    marginTop: -8,
    color: "#333",
  }
});

export default SpotDetail;