import React from 'react';
import { StyleSheet, View} from 'react-native';
import { Header, Button, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modalbox';
import Spinner from 'react-native-loading-spinner-overlay';
import VoteAPIClient from '../VoteAPIClient';

export default class Delegates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, isReady: false};
    this.errorMessage = "";
    this.delegatesList = [];
  }

  async componentDidMount() {
    this.setState({isLoading: true});
    const ret = await this._getDelegatesList();
    if (!ret.result) {
      this.errorMessage = "Delegate情報の取得に失敗しました。";
      this.refs.ready_error_modal.open();
      this.setState({isLoading: false});
      return;
    }
    this.delegatesList = ret.data;
    this.setState({isLoading: false, isReady: true});
  }

  onPress_OK_ReadyError = () => {
    this.refs.ready_error_modal.close();
    this.props.navigation.goBack();
  }

  _getDelegatesList = async() => {
    this.delegatesList = [];
    this.errorMessage = "";
    const net = this.props.navigation.state.params.isTestnet? 0: 1;
    return await VoteAPIClient.getDelegatesList(net);
  }

  _getHeaderBackgroundColor = () => {
    if (this.props.navigation.state.params.isTestnet) {
      return {backgroundColor: '#003e1a'};
    }
    return {backgroundColor: '#001a3e'};
  }

  render() {
    if (!this.state.isReady) {
      return (
        <View style={styles.container}>
          <Spinner
              visible={this.state.isLoading}
              textContent="Now Loading.."
              textStyle={{ color:"rgba(255,255,255,0.5)" }}
              overlayColor="rgba(0,0,0,0.5)" />

          <Modal style={styles.modal} position={"center"} ref={"ready_error_modal"}>
            <Icon name="times-circle" style={styles.modal_icon_error}/>
            <Text style={styles.modal_message}>エラーが発生しました。</Text>
            <Text style={styles.modal_message_dtl}>{this.errorMessage}</Text>
            <Button title={"OK"} buttonStyle={styles.modal_ok_error} onPress={this.onPress_OK_ReadyError} />
          </Modal>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Spinner
            visible={this.state.isLoading}
            textContent="Now Loading.."
            textStyle={{ color:"rgba(255,255,255,0.5)" }}
            overlayColor="rgba(0,0,0,0.5)" />

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
          <Text style={styles.text}>{this.props.navigation.state.params.isTestnet.toString()}</Text>
          <Text style={styles.text}>{this.props.navigation.state.params.user.address}</Text>
          <Text style={styles.text}>{this.props.navigation.state.params.user.balance}</Text>
          <Text style={styles.text}>{this.props.navigation.state.params.user.votes.length}</Text>
          <Text style={styles.text}>{this.delegatesList.length}</Text>
        </View>

        <Modal style={styles.modal} position={"center"} ref={"error_modal"}>
          <Icon name="times-circle" style={styles.modal_icon_error}/>
          <Text style={styles.modal_message}>エラーが発生しました。</Text>
          <Text style={styles.modal_message_dtl}>{this.errorMessage}</Text>
          <Button title={"OK"} buttonStyle={styles.modal_ok_error} onPress={() => {this.refs.error_modal.close()}} />
        </Modal>
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
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 450,
    width: 350,
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
  modal_message_dtl: {
    marginTop: 15,
    fontSize: 20
  },
  modal_label: {
    marginTop: 15,
    fontSize: 23,
    fontFamily: 'Gilroy-ExtraBold'
  },
  modal_text: {
    fontSize: 23,
    fontFamily: 'Gilroy-ExtraBold'
  },
  modal_icon_error: {
    color: 'rgba(200,50,50,0.8)',
    fontSize: 50
  },
  modal_ok_error: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: "rgba(175,85,105,1)"
  }
})