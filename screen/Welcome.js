import React from 'react';
import { StyleSheet, View} from 'react-native';
import { Button, Text } from 'react-native-elements';
import Swiper from 'react-native-swiper';

export default class Welcome extends React.Component {
  constructor(props) {
    super(props);
  }

  onPress_Button = () => {
    this.props.navigation.navigate('Home');
  }

  render() {
    return (
      <View style={styles.container}>
            
        <Swiper loop={false}
                showsButtons={true}
                activeDotColor="rgba(255,255,255,0.75)" dotColor="rgba(100,100,100,0.75)"
                nextButton={<Text style={styles.swipe_button}>›</Text>}
                prevButton={<Text style={styles.swipe_button}>‹</Text>}>

          <View style={styles.page}>
            <Text style={styles.text}>Lisk Vote App</Text>
            <Text style={styles.text_small}>Welcome1</Text>
          </View>
          <View style={styles.page}>
            <Text style={styles.text}>Welcome2</Text>
          </View>
          <View style={styles.page}>
            <Text style={styles.text}>Welcome3</Text>
          </View>
          <View style={styles.page}>
            <Text style={styles.text}>Welcome4</Text>
          </View>
          <View style={styles.page}>
            <Text style={styles.text}>Welcome5</Text>
            <Button title={"開始する"} buttonStyle={styles.button} onPress={this.onPress_Button} />
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
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bfbfbf',
  },
  text: {
    color: '#000',
    fontSize: 30,
    fontFamily: 'Gilroy-ExtraBold'
  },
  text_small: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Open Sans'
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
    width: '100%',
    borderRadius: 10
  },
})