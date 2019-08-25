import React from 'react';
import { StyleSheet, View, FlatList} from 'react-native';
import { Header, Button, CheckBox, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modalbox';
import Spinner from 'react-native-loading-spinner-overlay';
import VoteAPIClient from '../VoteAPIClient';

export default class Delegates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, isReady: false, listUpdate: 0};
    this.errorMessage = "";
    this.isTestnet = false;
    this.user_data = {};
    this.delegatesList = [];
    this.delegatesGroup = [];
    this.currentVotes = [];
    this.addVotes = [];
    this.removeVotes = [];
    this.viewDelegatesList = [];
  }

  async componentDidMount() {
    this.setState({isLoading: true});

    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.user_data = this.props.navigation.state.params.user;

    const ret = await this._getDelegatesList();
    if (!ret.result) {
      this.errorMessage = "Delegate情報の取得に失敗しました。";
      this.refs.ready_error_modal.open();
      this.setState({isLoading: false});
      return;
    }
    this.delegatesList = ret.data;
    this.viewDelegatesList.length = 0;
    this.viewDelegatesList = ret.data;
    this._setDelegatesGroup();
    if (this.user_data.address.length > 1) this._setVotes();
    this.setState({isLoading: false, isReady: true});
  }

  onPress_ListItem = (key) => {
    if (this.user_data.address.length === 0) return;

    if (this.removeVotes.indexOf(key) >= 0) {
      var newArray = this.removeVotes.filter(function(item) {
        return item !== key;
      });
      this.removeVotes = newArray;
    } else if (this.addVotes.indexOf(key) >= 0) {
      var newArray = this.addVotes.filter(function(item) {
        return item !== key;
      });
      this.addVotes = newArray;
    } else if (this.currentVotes.indexOf(key) >= 0) {
      this.removeVotes.push(key);
    } else {
      this.addVotes.push(key);
    }
    this.setState({listUpdate: this.state.listUpdate+1});
  }

  _getHeaderBackgroundColor = () => {
    return this.isTestnet? {backgroundColor: '#003e1a'}: {backgroundColor: '#001a3e'};
  }

  _getDelegatesList = async() => {
    try {
      this.delegatesList.length = 0;
      this.errorMessage = "";
      const net = this.isTestnet? 0: 1;
      return await VoteAPIClient.getDelegatesList(net);
    } catch (err) {
      return {result: false}
    }
  }

  _setDelegatesGroup = () => {
    this.delegatesGroup.length = 0;
    this.delegatesList.forEach((delegate) => {
      delegate.groups.forEach((group) => {
        if (this.delegatesGroup.indexOf(group) < 0) this.delegatesGroup.push(group);
      });
    });
    this.delegatesGroup.sort();
  }

  _setVotes = () => {
    this.currentVotes.length = 0;
    this.user_data.votes.forEach((item) => {
      this.currentVotes.push(item.publicKey);
    });
  }

  _getListColor = (key) => {
    if (this.user_data.address.length === 0) return {backgroundColor: "rgba(255,255,255,0.3)"};
    if (this.removeVotes.indexOf(key) >= 0) return {backgroundColor: "rgba(255,0,0,0.3)"};
    if (this.addVotes.indexOf(key) >= 0) return {backgroundColor: "rgba(0,255,0,0.3)"};
    if (this.currentVotes.indexOf(key) >= 0) return {backgroundColor: "rgba(255,255,255,0.3)"};
    return {backgroundColor: "rgba(0,0,0,0.3)"};
  }

  _getListIcon = (key) => {
    if (this.user_data.address.length === 0) return "minus-circle";
    if (this.removeVotes.indexOf(key) >= 0) return "minus-circle";
    if (this.addVotes.indexOf(key) >= 0) return "plus-circle";
    if (this.currentVotes.indexOf(key) >= 0) return "plus-circle";
    return "minus-circle";
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

          <Modal style={styles.modal} position={"center"} ref={"ready_error_modal"} onClosed={() => this.props.navigation.goBack()}>
            <Icon name="times-circle" style={styles.modal_icon_error}/>
            <Text style={styles.modal_message}>エラーが発生しました。</Text>
            <Text style={styles.modal_message_dtl}>{this.errorMessage}</Text>
            <Button title={"OK"} buttonStyle={styles.modal_ok_error} onPress={() => this.refs.ready_error_modal.close()} />
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
        <View style={{flex: 1}}>
          <Text style={styles.text}>Lisk Vote App</Text>
          <View style={{flexDirection:'row', justifyContent: 'flex-end'}}>
            <Text style={styles.sumcount}>voted: {this.currentVotes.length + this.addVotes.length - this.removeVotes.length}</Text>
            <Text style={styles.addcount}>+ {this.addVotes.length}</Text>
            <Text style={styles.removecount}>- {this.removeVotes.length}</Text>
          </View>
          <FlatList
            style={{marginTop: 10}}
            data={this.viewDelegatesList}
            extraData={this.state.listUpdate}
            keyExtractor={(item) => item.publicKey}
            renderItem={({ item }) => (
              <ListItem
                title={
                  <View style={{flexDirection:'row', alignItems: 'center'}}>
                    <Text style={styles.rank}>{item.rank}</Text>
                    <View style={{flexDirection:'column'}}>
                      <Text style={styles.username}>{item.username}</Text>
                      <View style={{flexDirection:'row', paddingTop: 5}}>
                        <Text style={styles.productivity_label}>productivity</Text>
                        <Text style={styles.productivity_value}>{item.productivity}</Text>
                      </View>
                    </View>
                    <Icon name={this._getListIcon(item.publicKey)} size={30} style={{marginLeft: 'auto'}}/>
                  </View>
                }
                containerStyle = {{borderBottomWidth:1,...this._getListColor(item.publicKey)}}
                onPress = {() => this.onPress_ListItem(item.publicKey)}
              />
            )}
          />
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
  sumcount: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    textAlign: 'right',
    marginRight: 10,
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10
  },
  addcount: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    textAlign: 'right',
    marginRight: 10,
    padding: 5,
    backgroundColor: 'rgba(0,255,0,0.3)',
    borderRadius: 10
  },
  removecount: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    textAlign: 'right',
    marginRight: 10,
    padding: 5,
    backgroundColor: 'rgba(255,0,0,0.3)',
    borderRadius: 10
  },
  rank: {
    color: '#000',
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 100,
    fontSize: 30,
    fontFamily: 'Gilroy-ExtraBold'
  },
  username: {
    color: '#000',
    paddingLeft: 5,
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold'
  },
  productivity_label: {
    color: '#000',
    paddingLeft: 5,
    fontWeight: 'bold',
  },
  productivity_value: {
    color: '#000',
    paddingLeft: 5,
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