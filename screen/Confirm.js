import React from 'react';
import { Platform, StatusBar, StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Header, Button, Text, Input  } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { castVotes } from '@liskhq/lisk-transactions';
import I18n from 'react-native-i18n';

import Loading from '../parts/Loading';
import MainButton from '../parts/MainButton';
import ErrorModal from '../parts/ErrorModal';

import * as cryptography from '@liskhq/lisk-cryptography';

const MAX_VOTE_COUNT = 33;

export default class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, passphrase: "chicken problem whip mobile shield angry hard toast disease chronic code category", secondPassphrase: ""}
    this.addTarget = this.props.navigation.state.params.add;
    this.removeTarget = this.props.navigation.state.params.remove;
    this.user_data = this.props.navigation.state.params.user;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.votesData = new Map();
    this.trxNum = 0;
    this._setVotesData();
  }

  onPress_Exec = async() => {
    this.setState({isLoading: true});
    
    // パスフレーズ入力チェック
    if (this.state.passphrase.length === 0) {
      this.refs.error_modal.open(I18n.t('Confirm.ErrMsg1'));
      this.setState({isLoading: false});
      return;
    }
    if (this.user_data.publicKey !== cryptography.getPrivateAndPublicKeyFromPassphrase(this.state.passphrase).publicKey) {
      this.refs.error_modal.open(I18n.t('Confirm.ErrMsg2'));
      this.setState({isLoading: false});
      return;
    }

    // セカンドパスフレーズ入力チェック
    if (this.user_data.secondPublicKey !== undefined && this.state.secondPassphrase.length === 0) {
      this.refs.error_modal.open(I18n.t('Confirm.ErrMsg3'));
      this.setState({isLoading: false});
      return;
    }
    if (this.user_data.secondPublicKey !== cryptography.getPrivateAndPublicKeyFromPassphrase(this.state.secondPassphrase).publicKey) {
      this.refs.error_modal.open(I18n.t('Confirm.ErrMsg4'));
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

  _setVotesData = () => {
    this.votesData.clear();
    let cnt = 0;
  
    this.removeTarget.forEach((delegate, key) => {
      this.trxNum = Math.floor(cnt / MAX_VOTE_COUNT);
      if (!this.votesData.has(this.trxNum)) this.votesData.set(this.trxNum, {votes:{name:[], key:[]}, unvotes:{name:[], key:[]}});
      this.votesData.get(this.trxNum).unvotes.name.push(delegate.username);
      this.votesData.get(this.trxNum).unvotes.key.push(key);
      cnt += 1;
    });
  
    this.addTarget.forEach((delegate, key) => {
      this.trxNum = Math.floor(cnt / MAX_VOTE_COUNT);
      if (!this.votesData.has(this.trxNum)) this.votesData.set(this.trxNum, {votes:{name:[], key:[]}, unvotes:{name:[], key:[]}});
      this.votesData.get(this.trxNum).votes.name.push(delegate.username);
      this.votesData.get(this.trxNum).votes.key.push(key);
      cnt += 1;
    });
  }

  _createVoteTransaction = async() => {
    try {
      let trxs = [];
      trxs.length = 0;
      for(data of this.votesData.values()) {
        let params = {passphrase:this.state.passphrase, votes:data.votes.key, unvotes:data.unvotes.key}
        if (this.state.secondPassphrase) params['secondPassphrase'] = this.state.secondPassphrase;
        const trx = await castVotes(params);
        trxs.push(trx);
      }
      return trxs;
    } catch (err) {
      return [];
    }
  }

  renderVoteList = (num) => {
    return (
      <View style={{display: this.votesData.has(num)?"flex":"none"}}>
        <Text style={styles.label}>Transaction: {num + 1}</Text>
        <View style={styles.content}>{this.renderVoteListItem(this.votesData.get(num))}</View>
      </View>
    );
  }

  renderVoteListItem = (data) => {
    if (data === undefined || (data.unvotes.key.length === 0 && data.votes.key.length === 0)) return(<View></View>);

    return (
      <View style={{flex:1}}>
        <Text style={[styles.label_sub, {display: data.unvotes.key.length===0?"none":"flex", backgroundColor:"rgba(165,20,20,1)", color:"#fff"}]}>Remove</Text>
        <FlatList
          data={data.unvotes.name}
          keyExtractor={(item) => item}
          renderItem={({item}) => <Text style={[styles.text, {backgroundColor:"#eee", color:"rgba(165,20,20,1)"}]}>{item}</Text>}
        />
        
        <Text style={[styles.label_sub, {display: data.votes.key.length===0?"none":"flex", backgroundColor:"rgba(45,140,115,1)", color:"#fff"}]}>Add</Text>
        <FlatList
          data={data.votes.name}
          keyExtractor={(item) => item}
          renderItem={({item}) => <Text style={[styles.text, {backgroundColor:"#eee", color:"rgba(45,140,115,1)"}]}>{item}</Text>}
        />
      </View>
    )
  }

  renderPassphraseModal = (isSecond) => {
    if (isSecond && this.user_data.secondPublicKey === undefined) return (<View/>); 
    return (
      <Input 
        placeholder={isSecond? "Second Passphrase": "Passphrase"}
        value={isSecond? this.state.secondPassphrase: this.state.passphrase}
        autoCapitalize={"none"}
        leftIcon={<Icon name="lock" size={20}/>}
        leftIconContainerStyle={{width:20, marginLeft:0}}
        rightIcon={
          <MIcon name="clear" size={20} style={{color: "#ccc"}}
                  onPress={() => isSecond? this.setState({secondPassphrase:""}): this.setState({passphrase:""})}/>
        }
        containerStyle={styles.modal_input}
        inputContainerStyle={{backgroundColor: 'transparent', padding: 0, borderBottomWidth: 0}} 
        inputStyle={{backgroundColor: 'transparent', color: '#000', padding: 0, marginLeft: 10}}
        secureTextEntry={true}
        onChangeText={
          (value) => isSecond? this.setState({secondPassphrase:value}): this.setState({passphrase:value})
        } />
    );
  }

  render() {
    return (
      <View style={{flex:1}}>
        <Loading params={{isLoading: this.state.isLoading, text: "Now Loading.."}}/>

        <Header
          leftComponent={{ icon: 'chevron-left', color: '#fff', size: 30, onPress: () => this.props.navigation.navigate("Delegates") }}
          centerComponent={<Text style={styles.header_title}>Confirm</Text>}
          containerStyle={[styles.header, {backgroundColor: this.isTestnet?"#003e1a":"#001a3e"}]}
        />
        <ScrollView style={{margin: 10}}>
          <Icon name="exclamation-triangle" style={styles.message_icon}/>
          <Text style={styles.message_text}>{I18n.t('Confirm.Msg1')}</Text>

          <View style={{display: this.votesData.has(0)?"flex":"none"}}>
            <Text style={styles.label}>Account</Text>
            <Text style={styles.message_text_baseInfo}>Address: {this.user_data.address}</Text>
            <Text style={styles.message_text_baseInfo}>Balance: {this.user_data.balance} LSK</Text>
          </View>
          
          {this.renderVoteList(0)}
          {this.renderVoteList(1)}
          {this.renderVoteList(2)}
          {this.renderVoteList(3)}

          <Text style={[styles.message_note_text,{marginTop: 20}]}>{I18n.t('Confirm.Msg3')}{(this.trxNum + 1) * 15}{I18n.t('Confirm.Msg4')}</Text>
          <Text style={styles.message_note_text}>{I18n.t('Confirm.Msg5')}{this.trxNum + 1}{I18n.t('Confirm.Msg6')}</Text>

        </ScrollView>
        <MainButton params={{title:I18n.t('Confirm.Button1'), style:{margin: 10}, event:() => this.refs.passphrase_modal.open()}}/>
        <SafeAreaView/>

        <Modal style={[styles.modal, {height: 450}]} position={"center"} ref={"passphrase_modal"} backdropPressToClose={false}>
          <Icon name="info-circle" style={styles.modal_icon}/>
          <Text style={styles.modal_message}>{I18n.t('Confirm.Msg2')}</Text>
          
          {this.renderPassphraseModal(false)}
          {this.renderPassphraseModal(true)}

          <Button title={"OK"} buttonStyle={styles.modal_ok_button} onPress={() => {this.onPress_Exec()}} />
          <Button title={"Cancel"} buttonStyle={styles.modal_cancel_button} onPress={() => {this.refs.passphrase_modal.close()}} />
        </Modal>
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
  label: {
    color: '#000',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: "#ccc",
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#999"
  },
  label_sub: {
    color: '#000',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#999"
  },
  text: {
    color: '#000',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
    padding: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#999"
  },
  message_icon: {
    textAlign: 'center',
    justifyContent: 'center',
    alignSelf:'center',
    color: 'rgba(190,180,0,0.8)',
    fontSize: 50
  },
  message_text: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 25,
    lineHeight:30
  },
  message_text_baseInfo: {
    borderColor: "#ccc",
    fontSize: 18,
    borderWidth:1,
    borderTopWidth:0,
    padding: 10
  },
  message_note_text: {
    marginTop: 10,
    fontSize: 18,
    color: "#f00",
    textAlign: "right"
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
  modal_input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    padding: 5,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    width: '100%'
  },
  modal_message: {
    marginTop: 10,
    fontSize: 25,
    lineHeight:30
  },
  modal_icon: {
    color: 'rgba(0,50,140,0.8)',
    fontSize: 50
  },
  modal_cancel_button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.isPad? 450: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: "rgba(150,150,150,1)"
  },
  modal_ok_button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.isPad? 450: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: 'rgba(175,85,105,1)',
  }
});