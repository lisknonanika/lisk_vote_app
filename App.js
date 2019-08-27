import React from 'react';
import { createStackNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation'

import Welcome from './screen/Welcome';
import Home from './screen/Home';
import Drawer from './screen/Drawer';
import Delegates from './screen/Delegates';

const DrawerNavi = createDrawerNavigator(
  {
    Delegates: { screen: Delegates },
    Drawer: { screen: Drawer },
  }
)

const StackNavi = createStackNavigator(
  {
    Welcome: { screen: Welcome },
    Home: { screen: Home },
    DrawerNavi: { screen: DrawerNavi },
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