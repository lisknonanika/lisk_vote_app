import React from 'react';
import { Platform, StatusBar, StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Header, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from 'react-native-i18n';

import Loading from '../parts/Loading';
import MainButton from '../parts/MainButton';

const MAX_VOTE_COUNT = 33;

export default class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false}
    this.addTarget = this.props.navigation.state.params.add;
    this.removeTarget = this.props.navigation.state.params.remove;
    this.user_data = this.props.navigation.state.params.user;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.votesData = new Map();
    this.trxNum = 0;
    this._setVotesData();
  }

  onPress_Execute = () => {
    this.props.navigation.navigate('Passphrase', {
      user: this.user_data,
      isTestnet: this.isTestnet,
      votesData: this.votesData,
      updateUserData: this.props.navigation.state.params.updateUserData
    });
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
            <Text style={styles.label}>Account ({this.isTestnet? "Testnet": "Mainnet"})</Text>
            <Text style={styles.message_text_baseInfo}>Address: {this.user_data.address}</Text>
            <Text style={styles.message_text_baseInfo}>Balance: {this.user_data.balance} LSK</Text>
          </View>
          
          {this.renderVoteList(0)}
          {this.renderVoteList(1)}
          {this.renderVoteList(2)}
          {this.renderVoteList(3)}

          <Text style={[styles.message_note_text,{marginTop: 20}]}>{I18n.t('Confirm.Msg4')}{(this.trxNum + 1) * 15}{I18n.t('Confirm.Msg5')}</Text>
          <Text style={styles.message_note_text}>{I18n.t('Confirm.Msg6')}{this.trxNum + 1}{I18n.t('Confirm.Msg7')}</Text>

        </ScrollView>
        <MainButton params={{title:I18n.t('Confirm.Button1'), style:{margin: 10}, event:() => this.onPress_Execute()}}/>
        <SafeAreaView/>
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
  }
});
