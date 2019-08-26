import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Header, Button, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modalbox';
import Spinner from 'react-native-loading-spinner-overlay';
import VoteAPIClient from '../VoteAPIClient';

export default class Delegates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, isReady: false, currentPage: 0, selected: new Map()};
    this.errorMessage = "";
    this.isTestnet = false;
    this.user_data = {};
    this.delegatesList = [];
    this.delegatesGroup = [];
    this.currentVotes = new Map();
    this.addVotes = new Map();
    this.removeVotes = new Map();
    this.viewDelegatesList = new Map();
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
    this._setDelegatesGroup();
    if (this.user_data.address.length > 1) this._setVotes();
    this._setViewDelegatesList("", "");
    this.setState({isLoading: false, isReady: true});
  }

  onPress_ListItem = (key) => {
    if (this.user_data.address.length === 0) return;

    if (this.removeVotes.has(key)) this.removeVotes.delete(key);
    else if (this.addVotes.has(key)) this.addVotes.delete(key);
    else if (this.currentVotes.has(key)) this.removeVotes.set(key, true);
    else this.addVotes.set(key, true);

    this.setState((state) => {
      const selected = new Map(state.selected);
      this.state.selected.has(key)? selected.delete(key): selected.set(key, true);
      return {selected}
    })
  }

  onPress_MoveButton = (type) => {
    if (type === 0) {
      this.setState({currentPage: 0});
    } else if (type === 1) {
      this.setState({currentPage: this.state.currentPage-1 < 0? 0: this.state.currentPage-1});
    } else if (type === 2) {
      this.setState({currentPage: this.state.currentPage+1 > this.viewDelegatesList.size-1? this.state.currentPage: this.state.currentPage+1});
    } else {
      this.setState({currentPage: this.viewDelegatesList.size-1});
    }
  }

  _getNaviBackgroundColor = () => {
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
    this.user_data.votes.forEach((item) => {
      this.currentVotes.set(item.publicKey, true);
    });
    this.state.selected = new Map(this.currentVotes);
  }

  _setViewDelegatesList = (name, group) => {
    this.viewDelegatesList.clear();

    let page = 0;
    let cnt = 0;
    this.delegatesList.forEach((delegate) => {
      page = Math.floor(cnt / 20);
      if (!this.viewDelegatesList.has(page)) this.viewDelegatesList.set(page, []);
      this.viewDelegatesList.get(page).push(delegate);
      cnt += 1;
    });
  }

  renderItem = ({ item }) => {
    return (
      <ListItem
        title={
          <View style={{flexDirection:'row', alignItems: 'center'}}>
            <Text style={{...styles.rank, backgroundColor: this.currentVotes.has(item.publicKey)? "#99fcba" : "#ddd"}}>{item.rank}</Text>
            <View style={{flexDirection:'column', marginLeft:15, width:'65%'}}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={{flexDirection:'row', paddingTop: 5}}>
                <Text style={styles.productivity}>productivity: {item.productivity} %</Text>
              </View>
            </View>
          </View>
        }
        containerStyle={{
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          backgroundColor: this.addVotes.has(item.publicKey)? "rgba(0,200,0,0.15)": this.removeVotes.has(item.publicKey)? "rgba(255,0,0,0.15)": "#fff" }}
        checkBox={
          {
            onPress: () => this.onPress_ListItem(item.publicKey),
            checked: !!this.state.selected.get(item.publicKey),
            checkedIcon: "minus-circle",
            checkedColor: "#cc0000",
            uncheckedIcon: "plus-circle",
            uncheckedColor: "#00cc00",
            size: 50
          }
        }
      />
    );
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
            ...this._getNaviBackgroundColor(),
          }}
        />
        <View style={{flex: 1}}>
          <View style={{flexDirection:'row', justifyContent: 'flex-end', marginTop: 10}}>
            <Text style={styles.sumcount}>voted: {this.currentVotes.size + this.addVotes.size - this.removeVotes.size}</Text>
            <Text style={styles.addcount}>+ {this.addVotes.size}</Text>
            <Text style={styles.removecount}>- {this.removeVotes.size}</Text>
          </View>
          <FlatList
            style={{marginTop: 10}}
            data={this.viewDelegatesList.get(this.state.currentPage)}
            keyExtractor={(item) => item.publicKey}
            renderItem={this.renderItem}
            initialNumToRender={30}
          />
        </View>

        <View style={{flexDirection:'row', justifyContent: 'space-between', marginTop: 10}}>
          <TouchableOpacity style={{...styles.naviButton, borderLeftWidth:0}} onPress={() => this.onPress_MoveButton(0)} >
            <Icon name="angle-double-left" size={30} style={{color: "#fff"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.naviButton} onPress={() => this.onPress_MoveButton(1)} >
            <Icon name="angle-left" size={30} style={{color: "#fff"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.naviButton} onPress={() => this.onPress_MoveButton(2)} >
            <Icon name="angle-right" size={30} style={{color: "#fff"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={{...styles.naviButton, borderRightWidth:0}} onPress={() => this.onPress_MoveButton(3)} >
            <Icon name="angle-double-right" size={30} style={{color: "#fff"}}/>
          </TouchableOpacity>
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
  sumcount: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    textAlign: 'right',
    marginRight: 10,
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10
  },
  addcount: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    textAlign: 'right',
    marginRight: 10,
    padding: 5,
    backgroundColor: 'rgba(0,255,0,0.25)',
    borderRadius: 10
  },
  removecount: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    textAlign: 'right',
    marginRight: 10,
    padding: 5,
    backgroundColor: 'rgba(255,0,0,0.25)',
    borderRadius: 10
  },
  rank: {
    color: '#000',
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 100,
    fontSize: 30,
    fontFamily: 'Gilroy-ExtraBold',
    borderRadius: 50
  },
  username: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold'
  },
  productivity: {
    marginTop: 5,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#ddd',
    borderRadius: 5,
    padding: 5
  },
  naviButton: {
    flex:1,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: this.isTestnet? '#003e1a': '#001a3e',
    borderLeftWidth:1,
    borderRightWidth:1,
    borderColor: "rgba(255,255,255,0.5)"
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