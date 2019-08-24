import React from 'react';
import { StyleSheet, View} from 'react-native';
import { Header, Button, Text } from 'react-native-elements';

export default class Delegates extends React.Component {
  constructor(props) {
    super(props);
  }

  _getHeaderBackgroundColor = () => {
    if (this.props.navigation.state.params.net === 0) {
      return {backgroundColor: '#001a3e'};
    }
    return {backgroundColor: '#003e1a'};
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          barStyle="light-content"
          leftComponent={{ icon: 'menu', color: '#fff', size: 30 }}
          centerComponent={{ text: 'Delegates', style: { color: '#fff', fontFamily: 'Gilroy-ExtraBold', fontSize: 25 }}}
          rightComponent={{ icon: 'home', color: '#fff', size: 30, onPress: () => this.props.navigation.goBack() }}
          containerStyle={{
            justifyContent: 'space-around',
            ...this._getHeaderBackgroundColor(),
          }}
        />
        <View style={styles.content}>
          <Text style={styles.text}>Lisk Vote App</Text>
          <Text style={styles.text}>{this.props.navigation.state.params.net}</Text>
          <Text style={styles.text}>{this.props.navigation.state.params.user.address}</Text>
          <Text style={styles.text}>{this.props.navigation.state.params.user.balance}</Text>
          <Text style={styles.text}>{this.props.navigation.state.params.user.votes.length}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 30,
    fontFamily: 'Gilroy-ExtraBold'
  },
})