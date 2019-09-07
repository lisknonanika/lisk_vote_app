import React from 'react';
import { Platform, AsyncStorage, StatusBar, StyleSheet, View} from 'react-native';
import { Header, Button, Text } from 'react-native-elements';
import SplashScreen from 'react-native-splash-screen';
import Swiper from 'react-native-swiper';
import I18n from 'react-native-i18n';

export default class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isInitialize: false}
  }

  async componentDidMount() {
    const isInitializedString = await AsyncStorage.getItem('isInitialized');
    SplashScreen.hide();
    if (isInitializedString === 'true') {
      this.props.navigation.navigate('Home');
    }
    this.setState({isInitialize: true});
  }

  onPress_Button = async() => {
    await AsyncStorage.setItem('isInitialized', 'true');
    this.props.navigation.navigate('Home');
  }

  render() {
    if (!this.state.isInitialize) {
      return (
        <View style={[styles.container, {backgroundColor: '#2475b9'}]} />
      )
    }
    return (
      <View style={styles.container}>

        <Header
          rightComponent={<Text style={styles.header_skip} onPress={() => this.onPress_Button()}>SKIP</Text>}
          centerComponent={<Text style={styles.header_title}>Tutorial</Text>}
          containerStyle={[styles.header, {backgroundColor: "#ccc"}]}
        />
            
        <Swiper loop={false}
                showsButtons={true}
                activeDotColor="rgba(255,255,255,0.75)" dotColor="rgba(100,100,100,0.75)"
                nextButton={<Text style={styles.swipe_button}>›</Text>}
                prevButton={<Text style={styles.swipe_button}>‹</Text>}>

          <View style={styles.page}>
            <Text style={styles.title}>Home (1/3)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.Home1')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Home (2/3)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.Home2')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Home (3/3)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.Home3')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (1/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.DelegateList1')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (2/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.DelegateList2')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (3/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.DelegateList3')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (4/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.DelegateList4')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (5/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.DelegateList5')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (6/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.DelegateList6')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate Info (1/1)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.DelegateInfo1')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Confirm (1/2)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.Confirm1')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Confirm (2/2)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.Confirm2')}</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Result (1/1)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>{I18n.t('Welcome.Result1')}</Text>
          </View>

          <View style={[styles.page, {justifyContent: 'center'}]}>
            <Button title={I18n.t('Welcome.Button1')} buttonStyle={styles.button} onPress={this.onPress_Button} />
          </View>
          
        </Swiper>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    justifyContent: 'space-around',
    paddingBottom: 10,
    marginTop: Platform.OS === "android"? ((StatusBar.currentHeight || 0) * -1) + 10: 0
  },
  header_title: {
    color: '#000',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 25,
    fontFamily: 'Gilroy-ExtraBold',
  },
  header_skip: {
    color: '#666',
    fontSize: 18,
    fontFamily: 'Open Sans',
  },
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#bfbfbf',
  },
  title: {
    marginTop: 20,
    color: '#000',
    fontSize: 25,
    fontFamily: 'Gilroy-ExtraBold'
  },
  text: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#000',
    fontSize: 17,
  },
  swipe_button: {
    color: 'rgba(100,100,100,0.65)',
    fontSize: 50,
  },
  button: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(175,85,105,1)',
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.isPad? 450: 300,
    borderRadius: 10
  },
})