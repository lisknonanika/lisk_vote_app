import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

export default class MainButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Button
        title={this.props.params.title}
        buttonStyle={[styles.button, this.props.params.style]}
        onPress={() => this.props.params.event()}/>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: 'rgba(175,85,105,1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  }
})