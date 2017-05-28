import { Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
const Icon = require('react-native-vector-icons/MaterialIcons');
import registerScreens from './screens';

registerScreens();


let iconMap = {};

/*
() => <Icon size={24} name="list" color="white" />
() => <Icon size={24} name="pin-drop" color="white" />
() => <Icon size={24} name="assistant-photo" color="white" />
*/

class App {
  constructor() {
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
            Icon.getImageSource('assistant-photo', 24)
      ]).then((values) => {
        iconMap['list'] = values[0];
        iconMap['map'] = values[1];
        iconMap['top-spotters'] = values[2];
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
          icon: iconMap['list'],
          title: 'Spots',
        },
        {
          label: 'Map',
          screen: 'ppg-spots.map',
          icon: iconMap['map'],
          title: 'Map',
        },
        {
          label: 'Top Spotters',
          screen: 'ppg-spots.top-spotters',
          icon: iconMap['top-spotters'],
          title: 'Top Spotters',
        }
      ],
      tabsStyle: {
        tabBarBackgroundColor: '#003a66',
        navBarButtonColor: '#ffffff',
        tabBarButtonColor: '#ffffff',
        navBarTextColor: '#ffffff',
        tabBarSelectedButtonColor: '#ff505c',
        navigationBarColor: '#003a66',
        navBarBackgroundColor: '#003a66',
        statusBarColor: '#002b4c',
        tabFontFamily: 'BioRhyme-Bold',
      },
      appStyle: {
        tabBarBackgroundColor: '#003a66',
        navBarButtonColor: '#ffffff',
        tabBarButtonColor: '#ffffff',
        navBarTextColor: '#ffffff',
        tabBarSelectedButtonColor: '#ff505c',
        navigationBarColor: '#003a66',
        navBarBackgroundColor: '#003a66',
        statusBarColor: '#002b4c',
        tabFontFamily: 'BioRhyme-Bold',
      }
    });
  }
};

new App();