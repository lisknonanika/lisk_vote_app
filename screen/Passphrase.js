import React from 'react';
import { Keyboard, Platform, StatusBar, StyleSheet, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Header, Text, Input  } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import { castVotes } from '@liskhq/lisk-transactions';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from 'react-native-i18n';

import Loading from '../parts/Loading';
import MainButton from '../parts/MainButton';
import ErrorModal from '../parts/ErrorModal';

import * as cryptography from '@liskhq/lisk-cryptography';
import { Mnemonic } from '@liskhq/lisk-passphrase';

export default class Passphrase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      passphrase: ["","","","","","","","","","","",""],
      backColor: ["#fff","#fff","#fff","#fff","#fff","#fff","#fff","#fff","#fff","#fff","#fff","#fff"]}
    this.user_data = this.props.navigation.state.params.user;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.votesData = this.props.navigation.state.params.votesData;
    this.wordlist = Mnemonic.wordlists.english;
    this._passphrase = "";
  }

  onSubmitEditing_passphrase = (index) => {
    if (index === 0) this.refs.passphrase_txt1.focus();
    else if (index === 1) this.refs.passphrase_txt2.focus();
    else if (index === 2) this.refs.passphrase_txt3.focus();
    else if (index === 3) this.refs.passphrase_txt4.focus();
    else if (index === 4) this.refs.passphrase_txt5.focus();
    else if (index === 5) this.refs.passphrase_txt6.focus();
    else if (index === 6) this.refs.passphrase_txt7.focus();
    else if (index === 7) this.refs.passphrase_txt8.focus();
    else if (index === 8) this.refs.passphrase_txt9.focus();
    else if (index === 9) this.refs.passphrase_txt10.focus();
    else if (index === 10) this.refs.passphrase_txt11.focus();
    else if (index === 11) Keyboard.dismiss();
  }

  onChangeText_passphrase = (value, index) => {
    const vals = value.trim().split(" ");
    this.setState((state) => {
      const passphrase = state.passphrase;
      const backColor = state.backColor;
      for (i = 0; i < vals.length; i++) {
        if (index + i === 12) break;
        passphrase[index + i] = vals[i].replace(/\s+/g, '');
        if (passphrase[index + i].length === 0) {
          backColor[index + i] = "#fff";
        } else {
          backColor[index + i] = this.wordlist.indexOf(passphrase[index + i]) < 0? "#ffebf1": "#ebf6ff";
        }
      }
      return {passphrase, backColor}
    })
    if (vals.length > 1) Keyboard.dismiss();
  }

  onPress_passphraseClear = (index) => {
    this.setState((state) => {
      const passphrase = state.passphrase;
      const backColor = state.backColor;
      passphrase[index] = "";
      backColor[index] = "#fff";
      return {passphrase, backColor}
    })
  }

  onPress_Exec = async() => {
    this.setState({isLoading: true});
    
    // パスフレーズ入力チェック
    this._passphrase = "";
    for (word of this.state.passphrase) {
      this._passphrase = this._passphrase + word + " ";
    }
    this._passphrase = this._passphrase.trim();

    if (this._passphrase.length === 0) {
      this.refs.error_modal.open(I18n.t('Confirm.ErrMsg1'));
      this.setState({isLoading: false});
      return;
    }
    if (this.user_data.address !== cryptography.getAddressFromPassphrase(this._passphrase)) {
      this.refs.error_modal.open(I18n.t('Confirm.ErrMsg2'));
      this.setState({isLoading: false});
      return;
    }

    // セカンドパスフレーズが設定されていれば、セカンドパスフレーズ入力を表示
    if (this.user_data.secondPublicKey !== undefined && this.user_data.secondPublicKey.length > 0) {
      this.props.navigation.navigate('SecondPassphrase', {
        user: this.user_data,
        isTestnet: this.isTestnet,
        votesData: this.votesData,
        passphrase: this._passphrase,
        updateUserData: this.props.navigation.state.params.updateUserData
      });
      this.setState({isLoading: false});
      return;
    }

    // トランザクション生成チェック
    const trxs = await this._createVoteTransaction();
    if (trxs.length === 0) {
      this.refs.error_modal.open(I18n.t('Confirm.ErrMsg5'));
      this.setState({isLoading: false});
      return;
    }
    
    this.props.navigation.navigate("Result", {
      votesData: this.votesData,
      trxs: trxs,
      isTestnet: this.isTestnet,
      updateUserData: this.props.navigation.state.params.updateUserData});
    this.setState({isLoading: false});
  }

  _createVoteTransaction = async() => {
    try {
      let trxs = [];
      trxs.length = 0;
      for(data of this.votesData.values()) {
        let params = {
          passphrase: this._passphrase,
          votes: data.votes.key,
          unvotes: data.unvotes.key}
        const trx = await castVotes(params);
        trxs.push(trx);
      }
      return trxs;
    } catch (err) {
      return [];
    }
  }

  renderPassphraseInput = (index) => {
    return (
      <Input
        ref={`passphrase_txt${index}`}
        placeholder={(index + 1).toString()}
        placeholderTextColor="#ccc"
        value={this.state.passphrase[index]}
        autoCapitalize={"none"}
        rightIcon={<MIcon name="clear" size={20} style={{color: "#ccc"}} onPress={() => this.onPress_passphraseClear(index)}/>}
        containerStyle={[styles.input_text, {backgroundColor: this.state.backColor[index]}]}
        inputContainerStyle={{backgroundColor: 'transparent', padding: 0, borderBottomWidth: 0}} 
        inputStyle={{backgroundColor: 'transparent', color: '#000', padding: 0, marginLeft: 5, marginRight: 5}}
        secureTextEntry={true}
        onChangeText={(value) => this.onChangeText_passphrase(value, index)}
        returnKeyType={index === 11? "done": "next"}
        blurOnSubmit={false}
        onSubmitEditing={() => this.onSubmitEditing_passphrase(index)}
      />
    )
  }

  render() {
    return (
      <View style={{flex:1}}>
        <Loading params={{isLoading: this.state.isLoading, text: "Now Loading.."}}/>

        <Header
          leftComponent={{ icon: 'chevron-left', color: '#fff', size: 30, onPress: () => this.props.navigation.navigate("Confirm") }}
          centerComponent={<Text style={styles.header_title}>Confirm</Text>}
          containerStyle={[styles.header, {backgroundColor: this.isTestnet?"#003e1a":"#001a3e"}]}
        />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView style={{margin: 10, flexDirection: 'column'}}>
            <Icon name="info-circle" style={styles.message_icon}/>
            <Text style={styles.message_text}>{I18n.t('Confirm.Msg2')}</Text>
            
            <View style={{flexDirection: 'row'}}>
              {this.renderPassphraseInput(0)}
              {this.renderPassphraseInput(1)}
              {this.renderPassphraseInput(2)}
            </View>
            <View style={{flexDirection: 'row'}}>
              {this.renderPassphraseInput(3)}
              {this.renderPassphraseInput(4)}
              {this.renderPassphraseInput(5)}
            </View>
            <View style={{flexDirection: 'row'}}>
              {this.renderPassphraseInput(6)}
              {this.renderPassphraseInput(7)}
              {this.renderPassphraseInput(8)}
            </View>
            <View style={{flexDirection: 'row'}}>
              {this.renderPassphraseInput(9)}
              {this.renderPassphraseInput(10)}
              {this.renderPassphraseInput(11)}
            </View>

          </ScrollView>
          <MainButton params={{title:'OK', style:{margin: 10}, event:() => this.onPress_Exec()}}/>
        </KeyboardAvoidingView>
        <SafeAreaView/>
        <ErrorModal ref={"error_modal"}/>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-around',
    paddingBottom: 10,
    marginTop: Platform.OS === "android"? ((StatusBar.currentHeight || 0) * -1) + 10: 0
  },
  header_title: {
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 25,
    fontFamily: 'Gilroy-ExtraBold',
  },
  content: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#999",
    padding: 10,
    paddingTop: 0
  },
  input_text: {
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 0,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#999',
    width: '30%',
  },
  message_icon: {
    textAlign: 'center',
    justifyContent: 'center',
    alignSelf:'center',
    color: 'rgba(0,50,140,0.8)',
    fontSize: 50
  },
  message_text: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 25,
    lineHeight:30
  }
});
