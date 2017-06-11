import Parse from 'parse/react-native';

export default {
  getAddress: function (lat, lon, cb) {
    Parse.Cloud.run('resolveAddress', { lat, lon }).then(function(result) {
      cb(null, result);
    }).catch(function (error) {
      cb(error);
    });
  },

  metersToMiles: function(meters) {
    let m = Math.floor(meters) || 1;
    let kmMileRatio = 0.621371;
    return (m/1000)*kmMileRatio;
  }
};