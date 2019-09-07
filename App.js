import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation'
import I18n from 'react-native-i18n';
import langs from './I18n/Language';

import Home from './screen/Home';
import Delegates from './screen/Delegates';
import DelegateDetail from './screen/DelegateDetail';
import Confirm from './screen/Confirm';
import Result from './screen/Result';

const StackNavi = createStackNavigator(
  {
    Delegates: { screen: Delegates },
    Confirm: { screen: Confirm },
    Result: { screen: Result },
  },
  {initialRouteName: 'Delegates', mode: 'card', headerMode: 'none'}
);

const ModalNavi = createStackNavigator(
  { 
    Home: { screen: Home },
    DelegateDetail: { screen: DelegateDetail },
    StackNavi: { screen: StackNavi },
  },
  {initialRouteName: 'Home', mode: 'modal', headerMode: 'none'}
);
const AppContainer = createAppContainer(ModalNavi);

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    I18n.fallbacks = true;
    I18n.translations = langs;
  }

  render() {
    return (
      <AppContainer ref={nav => this.navigator = nav} />
    );
  }
};