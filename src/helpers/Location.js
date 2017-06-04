import Parse from 'parse/react-native';

export default {
  getAddress: function (lat, lon, cb) {
    Parse.Cloud.run('resolveAddress', { lat, lon }).then(function(result) {
      console.log(result);
      cb(null, result);
    }).catch(function (error) {
      console.log(error);
      cb(error);
    });
  }
};