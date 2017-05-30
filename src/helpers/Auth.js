import Parse from 'parse/react-native';

export default {
  isLoggedIn: function () {
    return !!(Parse.User.current());
  },

  getCurrentUser: function() {
    return Parse.User.current();
  }
};