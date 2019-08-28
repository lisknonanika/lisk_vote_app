import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Header, Button, SearchBar, Text, ListItem } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation';
import Drawer from 'react-native-drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modalbox';
import Spinner from 'react-native-loading-spinner-overlay';
import VoteAPIClient from '../VoteAPIClient';
import { ScrollView } from 'react-native-gesture-handler';

const DELEGATES_NUM = 50;

export default class Delegates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: false, isReady: false, rerenderList: 0, search_text: "", search_group: "", currentPage: 0, selected: new Map()};
    this.errorMessage = "";
    this.isRefMode = this.props.navigation.state.params.user.address.length === 0;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.user_data = this.props.navigation.state.params.user;
    this.delegate_data = {};
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
      this.refs.error_modal.open();
      this.setState({isLoading: false});
      return;
    }
    this.delegatesList = ret.data;
    this._setDelegatesGroup();
    if (!this.isRefMode) this._setVotes();
    this._setViewDelegatesList("", "");
    this.setState({isLoading: false, isReady: true});
  }

  onClosed_ErrorModal = () => {
    if (!this.state.isReady) this.props.navigation.navigate("Home");
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
    this.refs.error_modal.open();
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
    let targetList = [];
    targetList.length = 0;
    if (group === "Add") {
      for(delegate of this.addVotes.values()) {
        targetList.push(delegate);
      }
    } else if (group === "Remove") {
      for(delegate of this.removeVotes.values()) {
        targetList.push(delegate);
      }
    } else {
      targetList = this.delegatesList;
    }

    targetList.forEach((delegate) => {
      if (group === "Add" || group === "Remove" || 
          ((name.length === 0 || delegate.username.toLowerCase().indexOf(name.toLowerCase()) >= 0) &&
           (group.length === 0 || delegate.groups.indexOf(group) >= 0))) {
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

  renderErrorModal = () => {
    return (
      <Modal style={styles.modal} position={"center"} ref={"error_modal"} onClosed={() => this.onClosed_ErrorModal()}>
        <Icon name="times-circle" style={styles.modal_icon_error}/>
        <Text style={styles.modal_message}>{this.errorMessage}</Text>
        <Button title={"OK"} buttonStyle={styles.modal_ok_error} onPress={() => {this.refs.error_modal.close()}} />
      </Modal>
    );
  }

  renderInitialLoadong = () => {
    return (
      <View style={styles.container}>
        <Spinner
            visible={this.state.isLoading}
            textContent="Now Loading.."
            textStyle={{ color:"rgba(255,255,255,0.5)" }}
            overlayColor="rgba(0,0,0,0.5)" />
          {this.renderErrorModal()}
      </View>
    );
  }

  renderHeader = () => {
    return (
      <Header
        barStyle="light-content"
        leftComponent={{ icon: 'menu', color: '#fff', size: 30, onPress: () => this._drawer.open() }}
        centerComponent={
          <SearchBar
            placeholder="Name"
            value={this.state.search_text}
            autoCapitalize={"none"}
            containerStyle={styles.input_item}
            searchIcon={<Icon name="search" size={20}/>}
            inputContainerStyle={{backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 30, padding:0}} 
            inputStyle={{color:'#000', padding:0}}
            onChangeText={this.onChangeText_Search} />
        }
        rightComponent={{icon: 'home', color: '#fff', size: 30, onPress: () => this.props.navigation.navigate("Home")}}
        containerStyle={[this._getNaviBackgroundColor(), {justifyContent: 'space-around', paddingBottom: 10}]}
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
          initialNumToRender={DELEGATES_NUM}
        />
      </View>
    );
  }

  renderItem = ({ item }) => {
    return (
      <ListItem
        title={
          <View style={{flexDirection:'row', alignItems: 'center'}}>
            <Text style={{...styles.rank, backgroundColor: this.currentVotes.has(item.publicKey)? "#95ecba" : "#ccc"}}>{item.rank}</Text>
            <View style={{flexDirection:'column', marginLeft:20, width: this.isRefMode? '65%': '100%'}}>
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
          backgroundColor: this.addVotes.has(item.publicKey)? "rgba(0,255,0,0.15)":
                            this.removeVotes.has(item.publicKey)? "rgba(255,0,0,0.15)":
                            "#fff"
        }}
        checkBox={
          {
            onPress: () => this.onPress_ListItem(item.publicKey, item),
            containerStyle: {display: this.isRefMode? "none": "flex"},
            checked: !!this.state.selected.get(item.publicKey),
            checkedIcon: "minus-circle",
            checkedColor: "#cc0000",
            uncheckedIcon: "plus-circle",
            uncheckedColor: "#00cc00",
            size: 50
          }
        }
        onLongPress={() => this.props.navigation.navigate('DelegateDetail', {delegate: item, isTestnet: this.isTestnet})}
      />
    );
  }

  renderConfirmButton = () => {
    return (
      <View>
        <View style={[styles.count_field, {display: this.isRefMode? "none": "flex"}]}>
          <Text style={[styles.sum_count, {marginRight:10}]}>vote: {this.currentVotes.size + this.addVotes.size - this.removeVotes.size} / 101</Text>
          <Text style={[styles.add_count, {marginRight:10}]}> add: {this.addVotes.size}</Text>
          <Text style={[styles.remove_count]}> remove: {this.removeVotes.size}</Text>
        </View>
        <Button title={"この内容でVoteする"} buttonStyle={[styles.vote_button, {display: this.isRefMode? "none": "flex"}]} onPress={() => this.onPress_Confirm()} />
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
            <View style={{display: this.isRefMode? "none": "flex"}}>
              <Text style={styles.drawer_label}>Add / Remove</Text>
              {this.renderDrawerButton("Add")}
              {this.renderDrawerButton("Remove")}
              <Text style={{marginTop:5, color: "#fff"}}>※ユーザー名検索は無視されます。</Text>
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
          </ScrollView>
        </View>
        <SafeAreaView/>
      </View>
    );
  }

  render() {
    if (!this.state.isReady) return this.renderInitialLoadong();
    return (
      <View style={styles.container}>
        <Spinner
            visible={this.state.isLoading}
            textContent="Now Loading.."
            textStyle={{ color:"rgba(255,255,255,0.5)" }}
            overlayColor="rgba(0,0,0,0.5)" />

        <Drawer
          ref={(ref) => this._drawer = ref}
          type="overlay"
          content={this.renderDrawer()}
          tapToClose={true}
          openDrawerOffset={0.3}
          closedDrawerOffset={-5}
          styles={drawerStyles}>
          
          {this.renderHeader()}
          {this.renderListMoveButton()}
          {this.renderList()}
          {this.renderConfirmButton()}
          <SafeAreaView style={this._getNaviBackgroundColor()}/>
          {this.renderErrorModal()}

        </Drawer>
      </View>
    );
  }
}

const drawerStyles = {
  drawer: {backgroundColor: 'rgba(0,0,0,0.95)'},
  main: {paddingLeft: 3},
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
    padding: 10,
    backgroundColor: 'rgba(175,85,105,1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
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
  modal_message: {
    marginTop: 10,
    fontSize: 25,
    lineHeight:30
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