import React from 'react';
import { StatusBar, StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Header, Button, Text, Input  } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import Spinner from 'react-native-loading-spinner-overlay';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import {APIClient} from '@liskhq/lisk-api-client';
import VoteAPIClient from '../VoteAPIClient';
import transaction from '@liskhq/lisk-transactions';

const MAX_VOTE_COUNT = 33;

export default class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, passphrase: "", secondPassphrase: ""}
    this.addTarget = this.props.navigation.state.params.add;
    this.removeTarget = this.props.navigation.state.params.remove;
    this.user_data = this.props.navigation.state.params.user;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.votesData = new Map();
    this.trxNum = 0;
    this.errorMessage = "";
    this._setVotesData();
  }

  onPress_Exec = async() => {
    this.setState({isLoading: true});
    this.errorMessage = "";
    if (this.state.passphrase.length === 0) {
      this.errorMessage = "Passphraseが未入力です。";
      this.refs.error_modal.open();
      this.setState({isLoading: false});
      return;
    }
    if (this.user_data.secondPublicKey !== undefined && this.state.secondPassphrase.length === 0) {
      this.errorMessage = "Second Passphraseが未入力です。";
      this.refs.error_modal.open();
      this.setState({isLoading: false});
      return;
    }
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

  renderVoteList = (data) => {
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

  render() {
    return (
      <View style={{flex:1}}>
        <Spinner
            visible={this.state.isLoading}
            textContent="Now Loading.."
            textStyle={{ color:"rgba(255,255,255,0.5)" }}
            overlayColor="rgba(0,0,0,0.5)" />

        <Header
          leftComponent={{ icon: 'close', color: '#fff', size: 30, onPress: () => this.props.navigation.navigate("Delegates") }}
          centerComponent={<Text style={styles.header_title}>Confirm</Text>}
          containerStyle={[styles.header, {backgroundColor: this.isTestnet?"#003e1a":"#001a3e"}]}
        />
        <ScrollView style={{margin: 10}}>
          <Icon name="exclamation-triangle" style={styles.message_icon}/>
          <Text style={styles.message_text}>内容に間違いはありませんか？</Text>
          <Text style={styles.message_text_s}>(Vote手数料: {this.trxNum + 1} LSK)</Text>
          <Text style={[styles.label, {display: this.votesData.has(0)?"flex":"none"}]}>Transaction: 1</Text>
          <View style={[styles.content,{display: this.votesData.has(0)?"flex":"none"}]}>
            {this.renderVoteList(this.votesData.get(0))}
          </View>
          <Text style={[styles.label, {display: this.votesData.has(1)?"flex":"none"}]}>Transaction: 2</Text>
          <View style={[styles.content,{display: this.votesData.has(1)?"flex":"none"}]}>
            {this.renderVoteList(this.votesData.get(1))}
          </View>
          <Text style={[styles.label, {display: this.votesData.has(2)?"flex":"none"}]}>Transaction: 3</Text>
          <View style={[styles.content,{display: this.votesData.has(2)?"flex":"none"}]}>
            {this.renderVoteList(this.votesData.get(2))}
          </View>
          <Text style={[styles.label, {display: this.votesData.has(3)?"flex":"none"}]}>Transaction: 4</Text>
          <View style={[styles.content,{display: this.votesData.has(3)?"flex":"none"}]}>
            {this.renderVoteList(this.votesData.get(3))}
          </View>
        </ScrollView>
        <Button title={"実行"} buttonStyle={styles.exec_button} onPress={() => this.refs.passphrase_modal.open()} />
        <SafeAreaView/>

        <Modal style={[styles.modal, {height: 450}]} position={"center"} ref={"passphrase_modal"} backdropPressToClose={false}>
          <Icon name="info-circle" style={styles.modal_icon_info}/>
          <Text style={styles.modal_message}>パスフレーズを入力して下さい</Text>
          <Input 
            placeholder="Passphrase"
            value={this.state.passphrase}
            autoCapitalize={"none"}
            leftIcon={<Icon name="edit" size={20}/>}
            rightIcon={<Icon name="times" size={20} style={{color: "#ccc"}} onPress={() => this.setState({publicKey:""})}/>}
            containerStyle={styles.modal_input}
            inputContainerStyle={{backgroundColor: 'transparent', padding: 0, borderBottomWidth: 0}} 
            inputStyle={{backgroundColor: 'transparent', color: '#000', padding: 0, marginLeft: 10}}
            secureTextEntry={true}
            onChangeText={(value) => this.setState({passphrase:value})} />
          <Input 
            placeholder="Second Passphrase"
            value={this.state.secondPassphrase}
            autoCapitalize={"none"}
            leftIcon={<Icon name="edit" size={20}/>}
            rightIcon={<Icon name="times" size={20} style={{color: "#ccc"}} onPress={() => this.setState({secondPublicKey:""})}/>}
            containerStyle={[styles.modal_input,{display: this.user_data.secondPublicKey===undefined?"none":"flex"}]}
            inputContainerStyle={{backgroundColor: 'transparent', padding: 0, borderBottomWidth: 0}} 
            inputStyle={{backgroundColor: 'transparent', color: '#000', padding: 0, marginLeft: 10}}
            secureTextEntry={true}
            onChangeText={(value) => this.setState({passphrase:value})} />
          <Button title={"OK"} buttonStyle={styles.modal_ok_button} onPress={() => {this.onPress_Exec()}} />
          <Button title={"Cancel"} buttonStyle={styles.modal_cancel_button} onPress={() => {this.refs.passphrase_modal.close()}} />
        </Modal>

        <Modal style={styles.modal} position={"center"} ref={"error_modal"} backdropPressToClose={false}>
          <Icon name="times-circle" style={styles.modal_icon_error}/>
          <Text style={styles.modal_message}>{this.errorMessage}</Text>
          <Button title={"OK"} buttonStyle={styles.modal_ok_button} onPress={() => {this.refs.error_modal.close()}} />
        </Modal>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-around',
    paddingBottom: 10,
    marginTop: ((StatusBar.currentHeight || 0) * -1) + 10
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
    marginTop: 10,
    fontSize: 25,
    lineHeight:30
  },
  message_text_s: {
    marginTop: 10,
    fontSize: 20
  },
  exec_button: {
    margin: 10,
    padding: 10,
    backgroundColor: 'rgba(175,85,105,1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 350,
    width: 350,
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
  modal_icon_error: {
    color: 'rgba(200,50,50,0.8)',
    fontSize: 50
  },
  modal_icon_info: {
    color: 'rgba(0,50,140,0.8)',
    fontSize: 50
  },
  modal_cancel_button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: "rgba(150,150,150,1)"
  },
  modal_ok_button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: 'rgba(175,85,105,1)',
  }
});