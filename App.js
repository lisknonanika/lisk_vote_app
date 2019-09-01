import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation'
import I18n from 'react-native-i18n';
import langs from './I18n/Language';

import Welcome from './screen/Welcome';
import Home from './screen/Home';
import Delegates from './screen/Delegates';
import DelegateDetail from './screen/DelegateDetail';
import Confirm from './screen/Confirm';
import Result from './screen/Result';

const ModalNavi = createStackNavigator(
  { 
    Delegates: { screen: Delegates },
    DelegateDetail: { screen: DelegateDetail },
    Result: { screen: Result },
  },
  {initialRouteName: 'Delegates', mode: 'modal', headerMode: 'none'}
);

const StackNavi = createStackNavigator(
  {
    Welcome: { screen: Welcome },
    Home: { screen: Home },
    Confirm: { screen: Confirm },
    ModalNavi: { screen: ModalNavi },
  },
  {initialRouteName: 'Welcome', mode: 'card', headerMode: 'none'}
);
const AppContainer = createAppContainer(StackNavi);

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