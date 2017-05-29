import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SharedElementTransition } from 'react-native-navigation';

class SpotDetail extends Component {

  render() {
    return (
        <ScrollView style={styles.container}>
          <View>
            {[...new Array(40)].map((a, index) => (
                <Text key={`row_${index}`} style={styles.button}>Row {index}</Text>
            ))}
          </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 190,
    backgroundColor: 'white'
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    height: 190
  },
  text: {
    fontSize: 17,
    paddingVertical: 4,
    paddingLeft: 8
  }
});

export default SpotDetail;