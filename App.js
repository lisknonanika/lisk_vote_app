import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation'

import Welcome from './screen/Welcome';
import Home from './screen/Home';
import Delegates from './screen/Delegates';
import DelegateDetail from './screen/DelegateDetail';

const ModalNavi = createStackNavigator(
  { 
    Delegates: { screen: Delegates },
    DelegateDetail: { screen: DelegateDetail },
  },
  {initialRouteName: 'Delegates', mode: 'modal', headerMode: 'none'}
);

const StackNavi = createStackNavigator(
  {
    Welcome: { screen: Welcome },
    Home: { screen: Home },
    ModalNavi: { screen: ModalNavi },
  },
  {initialRouteName: 'Home', mode: 'card', headerMode: 'none'}
);
const AppContainer = createAppContainer(StackNavi);

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <AppContainer ref={nav => this.navigator = nav} />
    );
  }
};