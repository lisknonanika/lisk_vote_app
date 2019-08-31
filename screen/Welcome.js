import React from 'react';
import { Platform, StyleSheet, View} from 'react-native';
import { Header, Button, Text } from 'react-native-elements';
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
            <Text style={styles.text}>スワイプでメインネット/テストネットを切り替えることが出来ます。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Home (2/3)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>あなたのLiskアドレスでVoteを開始してください。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Home (3/3)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>Delegateのランキングの確認のみであればLiskアドレスは入力不要です。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (1/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>最大1時間前の情報を表示します。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (2/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>検索欄にデリゲート名を入力すると部分一致検索が出来ます。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (3/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>サブメニューではVote内容やデリゲートグループで絞り込みが出来ます。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (4/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>リストを長押しすることで、デリゲート情報を参照出来ます。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (5/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>＋ボタンで追加、−ボタンで解除が出来ます。(Homeでアドレス入力していない場合は表示しません)</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate List (6/6)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>Vote内容を反映するには確認ボタンを押してください。(Homeでアドレス入力していない場合は表示しません)</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Delegate Info (1/1)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>デリゲート情報の確認が出来ます。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Confirm (1/2)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>実行前に内容の確認をしてください。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Confirm (2/2)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>Vote内容の反映にはパスフレーズの入力が必要です。</Text>
          </View>

          <View style={styles.page}>
            <Text style={styles.title}>Result (1/1)</Text>
            <View style={{backgroundColor:'#333', height:400, width:280, margin:10}}></View>
            <Text style={styles.text}>処理結果の確認が出来ます。トランザクションIDからExplorerを開く事もできます。</Text>
          </View>

          <View style={[styles.page, {justifyContent: 'center'}]}>
            <Button title={"さあ、はじめましょう"} buttonStyle={styles.button} onPress={this.onPress_Button} />
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
    width: Platform.isPad? 450: 300,
    borderRadius: 10
  },
})