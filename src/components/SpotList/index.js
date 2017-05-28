import React, { Component } from 'react'
import { ListView, Text, View } from 'react-native';
import Parse from 'parse/react-native';

class Spotlist extends Component {
  // Initialize the hardcoded data
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([
        'John', 'Joel', 'James', 'Jimmy', 'Jackson', 'Jillian', 'Julie', 'Devin'
      ])
    };

    Parse.initialize("ParamotorSpots");
    Parse.serverURL = "http://104.131.179.248:1337/parse";
    let query = new Parse.Query(Parse.Object.extend("Spot"));
    let instance = this;
    query.find({
      success: function(results) {
        let items = [];
        for (let i = 0; i < results.length; i++) {
          let object = results[i];
          items.push(object.id + ' - ' + object.get('name'));
        }
        let dataSource = ds.cloneWithRows(items);
        instance.setState({dataSource: dataSource});
      },
      error: function(error) {
        let dataSource = ds.cloneWithRows([
          "Error: " + error.code + " " + error.message
        ]);
        instance.setState({dataSource: dataSource});
      }
    })
  }
  render() {
    return (
        <View style={{flex: 1, paddingTop: 22}}>
          <Text>hue</Text>
          <ListView
              dataSource={this.state.dataSource}
              renderRow={(rowData) => <Text>{rowData}</Text>}
          />
        </View>
    );
  }
}

export default Spotlist;