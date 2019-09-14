import React from 'react';
import { Platform, Dimensions, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modalbox';

export default class ErrorModal extends React.Component {
  constructor(props) {
    super(props);
    this.message = "";
    this.closedEvent = undefined;
  }

  open = (msg, closedEvent) => {
    this.message = msg;
    this.closedEvent = closedEvent;
    this.refs.err_modal.open();
  }

  onClosed_Modal = () => {
    if (this.closedEvent === undefined) return;
    this.closedEvent();
  }

  render() {
    return (
      <Modal style={styles.modal} position={"center"} ref={"err_modal"}
              backdropPressToClose={false} onClosed={() => this.onClosed_Modal()}>
        <Icon name="times-circle" style={[styles.modal_icon]}/>
        <Text style={styles.modal_message}>{this.message}</Text>
        <Button title={"OK"} buttonStyle={styles.modal_button} onPress={() => this.refs.err_modal.close()} />
        <Icon name={"close"} style={{color: "#000", position: "absolute", top: 10, left: 10}} size={25} onPress={() => {this.refs.err_modal.close()}} />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 350,
    width: (Platform.isPad || Dimensions.get('window').width >= 750)? 500: 350,
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
    width: (Platform.isPad || Dimensions.get('window').width >= 750)? 450: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: "rgba(175,85,105,1)"
  }
})