import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Loading extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Spinner visible={this.props.params.isLoading}
               textContent={this.props.params.text}
               textStyle={{ color:"rgba(255,255,255,0.5)" }}
               overlayColor="rgba(0,0,0,0.5)" />
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 350,
    width: Platform.isPad? 500: 350,
    padding: 15,
    borderRadius: 10,
    borderWidth: 10,
    borderColor: "#e0e0df",
    backgroundColor: "#f0f0ef"
  },
  modal_message: {
    marginTop: 10,
    fontSize: 25,
    lineHeight:30
  },
  modal_icon: {
    color: 'rgba(200,50,50,0.8)',
    fontSize: 50
  },
  modal_button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.isPad? 450: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: "rgba(175,85,105,1)"
  }
})