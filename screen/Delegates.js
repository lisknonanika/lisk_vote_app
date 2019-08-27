import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Header, Button, SearchBar, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modalbox';
import Spinner from 'react-native-loading-spinner-overlay';
import VoteAPIClient from '../VoteAPIClient';

const DELEGATES_NUM = 100;

export default class Delegates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, isReady: false, rerenderList: 0, search_text: "", currentPage: 0, selected: new Map()};
    this.errorMessage = "";
    this.isRefMode = this.props.navigation.state.params.user.address.length === 0;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.user_data = this.props.navigation.state.params.user;
    this.delegatesList = [];
    this.delegatesGroup = [];
    this.currentVotes = new Map();
    this.addVotes = new Map();
    this.removeVotes = new Map();
    this.viewDelegatesList = new Map();
  }

  async componentDidMount() {
    this.setState({isLoading: true});

    const ret = await this._getDelegatesList();
    if (!ret.result) {
      this.errorMessage = "Delegate情報の取得に失敗しました。";
      this.refs.ready_error_modal.open();
      this.setState({isLoading: false});
      return;
    }
    this.delegatesList = ret.data;
    this._setDelegatesGroup();
    if (!this.isRefMode) this._setVotes();
    this._setViewDelegatesList("", "");
    this.setState({isLoading: false, isReady: true});
  }

  onChangeText_Search = (value) => {
    this.setState({search_text: value});
    if (value.length > 0 && value.length < 3) return;
    this._setViewDelegatesList(value, "");
    if (this.viewDelegatesList.get(0) !== undefined) this.setState({currentPage: 0, rerenderList: this.state.rerenderList + 1});
  }

  onPress_ListItem = (key) => {
    if (this.isRefMode) return;

    if (this.removeVotes.has(key)) this.removeVotes.delete(key);
    else if (this.addVotes.has(key)) this.addVotes.delete(key);
    else if (this.currentVotes.has(key)) this.removeVotes.set(key, true);
    else this.addVotes.set(key, true);

    this.setState((state) => {
      const selected = new Map(state.selected);
      this.state.selected.has(key)? selected.delete(key): selected.set(key, true);
      return {selected}
    })
    this.setState({rerenderList: this.state.rerenderList + 1});
  }

  onPress_MoveButton = (type) => {
    if ((type === 0 || type === 1) && this.setState.current === 0) return;
    if ((type === 2 || type === 3) && this.state.currentPage === this.viewDelegatesList.size - 1) return;

    if (type === 0) this.setState({currentPage: 0});
    else if (type === 1) this.setState({currentPage: this.state.currentPage - 1});
    else if (type === 2) this.setState({currentPage: this.state.currentPage + 1});
    else if (type === 3) this.setState({currentPage: this.viewDelegatesList.size - 1});
    this.setState({rerenderList: this.state.rerenderList + 1});
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
      if ((name.length === 0 || delegate.username.toLowerCase().indexOf(name.toLowerCase()) >= 0) &&
          (group.length === 0 || delegate.groups.indexOf(group) >= 0)) {
        page = Math.floor(cnt / DELEGATES_NUM);
        if (!this.viewDelegatesList.has(page)) this.viewDelegatesList.set(page, []);
        this.viewDelegatesList.get(page).push(delegate);
        cnt += 1;
      }
    });
  }

  _getDispLength = () => {
    const current = this.viewDelegatesList.get(this.state.currentPage);
    if (current === undefined) return 'No Data';
    return `${this.state.currentPage * DELEGATES_NUM + 1} - ${this.state.currentPage * DELEGATES_NUM + current.length}`;
  }

  _getMaxCount = () => {
    if (this.viewDelegatesList.size === 0) return 0;
    return (this.viewDelegatesList.size - 1) * DELEGATES_NUM + this.viewDelegatesList.get(this.viewDelegatesList.size - 1).length
  }

  renderItem = ({ item }) => {
    return (
      <ListItem
        title={
          <View style={{flexDirection:'row', alignItems: 'center'}}>
            <Text style={{...styles.rank, backgroundColor: this.currentVotes.has(item.publicKey)? "#95ecba" : "#ccc"}}>{item.rank}</Text>
            <View style={{flexDirection:'column', marginLeft:20, width:'65%'}}>
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
          backgroundColor: this.addVotes.has(item.publicKey)? "rgba(0,255,0,0.15)": this.removeVotes.has(item.publicKey)? "rgba(255,0,0,0.15)": "#fff" }}
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
          centerComponent={{
            text: 'Delegates',
            style: { color: '#fff', fontFamily: 'Gilroy-ExtraBold', fontSize: 25 }
          }}
          rightComponent={{ icon: 'home', color: '#fff', size: 30, onPress: () => this.props.navigation.goBack() }}
          containerStyle={{justifyContent: 'space-around', ...this._getNaviBackgroundColor(),}}
        />
        <View style={{flex: 1}}>
          <SearchBar
            placeholder="Name (Min: 3 character)"
            value={this.state.search_text}
            autoCapitalize={"none"}
            containerStyle={styles.input_item}
            searchIcon={<Icon name="search" size={20}/>}
            inputContainerStyle={{backgroundColor:'#fff', padding:0}} 
            inputStyle={{backgroundColor:'transparent', color:'#000', padding:0}}
            onChangeText={this.onChangeText_Search} />
          <TouchableOpacity style={[styles.vote_button, {display: this.isRefMode? "none":"flex"}]}>
              <Text style={styles.vote_button_text}>この内容でVoteする</Text>
              <View style={styles.count_field}>
                <Text style={[styles.sum_count, {marginRight:10}]}>vote: {this.currentVotes.size + this.addVotes.size - this.removeVotes.size} / 101</Text>
                <Text style={[styles.add_count, {marginRight:10}]}> add: {this.addVotes.size}</Text>
                <Text style={[styles.remove_count]}> remove: {this.removeVotes.size}</Text>
              </View>
          </TouchableOpacity>
          <View style={styles.disp_num_field}>
            <Text style={styles.disp_num}>Disp: {this._getDispLength()} ({this._getMaxCount()})</Text>
          </View>
          <FlatList
            data={this.viewDelegatesList.get(this.state.currentPage)}
            extraData={this.state.rerenderList}
            keyExtractor={(item) => item.publicKey}
            renderItem={this.renderItem}
            initialNumToRender={DELEGATES_NUM}
          />
        </View>

        <View style={{flexDirection:'row', justifyContent: 'space-between', marginTop: 10}}>
          <TouchableOpacity style={[styles.navi_button, this._getNaviBackgroundColor(), {borderLeftWidth:0}]} onPress={() => this.onPress_MoveButton(0)} >
            <Icon name="angle-double-left" size={30} style={{color: "#fff"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navi_button, this._getNaviBackgroundColor()]} onPress={() => this.onPress_MoveButton(1)} >
            <Icon name="angle-left" size={30} style={{color: "#fff"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navi_button, this._getNaviBackgroundColor()]} onPress={() => this.onPress_MoveButton(2)} >
            <Icon name="angle-right" size={30} style={{color: "#fff"}}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navi_button, this._getNaviBackgroundColor(), {borderRightWidth:0}]} onPress={() => this.onPress_MoveButton(3)} >
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
  input_item: {
    backgroundColor: '#ccc',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    width: '100%'
  },
  disp_num_field: {
    flexDirection:'row',
    justifyContent: 'space-between',
    margin:10
  },
  disp_num: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'Gilroy-ExtraBold',
    textAlignVertical: "bottom",
  },
  vote_button: {
    justifyContent: 'center',
    alignItems: 'center',
    margin:10,
    marginBottom:0,
    padding: 5,
    backgroundColor: 'rgba(175,85,105,1)',
    borderRadius: 10
  },
  vote_button_text: {
    color: "#fff",
    fontSize: 16,
  },
  count_field: {
    flexDirection:"row",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"rgba(255,255,255,0.8)",
    padding:1,
    borderRadius:5,
    width: "100%",
    marginLeft:10,
    marginRight:10
  },
  kigo_count: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'Gilroy-ExtraBold'
  },
  add_count: {
    color: 'rgba(45,140,115,1)',
    fontSize: 15,
    fontFamily: 'Gilroy-ExtraBold'
  },
  remove_count: {
    color: 'rgba(165,20,20,1)',
    fontSize: 15,
    fontFamily: 'Gilroy-ExtraBold'
  },
  sum_count: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'Gilroy-ExtraBold',
  },
  rank: {
    color: '#000',
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 85,
    fontSize: 27,
    fontFamily: 'Gilroy-ExtraBold',
    borderRadius: 20,
    paddingTop: 5,
    paddingBottom: 5
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
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 5
  },
  navi_button: {
    flex:1,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
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