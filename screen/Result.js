import React from 'react';
import { Platform, StatusBar, StyleSheet, Linking, View, ScrollView, FlatList } from 'react-native';
import { Header, Button, Text, Input  } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import Spinner from 'react-native-loading-spinner-overlay';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import { APIClient } from '@liskhq/lisk-api-client';
import VoteAPIClient from '../VoteAPIClient';

const LiskClient = APIClient.createMainnetAPIClient();

export default class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, trxExecResults: [false,false,false,false], done: 0}
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.votesData = this.props.navigation.state.params.votesData;
    this.trxs = this.props.navigation.state.params.trxs;
    this.errorMessage = "";
  }

  async componentDidMount() {
    this.setState({isLoading: true});
    this.errorMessage = "";

    const trxResults = await this._broadcast(this.trxs);
    if (trxResults.length === 0) {
      this.errorMessage = "ブロードキャストに失敗しました。";
      this.refs.error_modal.open();
      this.setState({isLoading: false});
      return;
    }
    this.setState({isLoading: false, trxExecResults: trxResults});
  }

  onPress_OK = async() => {
    await this.props.navigation.state.params.updateUserData();
  }

  _broadcast = async(trxs) => {
    try {
      let trxResults = [];
      trxResults.length = 0;
      for(trx of trxs) {
        if (this.isTestnet) {
          const ret = await VoteAPIClient.broadcast({trx:trx});
          trxResults.push(ret.result);
        } else {
          try {
            const ret = await LiskClient.transactions.broadcast({trx:trx});
            if (!ret || !ret.data) trxResults.push(true);
            else trxResults.push(false);
          } catch(err) {
            trxResults.push(false);
          }
        }
        await this._sleep(10000);
        this.setState({done: this.state.done + 1});
      }
      return trxResults;
    } catch(err) {
      return [];
    }
  }

  _sleep = (msec) => {
    return new Promise((resolve) => {
       setTimeout(() => resolve(), msec);
    })
  }

  _link = (trxId) => {
    this.errorMessage = "";
    const url = this.isTestnet? `https://testnet-explorer.lisk.io/tx/${trxId}`: `https://explorer.lisk.io/tx/${trxId}`
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        this.errorMessage = "無効なURLです";
        this.refs.error_modal.open();
      } else {
        return Linking.openURL(url);
      }
    }).catch((err) => {
      this.errorMessage = "URLを開くことが出来ませんでした";
      this.refs.error_modal.open();
    });
  }

  renderVoteList = (num, trxId) => {
    return (
      <View style={{display: this.votesData.has(num)?"flex":"none"}}>
        <View style={styles.label_layout}>
          <Icon name={this.state.trxExecResults[num]?"check-circle":"times-circle"}
            style={this.state.trxExecResults[num]?styles.result_icon_ok: styles.result_icon_error}/>
          <Text style={styles.label}>Transaction: {num + 1}</Text>
        </View>
        <View style={[styles.content,{display: this.votesData.has(num)?"flex":"none"}]}>
          <View style={{flexDirection:"row", display: this.state.trxExecResults[num]?"flex":"none"}}>
            <Icon name="link" style={styles.link_icon}/>
            <Text style={styles.link} onPress={() => this._link(trxId)}>ID: {trxId}</Text>
          </View>
          {this.renderVoteListItem(this.votesData.get(num))}
        </View>
      </View>
    )
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
    if (this.state.isLoading) {
      return (
        <View style={{flex:1}}>
          <Spinner
              visible={this.state.isLoading}
              textContent="Now Voting.."
              textStyle={{ color:"rgba(255,255,255,0.5)" }}
              overlayColor="rgba(0,0,0,0.5)" />

          <Header
            leftComponent={{ icon: 'close', color: '#fff', size: 30, onPress: () => this.onPress_OK() }}
            centerComponent={<Text style={styles.header_title}>Result</Text>}
            containerStyle={[styles.header, {backgroundColor: this.isTestnet?"#003e1a":"#001a3e"}]}
          />
          <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={[styles.label, {fontSize: 30}]}>{this.state.done} / {this.trxs.length}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={{flex:1}}>
        <Header
          leftComponent={{ icon: 'close', color: '#fff', size: 30, onPress: () => this.onPress_OK() }}
          centerComponent={<Text style={styles.header_title}>Result</Text>}
          containerStyle={[styles.header, {backgroundColor: this.isTestnet?"#003e1a":"#001a3e"}]}
        />
        <ScrollView style={{margin: 10}}>
          <Icon name="info-circle" style={styles.message_icon}/>
          <Text style={styles.message_text}>結果は以下の通りです。</Text>
          
          {this.renderVoteList(0, this.trxs.length > 0? (this.trxs[0]).id: "")}
          {this.renderVoteList(1, this.trxs.length > 1? (this.trxs[1]).id: "")}
          {this.renderVoteList(2, this.trxs.length > 2? (this.trxs[2]).id: "")}
          {this.renderVoteList(3, this.trxs.length > 3? (this.trxs[3]).id: "")}

        </ScrollView>
        <Button title={"OK"} buttonStyle={styles.ok_button} onPress={() => this.onPress_OK()} />
        <SafeAreaView/>

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
  result_icon_error: {
    color: 'rgba(165,20,20,1)',
    fontSize: 25,
    marginRight: 10
  },
  result_icon_ok: {
    color: 'rgba(45,140,115,1)',
    fontSize: 25,
    marginRight: 10
  },
  label_layout: {
    flexDirection:"row",
    borderWidth: 1,
    borderColor: "#999",
    backgroundColor: "#ccc",
    marginTop: 10,
    padding: 10,
  },
  link_icon: {
    color: '#999',
    marginRight: 10,
    marginTop: 10,
    fontSize: 25,
  },
  link: {
    color: '#00f',
    marginTop: 10,
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
  },
  label: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
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
    color: 'rgba(0,50,140,0.8)',
    fontSize: 50
  },
  message_text: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 25,
    lineHeight:30
  },
  ok_button: {
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