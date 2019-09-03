import React from 'react';
import { Platform, StatusBar, StyleSheet, Linking, View, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Header, Button, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class DelegateDetail extends React.Component {
  constructor(props) {
    super(props);
    this.errorMessage = "";
    this.delegate = this.props.navigation.state.params.delegate;
    this.groupUrl = this.props.navigation.state.params.groupUrl;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
    this.isRefMode = this.props.navigation.state.params.isRefMode;
  }

  _link = (url) => {
    this.errorMessage = "";
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        this.errorMessage = I18n.t('MoveURL.ErrMsg1');
        this.refs.error_modal.open();
      } else {
        return Linking.openURL(url);
      }
    }).catch((err) => {
      this.errorMessage = I18n.t('MoveURL.ErrMsg2');
      this.refs.error_modal.open();
    });
  }

  render_group = (group) => {
    if (this.groupUrl.has(group)) {
      return (
        <TouchableOpacity style={styles.link_row} onPress={() => this._link(this.groupUrl.get(group))}>
          <View style={{flexDirection:"row"}}>
            <Icon name="link" style={styles.link_icon}/>
            <Text style={styles.link}>{group}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <Text style={styles.text}>{group}</Text>
    ) ;
  }

  render() {
    return (
      <View style={{flex:1}}>
        <Header
          leftComponent={{ icon: 'close', color: '#fff', size: 30, onPress: () => this.props.navigation.navigate("Delegates") }}
          centerComponent={<Text style={styles.header_title}>Delegate Info</Text>}
          containerStyle={[styles.header, {backgroundColor: this.isTestnet?"#003e1a":"#001a3e"}]}
        />
        <ScrollView style={{margin: 10}}>
          <Text style={styles.label}>Delegate Name</Text>
          <Text style={styles.text}>{this.delegate.username}</Text>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.text}>{this.delegate.address}</Text>
          <Text style={styles.label}>Public Key</Text>
          <Text style={styles.text}>{this.delegate.publicKey}</Text>
          <Text style={[styles.label, {display: this.delegate.groups.length===0?"none":"flex"}]}>Group</Text>
          <FlatList
            data={this.delegate.groups}
            keyExtractor={(item) => item}
            renderItem={({item}) => this.render_group(item)}
          />
          <Text style={styles.label}>Produced Blocks</Text>
          <Text style={styles.text}>{this.delegate.producedBlocks}</Text>
          <Text style={styles.label}>Missed Blocks</Text>
          <Text style={styles.text}>{this.delegate.missedBlocks}</Text>
          <Text style={styles.label}>Productivity</Text>
          <Text style={styles.text}>{this.delegate.productivity} %</Text>
        </ScrollView>
        <SafeAreaView style={{display: this.isRefMode? "none": "flex"}}/>

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
  text: {
    color: '#000',
    backgroundColor: "#eee",
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
    padding: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#999"
  },
  link_row: {
    backgroundColor: "#eee",
    padding: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#999"
  },
  link_icon: {
    color: '#999',
    marginRight: 10,
    fontSize: 20,
  },
  link: {
    color: '#00f',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
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