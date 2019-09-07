import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Loading extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Spinner visible={this.props.params.isLoading}
               textContent={this.props.params.text}
               textStyle={{ color:"rgba(255,255,255,0.5)" }}
               overlayColor="rgba(0,0,0,0.5)" />
    );
  }
}
