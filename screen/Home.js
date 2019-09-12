import React from 'react';
import { Platform, Dimensions, AsyncStorage, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Text, Input } from 'react-native-elements';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Swiper from 'react-native-swiper';
import SplashScreen from 'react-native-splash-screen';
import BigNumber from 'bignumber.js';
import { APIClient } from '@liskhq/lisk-api-client';
import VoteAPIClient from '../VoteAPIClient';
import I18n from 'react-native-i18n';

import Loading from '../parts/Loading';
import TutorialModal from '../parts/TutorialModal'
import ErrorModal from '../parts/ErrorModal';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: true, swiperIdx: 0, mainnet_address: '', testnet_address: ''};
    this.user_data = {address: '', balance: '', publicKey: '', secondPublicKey: '', votes: []};
  }

  async componentDidMount() {
    const isInitializedString = await AsyncStorage.getItem('isInitialized');
    if (isInitializedString === undefined || isInitializedString !== 'true') {
      this.refs.tutorial_modal.open();
    }
    this.setState({isLoading: false});
    SplashScreen.hide();
  }

  onChangeText_Address = (value) => {
    if (this.state.swiperIdx === 0) this.setState({ mainnet_address: value });
    else this.setState({ testnet_address: value });
  };

  onPress_AddressClear = () => {
    if (this.state.swiperIdx === 0) this.setState({ mainnet_address: "" });
    else this.setState({ testnet_address: "" });
  };
  
  onPress_StartButton = async() => {
    this.setState({ isLoading: true });
    this.user_data = {address: '', balance: '', publicKey: '', secondPublicKey: '', votes: []};
    this.user_data.votes.length = 0;
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
    this.refs.error_modal.open(I18n.t('Home.ErrMsg1'));
    this.setState({ isLoading: false });
  }
  
  _getUserData = async(address, isTestnet) => {
    try {
      if (isTestnet) return await VoteAPIClient.getAccountByAddress(address);
      const client = APIClient.createMainnetAPIClient();

      const result1 = await client.accounts.get({address: address, offset: 0, limit: 1});
      if (!result1 || !result1.data || result1.data.length === 0) return {result: false};

      const result2 = await client.votes.get({address: address, offset: 0, limit: 101});
      if (!result2 || !result2.data) return {result: false};

      let result = result1.data[0];
      result.votes = result2.data.votes;
      return {result: true, data: result};

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
      this.user_data.publicKey = userData.data.publicKey;
      this.user_data.secondPublicKey = userData.data.secondPublicKey;
    }
  }

  renderPage = (isTestnet) => {
    return (
      <View style={isTestnet? styles.testnet: styles.mainnet}>
        <Text style={styles.text}>Lisk Vote</Text>
        <Text style={styles.text_small}>{isTestnet? "- Testnet -": "- Mainnet -"}</Text>
        <View style={styles.input_field}>
          <Input
            placeholder="Lisk Address"
            value={isTestnet? this.state.testnet_address: this.state.mainnet_address}
            autoCapitalize={"none"}
            leftIcon={<MCIcon name="account" size={20}/>}
            leftIconContainerStyle={{width:20, marginLeft:0}}
            rightIcon={<MIcon name="clear" size={20} style={{color: "#999"}} onPress={() => this.onPress_AddressClear()}/>}
            containerStyle={styles.input_item}
            inputContainerStyle={{backgroundColor: 'transparent', padding: 0, borderBottomWidth: 0}} 
            inputStyle={{backgroundColor: 'transparent', color: '#000', padding: 0, marginLeft: 10}}
            onChangeText={this.onChangeText_Address} />
          <Button title={I18n.t('Home.Button1')} buttonStyle={styles.start_button} onPress={() => this.onPress_StartButton()} />
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Loading params={{isLoading: this.state.isLoading, text: "Now Loading.."}}/>
            
        <Swiper loop={false}
                showsButtons={true}
                activeDotColor="rgba(255,255,255,0.75)" dotColor="rgba(200,200,200,0.75)"
                nextButton={<Text style={styles.swipe_button}>›</Text>}
                prevButton={<Text style={styles.swipe_button}>‹</Text>}
                onIndexChanged={(index) => this.setState({swiperIdx: index})}>

          {this.renderPage(false)}
          {this.renderPage(true)}
          
        </Swiper>

        <TouchableOpacity style={{position: 'absolute', bottom: 50, left: 20}} onPress={() => this.refs.tutorial_modal.open()}>
          <Text style={styles.link}>Tutorial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{position: 'absolute', bottom: 50, right: 20}} onPress={() => this.props.navigation.navigate('Contact')}>
          <Text style={styles.link}>Contact</Text>
        </TouchableOpacity>
        
        <ErrorModal ref={"error_modal"}/>
        <TutorialModal ref={"tutorial_modal"}/>
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
    width: (Platform.isPad || Dimensions.get('window').width >= 750)? 350: 280,
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
  link: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Open Sans",
    fontSize: 17,
    textDecorationLine: 'underline',
    fontWeight: 'bold'
  }
})