import React from 'react';
import { View, Button, Text } from 'react-native-elements';

export default class Drawer extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View>
        <Text>drawer</Text>
        <Text>{this.props.groups[0]}</Text>
        <Button title="close" onPress={() => this.props.navigation.toggleDrawer()}></Button>
      </View>
    );
  }
};