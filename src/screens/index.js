import { Navigation } from 'react-native-navigation';

import SpotList from './SpotList';
import Map from './Map';
import TopSpotters from './TopSpotters';
import SpotDetail from './spots/SpotDetail';
import AddSpot from './spots/AddSpot';
import SignUp from './auth/SignUp';
import Login from './auth/Login';
import Welcome from './auth/Welcome';

export default function () {
  Navigation.registerComponent('ppg-spots.spots', () => SpotList);
  Navigation.registerComponent('ppg-spots.map', () => Map);
  Navigation.registerComponent('ppg-spots.top-spotters', () => TopSpotters);

  Navigation.registerComponent('ppg-spots.spots.spot-detail', () => SpotDetail);
  Navigation.registerComponent('ppg-spots.spots.add-spot', () => AddSpot);

  Navigation.registerComponent('ppg-spots.auth.signup', () => SignUp);
  Navigation.registerComponent('ppg-spots.auth.login', () => Login);
  Navigation.registerComponent('ppg-spots.auth.welcome', () => Welcome);
}