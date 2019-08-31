import React from 'react';
import { Platform, StyleSheet, View} from 'react-native';
import { Button, Text, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Swiper from 'react-native-swiper';
import Modal from 'react-native-modalbox';
import Spinner from 'react-native-loading-spinner-overlay';
import BigNumber from 'bignumber.js';
import { APIClient } from '@liskhq/lisk-api-client';
import VoteAPIClient from '../VoteAPIClient';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, swiperIdx: 0, mainnet_address: '', testnet_address: '3905013786800090105L'};
    this.user_data = {address: '', balance: '', votes: []};
    this.err_message = "";
  }

  onChangeText_Address = (value) => {
    if (this.state.swiperIdx === 0) this.setState({ mainnet_address: value });
    else this.setState({ testnet_address: value });
  };

  onPress_Address = () => {
    if (this.state.swiperIdx === 0) this.setState({ mainnet_address: "" });
    else this.setState({ testnet_address: "" });
  };
  
  onPress_StartButton = async() => {
    this.setState({ isLoading: true });
    this.user_data = {address: '', balance: '', votes: []};
    this.user_data.votes.length = 0;
    this.err_message = "";
    const isTestnet = this.state.swiperIdx === 1;
    const address = isTestnet? this.state.testnet_address: this.state.mainnet_address;

    // アドレス未入力なら遷移
    if (address.length === 0) {
      this.props.navigation.navigate('Delegates', {isTestnet: this.state.swiperIdx === 1, user: this.user_data});
      this.setState({ isLoading: false });
      return;
    }
    
    const ret = await this._getUserData(address, isTestnet);
    this._setUserData(address, ret);

    // ユーザーの情報が取得できたら遷移
    if (ret.result) {
      this.props.navigation.navigate('Delegates', {isTestnet: this.state.swiperIdx === 1, user: this.user_data});
      this.setState({ isLoading: false });
      return;
    }

    // それ以外はエラー
    this.err_message = 'アドレスが正しくないようです。';
    this.refs.err_modal.open();
    this.setState({ isLoading: false });
  }
  
  _getUserData = async(address, isTestnet) => {
    try {
      if (isTestnet) return await VoteAPIClient.getAccountByAddress(address);
      const client = APIClient.createMainnetAPIClient();
      const result = await client.votes.get({address: address, offset: 0, limit: 101});
      if (!result || !result.data) return {result: false};
      return {result: true, data: result.data};

    } catch (err) {
      return {result: false};
    }
  }

  _setUserData = (address, userData) => {
    this.user_data.address = address;
    this.user_data.balance = '0';
    this.user_data.votes.length = 0;
    if (userData.result) {
      this.user_data.balance = new BigNumber(userData.data.balance).dividedBy(new BigNumber('100000000')).toFixed();
      this.user_data.votes = userData.data.votes;
    }
  }

  renderPage = (isTestnet) => {
    return (
      <View style={isTestnet? styles.testnet: styles.mainnet}>
        <Text style={styles.text}>Lisk Vote App</Text>
        <Text style={styles.text_small}>{isTestnet? "- Lisk Testnet -": "- Lisk Mainnet -"}</Text>
        <View style={styles.input_field}>
          <Input
            placeholder="Lisk Address"
            value={isTestnet? this.state.testnet_address: this.state.mainnet_address}
            autoCapitalize={"none"}
            leftIcon={<MCIcon name="account" size={20}/>}
            leftIconContainerStyle={{width:20, marginLeft:0}}
            rightIcon={<MIcon name="clear" size={20} style={{color: "#999"}} onPress={() => this.onPress_Address()}/>}
            containerStyle={styles.input_item}
            inputContainerStyle={{backgroundColor: 'transparent', padding: 0, borderBottomWidth: 0}} 
            inputStyle={{backgroundColor: 'transparent', color: '#000', padding: 0, marginLeft: 10}}
            onChangeText={this.onChangeText_Address} />
          <Button title={"Voteを開始する"} buttonStyle={styles.start_button} onPress={() => this.onPress_StartButton()} />
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner
            visible={this.state.isLoading}
            textContent="Now Loading.."
            textStyle={{ color:"rgba(255,255,255,0.5)" }}
            overlayColor="rgba(0,0,0,0.5)" />
            
        <Swiper loop={false}
                showsButtons={true}
                activeDotColor="rgba(255,255,255,0.75)" dotColor="rgba(200,200,200,0.75)"
                nextButton={<Text style={styles.swipe_button}>›</Text>}
                prevButton={<Text style={styles.swipe_button}>‹</Text>}
                onIndexChanged={(index) => this.setState({swiperIdx: index})}>

          {this.renderPage(false)}
          {this.renderPage(true)}
          
        </Swiper>

        <Modal style={styles.modal} position={"center"} ref={"err_modal"} backdropPressToClose={false}>
          <Icon name="times-circle" style={[styles.modal_icon_error]}/>
          <Text style={styles.modal_message}>{this.err_message}</Text>
          <Button title={"OK"} buttonStyle={styles.modal_ok_error} onPress={() => this.refs.err_modal.close()} />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  mainnet: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2475b9',
  },
  testnet: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#149965',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontFamily: 'Gilroy-ExtraBold',
    marginTop: -100
  },
  text_small: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Open Sans'
  },
  swipe_button: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 50,
  },
  input_field: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    padding: 10,
    width: Platform.isPad? 350: 280,
    marginTop: 30
  },
  input_item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    width: '100%'
  },
  start_button: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(175,85,105,1)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10
  },
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
  modal_icon_error: {
    color: 'rgba(200,50,50,0.8)',
    fontSize: 50
  },
  modal_ok_error: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.isPad? 450: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: "rgba(175,85,105,1)"
  }
})