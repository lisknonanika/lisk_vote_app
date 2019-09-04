import React from 'react';
import { Platform, StatusBar, StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Header, Button, Input, Text, ListItem } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation';
import Drawer from 'react-native-drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-gesture-handler';
import { APIClient } from '@liskhq/lisk-api-client';
import VoteAPIClient from '../VoteAPIClient';
import BigNumber from 'bignumber.js';
import I18n from 'react-native-i18n';

import Loading from '../parts/Loading';
import MainButton from '../parts/MainButton';
import ErrorModal from '../parts/ErrorModal';

const LIST_ITEM_HEIGHT = 100;
const DELEGATES_NUM = 101;
const MAX_VOTE_COUNT = 101;

export default class Delegates extends React.Component {
  constructor(props) {
    super(props);
    this._clearProp();
  }

  async componentDidMount() {
    this.setState({isLoading: true});
    await this._setDelegates();
    this.setState({isLoading: false, isReady: true, search_group: ""});
  }

  onChangeText_Search = (value) => {
    this.setState({search_text: value});
    this._setViewDelegatesList(value, this.state.search_group);
    if (this.viewDelegatesList.get(0) !== undefined) this.setState({currentPage: 0, rerenderList: this.state.rerenderList + 1});
  }

  onPress_ListItem = (key, item) => {
    if (this.isRefMode) return;

    if (this.removeVotes.has(key)) this.removeVotes.delete(key);
    else if (this.addVotes.has(key)) this.addVotes.delete(key);
    else if (this.currentVotes.has(key)) this.removeVotes.set(key, item);
    else this.addVotes.set(key, item);

    this.setState((state) => {
      const selected = new Map(state.selected);
      this.state.selected.has(key)? selected.delete(key): selected.set(key, true);
      return {selected}
    })
    this.setState({rerenderList: this.state.rerenderList + 1});
  }

  onPress_MoveButton = (type) => {
    if ((type === 0 || type === 1) && this.state.currentPage === 0) return;
    if ((type === 2 || type === 3) && this.state.currentPage === this.viewDelegatesList.size - 1) return;

    if (type === 0) this.setState({currentPage: 0});
    else if (type === 1) this.setState({currentPage: this.state.currentPage - 1});
    else if (type === 2) this.setState({currentPage: this.state.currentPage + 1});
    else if (type === 3) this.setState({currentPage: this.viewDelegatesList.size - 1});
    this.setState({rerenderList: this.state.rerenderList + 1});
  }

  onPress_Confirm = () => {
    this.setState({isLoading: true});
    if (this.currentVotes.size + this.addVotes.size - this.removeVotes.size > MAX_VOTE_COUNT) {
      this.refs.error_modal.open(`${I18n.t('Delegates.ErrMsg1')}(${MAX_VOTE_COUNT})`);
      this.setState({isLoading: false});
      return;
    }

    if (this.addVotes.size === 0 && this.removeVotes.size === 0) {
      this.refs.error_modal.open(I18n.t('Delegates.ErrMsg2'));
      this.setState({isLoading: false});
      return;
    }
    
    this.props.navigation.navigate('Confirm', {
      user: this.user_data,
      add: this.addVotes,
      remove: this.removeVotes,
      isTestnet: this.isTestnet,
      updateUserData: this._updateUserData
    });
    this.setState({isLoading: false});
  }

  onPress_SelectGroup = (group) => {
    this._drawer.close();
    if (this.state.search_group === group) {
      this.setState({search_group: ""});
      this._setViewDelegatesList(this.state.search_text, "");
    } else {
      this.setState({search_group: group});
      this._setViewDelegatesList(this.state.search_text, group);
    }
    if (this.viewDelegatesList.get(0) !== undefined) this.setState({currentPage: 0, rerenderList: this.state.rerenderList + 1});
  }

  _clearProp = () => {
    this.state = {isLoading: false, isReady: false, rerenderList: 0, search_text: "", search_group: "init", currentPage: 0, selected: new Map()};
    this.isRefMode = this.props.navigation.state.params.user.address.length === 0;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.user_data = this.props.navigation.state.params.user;
    this.delegate_data = {};
    this.delegatesList = [];
    this.delegatesGroup = [];
    this.delegatesGroupURL = new Map();
    this.currentVotes = new Map();
    this.addVotes = new Map();
    this.removeVotes = new Map();
    this.viewDelegatesList = new Map();
  }

  _updateUserData = async() => {
    this._clearProp();
    this.setState({isLoading: true})
    const ret = await this._getUserData();
    this._setUserData(ret);
    await this._setDelegates();
    this.setState({isLoading: false, isReady: true, search_group: "", currentPage: 0, rerenderList: this.state.rerenderList + 1});
    this.props.navigation.navigate('Delegates', {isTestnet: this.isTestnet, user: this.user_data});
  }
  
  _getUserData = async() => {
    try {
      if (this.isTestnet) return await VoteAPIClient.getAccountByAddress(this.user_data.address);
      const client = APIClient.createMainnetAPIClient();
      const result = await client.votes.get({address: this.user_data.address, offset: 0, limit: 101});
      if (!result || !result.data) return {result: false};
      return {result: true, data: result.data};

    } catch (err) {
      return {result: false};
    }
  }

  _setUserData = (userData) => {
    this.user_data.balance = '0';
    this.user_data.votes.length = 0;
    if (userData.result) {
      this.user_data.balance = new BigNumber(userData.data.balance).dividedBy(new BigNumber('100000000')).toFixed();
      this.user_data.votes = userData.data.votes;
    }
  }

  _setDelegates = async() => {
    const ret = await this._getDelegatesList();
    if (!ret.result) {
      this.refs.error_modal.open(I18n.t('Delegates.ErrMsg3'), () => this.props.navigation.navigate("Home"));
      this.setState({isLoading: false});
      return;
    }
    this.delegatesList = ret.data;
    this._setDelegatesGroup();
    this._setDelegatesGroupURL(ret.groupUrl);
    if (!this.isRefMode) this._setVotes();
    this._setViewDelegatesList("", "");
  }

  _getNaviBackgroundColor = () => {
    return this.isTestnet? {backgroundColor: '#003e1a'}: {backgroundColor: '#001a3e'};
  }

  _getDelegatesList = async() => {
    try {
      this.delegatesList.length = 0;
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

  _setDelegatesGroupURL = (groupUrls) => {
    this.delegatesGroupURL.clear();
    groupUrls.forEach((info) => {
      if (!this.delegatesGroupURL.has(info.group)) {
        this.delegatesGroupURL.set(info.group, info.url);
      }
    });
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

    if (group === "Current" || group === "Add" || group === "Remove") {
      let targetList;
      if (group === "Add") targetList = this.addVotes
      else if (group == "Remove") targetList = this.removeVotes;
      else targetList = this.currentVotes;
      this.delegatesList.forEach((delegate) => {
        if (targetList.has(delegate.publicKey)) {
          page = Math.floor(cnt / DELEGATES_NUM);
          if (!this.viewDelegatesList.has(page)) this.viewDelegatesList.set(page, []);
          this.viewDelegatesList.get(page).push(delegate);
          cnt += 1;
        }
      });
      return;
    }

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

  renderHeader = () => {
    return (
      <Header
        barStyle="light-content"
        leftComponent={{ icon: 'menu', color: '#fff', size: 30, onPress: () => this._drawer.open() }}
        centerComponent={
          <Input
            placeholder="Name"
            value={this.state.search_text}
            autoCapitalize={"none"}
            leftIcon={<Icon name="search" size={20}/>}
            rightIcon={<MIcon name="clear" size={20} style={{color: "#999", marginRight: 15}} onPress={() => this.onChangeText_Search("")}/>}
            containerStyle={styles.input_item}
            inputContainerStyle={{backgroundColor: "rgba(255,255,255,0.85)", padding:0, borderRadius: 30, borderBottomWidth: 0}} 
            inputStyle={{color:'#000', padding:0, marginLeft: 10}}
            onChangeText={this.onChangeText_Search} />
        }
        rightComponent={{icon: 'home', color: '#fff', size: 30, onPress: () => this.props.navigation.navigate("Home")}}
        containerStyle={[this._getNaviBackgroundColor(), styles.header]}
      />
    );
  }

  renderListMoveButton = () => {
    return (
      <View>
        <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
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
        <View style={styles.disp_num_field}>
          <Text style={styles.disp_num}>Disp: {this._getDispLength()} ({this._getMaxCount()})</Text>
        </View>
      </View>
    )
  }

  renderList = () => {
    return (
      <View style={{flex: 1}}>
        <FlatList
          data={this.viewDelegatesList.get(this.state.currentPage)}
          extraData={this.state.rerenderList}
          keyExtractor={(item) => item.publicKey}
          renderItem={this.renderItem}
          getItemLayout={(data, index) => ({
            length: LIST_ITEM_HEIGHT, offset: LIST_ITEM_HEIGHT * index, index
          })}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </View>
    );
  }

  renderItem = ({ item }) => {
    return (
      <ListItem
        title={
          <View style={{flexDirection:'row', alignItems: 'center'}}>
            <Text style={[styles.rank, {backgroundColor: this.currentVotes.has(item.publicKey)? "#95ecba" : "#ccc"}]}>{item.rank}</Text>
            <View style={{flexDirection:'column', marginLeft:20, width: this.isRefMode? '100%': '65%'}}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={{flexDirection:'row', paddingTop: 5}}>
                <Text style={[styles.userdata, {marginRight: 15, display: Platform.isPad?"flex":"none"}]}>produced Blocks: {item.producedBlocks}</Text>
                <Text style={[styles.userdata, {marginRight: 15, display: Platform.isPad?"flex":"none"}]}>missed Blocks: {item.missedBlocks}</Text>
                <Text style={styles.userdata}>productivity: {item.productivity} %</Text>
              </View>
            </View>
          </View>
        }
        containerStyle={{
          height: LIST_ITEM_HEIGHT,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          backgroundColor: "#fff"
        }}
        checkBox={
          {
            onPress: () => this.onPress_ListItem(item.publicKey, item),
            containerStyle: {display: this.isRefMode? "none": "flex"},
            checked: !!this.state.selected.get(item.publicKey),
            checkedIcon: "check-circle",
            checkedColor: "rgba(45,140,115,1)",
            uncheckedIcon: "check-circle",
            uncheckedColor: "#ccc",
            size: 50
          }
        }
        onLongPress={() => this.props.navigation.navigate('DelegateDetail', {
          delegate: item, groupUrl: this.delegatesGroupURL, isTestnet: this.isTestnet, isRefMode: this.isRefMode})}
      />
    );
  }

  renderConfirmButton = () => {
    if (this.isRefMode) return (<View/>);
    return (
      <View>
        <View style={styles.count_field}>
          <Text style={[styles.sum_count, {marginRight:10}]}>vote: {this.currentVotes.size + this.addVotes.size - this.removeVotes.size} / {MAX_VOTE_COUNT}</Text>
          <Text style={[styles.add_count, {marginRight:10}]}> add: {this.addVotes.size}</Text>
          <Text style={[styles.remove_count]}> remove: {this.removeVotes.size}</Text>
        </View>
        <MainButton params={{title:I18n.t('Delegates.Button1'), style:styles.vote_button, event:this.onPress_Confirm}}/>
      </View>
    )
  }

  renderDrawerButton = (group) => {
    return (
      <Button
        icon={
          <Icon
            name={this.state.search_group===group? "check-circle": "circle"}
            color={this.state.search_group===group? "rgba(45,140,115,1)": "#ccc"}
            size={20}
          />
        }
        title={group}
        buttonStyle={styles.drawer_button}
        titleStyle={styles.drawer_text}
        onPress={() => this.onPress_SelectGroup(group)}
      />
    )
  }

  renderDrawer = () => {
    return (
      <View style={{flex:1}}>
        <SafeAreaView style={this._getNaviBackgroundColor()}/>
        <View style={{flex:1, margin:10}}>
          <Button
            icon={<Icon name="times" size={20} color="white" />}
            title="Close"
            buttonStyle={{backgroundColor: "#333"}}
            onPress={() => this._drawer.close()}
          />
          <ScrollView>
            <Text style={[styles.drawer_user_info, {marginTop:20}]}>Address:</Text>
            <Text style={[styles.drawer_user_info]}>&nbsp;&nbsp;{this.user_data.address}</Text>
            <Text style={[styles.drawer_user_info, {marginTop:10}]}>Balance:</Text>
            <Text style={[styles.drawer_user_info]}>&nbsp;&nbsp;{this.user_data.balance} LSK</Text>

            <View style={{display: this.isRefMode? "none": "flex"}}>
              <Text style={styles.drawer_label}>Status</Text>
              {this.renderDrawerButton("Current")}
              {this.renderDrawerButton("Add")}
              {this.renderDrawerButton("Remove")}
              <Text style={{marginTop:5, color: "#fff"}}>{I18n.t('Delegates.Msg1')}</Text>
            </View>
            
            <Text style={styles.drawer_label}>Group</Text>
            <FlatList
              data={this.delegatesGroup}
              extraData={this.state.search_group}
              keyExtractor={(item) => item}
              renderItem={({item}) => 
                this.renderDrawerButton(item)
              }
            />
            <Button
              title="Clear"
              buttonStyle={{backgroundColor: "#999", marginTop: 20}}
              onPress={() => this.onPress_SelectGroup("")}
            />
          </ScrollView>
        </View>
        <SafeAreaView style={{display: this.isRefMode? "none": "flex"}}/>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Loading params={{isLoading: this.state.isLoading, text: "Now Loading.."}}/>

        <Drawer
          ref={(ref) => this._drawer = ref}
          type="overlay"
          content={this.renderDrawer()}
          tapToClose={true}
          openDrawerOffset={0.2}
          closedDrawerOffset={-5}
          styles={drawerStyles}>
          
          {this.renderHeader()}
          {this.renderListMoveButton()}
          {this.renderList()}
          {this.renderConfirmButton()}
          <SafeAreaView style={{display: this.isRefMode? "none": "flex"}}/>
          <ErrorModal ref={"error_modal"}/>

        </Drawer>
      </View>
    );
  }
}

const drawerStyles = {
  drawer: {backgroundColor: 'rgba(0,0,0,0.85)'},
  main: {paddingLeft: 3},
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'space-around',
    paddingBottom: 10,
    marginTop: Platform.OS === "android"? ((StatusBar.currentHeight || 0) * -1) + 10: 0
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input_item: {
    backgroundColor: "transparent",
    padding: 0,
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
    margin: 10,
    marginTop: 0,
  },
  count_field: {
    flexDirection:"row",
    justifyContent: 'flex-end',
    alignItems: 'center',
    margin:10
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
  userdata: {
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
  drawer_user_info: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Gilroy-ExtraBold'
  },
  drawer_label: {
    color: '#000',
    backgroundColor: "#ccc",
    fontSize: 20,
    fontFamily: 'Gilroy-ExtraBold',
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#999"
  },
  drawer_button: {
    justifyContent: 'flex-start',
    backgroundColor: "#eee",
    padding: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#999"
  },
  drawer_text: {
    color: '#000',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
    marginLeft: 10
  }
})