import { Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
const Icon = require('react-native-vector-icons/MaterialIcons');

import Parse from 'parse/react-native';
import registerScreens from './screens';

registerScreens();


globalIconMap = {};

class App {
  constructor() {

    Parse.initialize("ParamotorSpots");
    Parse.serverURL = "http://ppg-spots.mhsilva.io:1338/parse";

    this._populateIcons().then(() => {
      this._startApp();
    }).catch((error) => {
      console.error(error);
    });
  }

  _populateIcons = function () {
    return new Promise(function (resolve, reject) {
      Promise.all([
        Icon.getImageSource('list', 24),
        Icon.getImageSource('map', 24),
        Icon.getImageSource('assistant-photo', 24),
        Icon.getImageSource('add-location', 24, "#fff"),
        Icon.getImageSource('send', 24, "#fff"),

      ]).then((values) => {
        globalIconMap['list'] = values[0];
        globalIconMap['map'] = values[1];
        globalIconMap['top-spotters'] = values[2];
        globalIconMap['add-spot-white'] = values[3];
        globalIconMap['send'] = values[4];
        resolve(true);
      }).catch((error) => {
        console.log(error);
        reject(error);
      }).done();
    });
  };

  _startApp = function() {
    Navigation.startTabBasedApp({
      tabs: [
        {
          label: 'Spots',
          screen: 'ppg-spots.spots',
          icon: globalIconMap['list'],
          title: 'Spots',
        },
        {
          label: 'Map',
          screen: 'ppg-spots.map',
          icon: globalIconMap['map'],
          title: 'Map',
        },
        {
          label: 'Top Spotters',
          screen: 'ppg-spots.top-spotters',
          icon: globalIconMap['top-spotters'],
          title: 'Top Spotters',
        }
      ],
      tabsStyle: {
        tabBarBackgroundColor: '#003a66',
        navBarButtonColor: '#ffffff',
        tabBarButtonColor: '#ffffff',
        navBarTextColor: '#ffffff',
        tabBarSelectedButtonColor: '#E11D32',
        navigationBarColor: '#003a66',
        navBarBackgroundColor: '#003a66',
        statusBarColor: '#002b4c',
        tabFontFamily: 'BioRhyme-Bold',
      },
      appStyle: {
        orientation: 'portrait',
        tabBarBackgroundColor: '#003a66',
        navBarButtonColor: '#ffffff',
        tabBarButtonColor: '#ffffff',
        navBarTextColor: '#ffffff',
        tabBarSelectedButtonColor: '#E11D32',
        navigationBarColor: '#003a66',
        navBarBackgroundColor: '#003a66',
        statusBarColor: '#002b4c',
        tabFontFamily: 'BioRhyme-Bold',
      }
    });
  }
}

new App();