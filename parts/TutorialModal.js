import React from 'react';
import { Platform, Dimensions, AsyncStorage, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Button, Text } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import Modal from 'react-native-modalbox';
import I18n from 'react-native-i18n';

export default class TutorialModal extends React.Component {
  constructor(props) {
    super(props);
    this.isTablet = (Platform.isPad || Dimensions.get('window').width >= 750);
  }
  
  open = () => {
    this.refs.tutorial_modal.open();
  }

  onClosed_Modal = async() => {
    await AsyncStorage.setItem('isInitialized', 'true');
  }

  render() {
    return (
      <Modal style={styles.container} ref={"tutorial_modal"}
              swipeToClose={false} backdropPressToClose={false}
              onClosed={() => this.onClosed_Modal()}>

        <Swiper loop={false}
                showsButtons={true}
                activeDotColor="rgba(255,255,255,0.75)" dotColor="rgba(100,100,100,0.75)"
                nextButton={<Text style={styles.swipe_button}>›</Text>}
                prevButton={<Text style={styles.swipe_button}>‹</Text>}>

          <View style={styles.page}>
            <Text style={styles.title}>Home (1/2)</Text>
            <Image source={require("../img/phone/home1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/home1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.Home1')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Home (2/2)</Text>
            <Image source={require("../img/phone/home2.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/home2.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.Home2')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (1/6)</Text>
            <Image source={require("../img/phone/delegate1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/delegate1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.DelegateList1')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (2/6)</Text>
            <Image source={require("../img/phone/delegate2.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/delegate2.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.DelegateList2')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (3/6)</Text>
            <Image source={require("../img/phone/delegate3.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/delegate3.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.DelegateList3')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (4/6)</Text>
            <Image source={require("../img/phone/delegate4.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/delegate4.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.DelegateList4')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (5/6)</Text>
            <Image source={require("../img/phone/delegate5.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/delegate5.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.DelegateList5')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (6/6)</Text>
            <Image source={require("../img/phone/delegate6.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/delegate6.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.DelegateList6')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Confirm (1/1)</Text>
            <Image source={require("../img/phone/confirm1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/confirm1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.Confirm1')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Result (1/1)</Text>
            <Image source={require("../img/phone/result1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "none": "flex"}} resizeMode='contain'/>
            <Image source={require("../img/tablet/result1.png")} style={{flex: 3, marginTop: 20, display: this.isTablet? "flex": "none"}} resizeMode='contain'/>
            <Text style={styles.text}>{I18n.t('Tutorial.Result1')}</Text>
          </View>

          <View style={[styles.page, {justifyContent: 'center'}]}>
            <Button title={I18n.t('Tutorial.Button1')} buttonStyle={styles.button} onPress={() => this.refs.tutorial_modal.close()} />
          </View>
          
        </Swiper>

        <TouchableOpacity style={{position: 'absolute', bottom: 50, right: 20}} onPress={() => this.refs.tutorial_modal.close()}>
          <Text style={styles.link}>Skip Tutorial</Text>
        </TouchableOpacity>

      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#c4d8ee',
    paddingTop: 50
  },
  title: {
    color: '#000',
    fontSize: 25,
    fontFamily: 'Gilroy-ExtraBold'
  },
  text: {
    flex: 1,
    padding: 20,
    color: '#000',
    fontSize: 17,
  },
  link: {
    color: "#a56",
    fontFamily: "Open Sans",
    fontSize: 17,
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  },
  swipe_button: {
    color: 'rgba(100,100,100,0.65)',
    fontSize: 50,
  },
  button: {
    marginTop: -20,
    padding: 20,
    backgroundColor: 'rgba(175,85,105,1)',
    justifyContent: 'center',
    alignItems: 'center',
    width: (Platform.isPad || Dimensions.get('window').width >= 750)? 450: 300,
    borderRadius: 10
  },
})