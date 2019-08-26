import React from 'react';
import { StyleSheet, View} from 'react-native';
import { Button, Text, SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swiper from 'react-native-swiper';
import Modal from 'react-native-modalbox';
import Spinner from 'react-native-loading-spinner-overlay';
import BigNumber from 'bignumber.js';
import {APIClient} from '@liskhq/lisk-api-client';
import VoteAPIClient from '../VoteAPIClient';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, swiperIdx: 0, mainnet_address: '', testnet_address: '5244341344295779314L'};
    this.user_data = {address: '', balance: '', votes: []};
    this.modal_box = {message: '', next_icon_style: {}, err_icon_style: {}, ok_button_style: {}, cancel_btn_style: {}};
  }

  onChangeText_Address = (value) => {
    if (this.state.swiperIdx === 0) {
      this.setState({ mainnet_address: value });
    } else {
      this.setState({ testnet_address: value });
    }
  };
  
  onPress_StartButton = async() => {
    this.setState({ isLoading: true });
    this.user_data = {address: '', balance: '', votes: []};
    this.user_data.votes.length = 0;
    this.modal_box = {message: '', next_icon_style: {}, err_icon_style: {}, ok_button_style: {}, cancel_btn_style: {}};
    const isTestnet = this.state.swiperIdx === 1;
    const address = isTestnet? this.state.testnet_address: this.state.mainnet_address;
    if (address.length === 0) {
      this.setState({ isLoading: false });
      this.props.navigation.navigate('Delegates', {isTestnet: this.state.swiperIdx === 1, user: this.user_data});
      return;
    }
    const ret = await this._getUserData(address, isTestnet);
    this._setUserData(address, ret);
    this._openModal(ret.result);
    this.setState({ isLoading: false });
  }

  onPress_Next = () => {
    this.refs.account_modal.close();
    this.props.navigation.navigate('Delegates', {isTestnet: this.state.swiperIdx === 1, user: this.user_data});
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

  _openModal = (result) => {
    const base_style = {justifyContent: 'center', alignItems: 'center', width: 300, padding: 10, borderRadius: 10};
    if (!result) {
      this.modal_box = {
        message: 'アドレスが正しくないようです。',
        next_icon_style: {display: 'none'},
        err_icon_style: {color: 'rgba(200,50,50,0.8)', fontSize: 50},
        ok_button_style: {display: 'none'},
        cancel_btn_style: {marginTop: 20, backgroundColor: "#999", ...base_style}
      };
    } else {
      this.modal_box = {
        message: 'このアカウントで開始しますか？',
        next_icon_style: {color: 'rgba(10,50,200,0.8)', fontSize: 50},
        err_icon_style: {display: 'none'},
        ok_button_style: {marginTop: 20, backgroundColor: "rgba(175,85,105,1)", ...base_style},
        cancel_btn_style: {marginTop: 10, backgroundColor: "#999", ...base_style}
      };
    }
    this.refs.account_modal.open();
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

          <View style={styles.mainnet}>
            <Text style={styles.text}>Lisk Vote App</Text>
            <Text style={styles.text_small}>- Lisk Mainnet -</Text>
            <View style={styles.input_field}>
              <SearchBar
                placeholder="Lisk Address"
                value={this.state.mainnet_address}
                searchIcon={<Icon name="edit" size={20}/>}
                containerStyle={styles.input_item}
                inputContainerStyle={{backgroundColor: 'transparent', padding: 5}} 
                inputStyle={{backgroundColor: 'transparent', color: '#000'}}
                onChangeText={this.onChangeText_Address} />
              <Button title={"Voteを開始する"} buttonStyle={styles.start_button} onPress={this.onPress_StartButton} />
            </View>
          </View>

          <View style={styles.testnet}>
            <Text style={styles.text}>Lisk Vote App</Text>
            <Text style={styles.text_small}>- Lisk Testnet -</Text>
            <View style={styles.input_field}>
              <SearchBar
                placeholder="Lisk Address"
                value={this.state.testnet_address}
                searchIcon={<Icon name="edit" size={20}/>}
                containerStyle={styles.input_item}
                inputContainerStyle={{backgroundColor: 'transparent', padding: 5}} 
                inputStyle={{backgroundColor: 'transparent', color: '#000'}}
                onChangeText={this.onChangeText_Address} />
              <Button title={"Voteを開始する"} buttonStyle={styles.start_button} onPress={this.onPress_StartButton} />
            </View>
          </View>
          
        </Swiper>

        <Modal style={styles.modal} position={"center"} ref={"account_modal"}>
          <Icon name="question-circle" style={[this.modal_box.next_icon_style]}/>
          <Icon name="times-circle" style={[this.modal_box.err_icon_style]}/>
          <Text style={styles.modal_message}>{this.modal_box.message}</Text>
          <Text style={styles.modal_label}>address</Text>
          <Text style={styles.modal_text}>{this.user_data.address}</Text>
          <Text style={styles.modal_label}>balance</Text>
          <Text style={styles.modal_text}>{this.user_data.balance} LSK</Text>
          <Button title={"OK"} buttonStyle={this.modal_box.ok_button_style} onPress={this.onPress_Next} />
          <Button title={"Cancel"} buttonStyle={this.modal_box.cancel_btn_style} onPress={() => this.refs.account_modal.close()} />
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
    fontFamily: 'Gilroy-ExtraBold'
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
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 10,
    width: 280,
    marginTop: 30
  },
  input_item: {
    backgroundColor: 'rgba(255,255,255,1)',
    padding: 0,
    borderRadius: 10,
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
  modal_label: {
    textAlign: 'center',
    width: 280,
    padding: 3,
    marginTop: 15,
    fontSize: 23,
    fontFamily: 'Gilroy-ExtraBold',
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
  modal_text: {
    textAlign: 'center',
    width: 280,
    fontSize: 23,
    padding: 3,
    fontFamily: 'Gilroy-ExtraBold',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
})