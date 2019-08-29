import React from 'react';
import { StatusBar, StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Header, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation'

export default class DelegateDetail extends React.Component {
  constructor(props) {
    super(props);
    this.delegate = this.props.navigation.state.params.delegate;
    this.isTestnet = this.props.navigation.state.params.isTestnet;
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
            renderItem={({item}) => <Text style={styles.text}>{item}</Text>}
          />
          <Text style={styles.label}>Produced Blocks</Text>
          <Text style={styles.text}>{this.delegate.producedBlocks}</Text>
          <Text style={styles.label}>Missed Blocks</Text>
          <Text style={styles.text}>{this.delegate.missedBlocks}</Text>
          <Text style={styles.label}>Productivity</Text>
          <Text style={styles.text}>{this.delegate.productivity} %</Text>
        </ScrollView>
        <SafeAreaView/>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-around',
    paddingBottom: 10,
    marginTop: ((StatusBar.currentHeight || 0) * -1) + 10
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
  }
});