import React from 'react';
import { Platform, StatusBar, StyleSheet, Image, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Header, Text  } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';

import ErrorModal from '../parts/ErrorModal';

const VERSION = '1.0.0';

export default class Contact extends React.Component {
  constructor(props) {
    super(props);
  }

  _link = (url) => {
    try {
      Linking.openURL(url)
      .catch((err) => {
        this.refs.error_modal.open(I18n.t('MoveURL.ErrMsg1'));
      })
    } catch (err) {
      this.refs.error_modal.open(I18n.t('MoveURL.ErrMsg1'));
    }
  }

  render() {
    return (
      <View style={{flex:1}}>
        <Header
          leftComponent={{ icon: 'close', color: '#000', size: 30, onPress: () => this.props.navigation.navigate("Home") }}
          centerComponent={<Text style={styles.header_title}>Contact</Text>}
          containerStyle={styles.header}
        />
        <ScrollView style={{flex: 1, padding: 10, paddingTop: 20, backgroundColor: '#c4d8ee'}}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Image source={require("../img/logo.png")} style={{width: 100, height: 100}}/>
          </View>
          <Text style={[styles.dev, {marginTop: 15}]}>Lisk Vote ver. {VERSION}</Text>
          
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.text}>mail: lisknonanika@gmail.com</Text>
          <TouchableOpacity style={styles.text} onPress={() => this._link("https://github.com/lisknonanika")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={styles.link}>github: lisknonanika</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Co-developer</Text>
          <TouchableOpacity style={styles.text} onPress={() => this._link("https://twitter.com/ys_mdmg")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={styles.link}>Twitter: @ys_mdmg</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Special Thanks</Text>
          <TouchableOpacity style={[styles.text, {borderBottomWidth: 0}]} onPress={() => this._link("https://www.liskjapan.org/")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={styles.link}>Lisk Japan</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.text}>Lisk情報システム部</Text>

          <Text style={styles.label}>Donate</Text>
          <TouchableOpacity style={styles.text} onPress={() => this._link("https://explorer.lisk.io/address/5380827711560203827L")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={[styles.link, {borderTopWidth: 0}]}>5380827711560203827L</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.dev, {marginTop: 15}]}>* This application uses Lisk Elements.</Text>
          <TouchableOpacity style={[styles.dev, {alignItems: 'center', marginBottom: 100}]} onPress={() => this._link("https://lisk.io")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={styles.link}>What is Lisk?</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
        <SafeAreaView style={{backgroundColor: '#c4d8ee'}}/>

        <ErrorModal ref={"error_modal"}/>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-around',
    paddingBottom: 10,
    backgroundColor: '#c4d8ee',
    marginTop: Platform.OS === "android"? ((StatusBar.currentHeight || 0) * -1) + 10: 0,
    borderBottomWidth: 0
  },
  header_title: {
    color: '#000',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 25,
    fontFamily: 'Gilroy-ExtraBold',
  },
  dev: {
    textAlign: 'center',
    color: '#000',
    padding: 3,
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
  },
  label: {
    textAlign: 'center',
    backgroundColor: "rgba(0,0,0,0.1)",
    color: '#000',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#999"
  },
  text: {
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.15)",
    color: '#000',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
    padding: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#999"
  },
  link_icon: {
    color: '#999',
    marginRight: 10,
    marginLeft: -10,
    fontSize: 20,
  },
  link: {
    color: '#00f',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
  },
});