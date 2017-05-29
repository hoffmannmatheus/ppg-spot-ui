import { Navigation } from 'react-native-navigation';

import SpotList from './SpotList';
import Map from './Map';
import TopSpotters from './TopSpotters';
import SpotDetail from './SpotDetail';

export default function () {
  Navigation.registerComponent('ppg-spots.spots', () => SpotList);
  Navigation.registerComponent('ppg-spots.map', () => Map);
  Navigation.registerComponent('ppg-spots.top-spotters', () => TopSpotters);

  Navigation.registerComponent('ppg-spots.spots.spot-detail', () => SpotDetail);
}