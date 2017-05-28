import { Navigation } from 'react-native-navigation';

import SpotList from './SpotList';
import Map from './Map';
import TopSpotters from './TopSpotters';

export default function () {
  Navigation.registerComponent('ppg-spots.spots', () => SpotList);
  Navigation.registerComponent('ppg-spots.map', () => Map);
  Navigation.registerComponent('ppg-spots.top-spotters', () => TopSpotters);
}