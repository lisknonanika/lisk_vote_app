import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation'

import Welcome from './screen/Welcome';
import Home from './screen/Home';
import Delegates from './screen/Delegates';

const Stack = createStackNavigator(
  {
    Welcome: { screen: Welcome },
    Home: { screen: Home },
    Delegates: { screen: Delegates },
  },
  {initialRouteName: 'Home', mode: 'card', headerMode: 'none'}
);
const AppContainer = createAppContainer(Stack);

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