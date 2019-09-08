import React from 'react';
import { Platform, StatusBar, StyleSheet, Image, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Header, Text  } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';

import ErrorModal from '../parts/ErrorModal';

export default class Contact extends React.Component {
  constructor(props) {
    super(props);
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
          <Text style={[styles.dev, {marginTop: 15}]}>Lisk Vote ver. 1.0.0</Text>
          
          <Text style={styles.label}>Contact</Text>
          <TouchableOpacity style={styles.text} onPress={() => Linking.openURL("https://twitter.com/ys_mdmg")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={styles.link}>Twitter: @ys_mdmg</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.text} onPress={() => Linking.openURL("https://github.com/lisknonanika")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={styles.link}>github: lisknonanika</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Special Thanks</Text>
          <TouchableOpacity style={styles.text} onPress={() => Linking.openURL("https://www.liskjapan.org/")}>
            <View style={{flexDirection:"row"}}>
              <Icon name="link" style={styles.link_icon}/>
              <Text style={styles.link}>Lisk Japan</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
        <SafeAreaView/>

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
    marginLeft: -10,
    fontSize: 20,
  },
  link: {
    color: '#00f',
    fontSize: 17,
    fontFamily: 'Gilroy-ExtraBold',
  },
});