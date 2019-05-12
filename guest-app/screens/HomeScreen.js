import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacity,
  TextInput
} from 'react-native';
import Endpoints from '../constants/Endpoints';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  errorTimeout = 7000;
  state = {
    locked: false,
    loading: true,
    error: false,
    access: false,
    codeText: ''
  };

  constructor(props) {
    super(props);
    this._fetchLockStatus();
  }

  render() {

    let mainContent = null;
    let codeInput = this._showCodeInput();
    let codeButton = this._showCodeButton();

    if (this.state.loading) {
      mainContent = this._showLoader();
    }

    if (this.state.access) {
      codeInput = this._showButton();
      codeButton = null;
      mainContent = null;
    }

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/robot-dev.png')
                  : require('../assets/images/robot-prod.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>Tupelo Lock Access</Text>
          </View>
          
          <View style={styles.mainContent}>
            {codeInput}
            {codeButton}
          </View>

          <View style={styles.mainContent}>
            {mainContent}
          </View>

          <View style={styles.errorContent}>
            <Text style={styles.errorContentText}>{this.state.error}</Text>
          </View>
        </ScrollView>

      </View>
    );
  }

  _showLoader = () => {
    return <ActivityIndicator size="large" color="#0000ff" />
  }

  _verifyAccess = () => {
    this.setState({ loading: true});
    fetch(Endpoints.tupelo + '/access?code=' + this.state.codeText)
      .then(res => res.json())
      .then(data => {

        if (data.authorized) {
          this.setState({ access: true });
          this.setState({ loading: false});
        } else {
          this.setState({ loading: false});
          this._setError('That guest code is not authorized')
        }

    });
  }

  _showCodeInput = () => {
    return <TextInput
      style={{height: 30, width: 200, borderColor: 'gray', borderWidth: 1}}
      onChangeText={(text) => this.setState({codeText: text})}
      value={this.state.codeText}
    />
  }

  _showCodeButton = () => {
    return <View style={styles.mainContent}>
    <TouchableOpacity onPress={this._verifyAccess} style={styles.mainContentLink}>
      <Text style={styles.mainContentLinkText}>Submit Guest Code</Text>
    </TouchableOpacity>
    </View>
  }

  _showButton = () => {
    return <View style={styles.mainContent}>
    <TouchableOpacity onPress={this._toggleLock} style={styles.mainContentLink}>
      <Text style={styles.mainContentLinkText}>{this.state.locked}</Text>
    </TouchableOpacity>
    </View>
  }

  _setError = (message) => {
    this.setState({ error: message});
    setTimeout(() => {
      this.setState({ error: false});
    }, this.errorTimeout);
  }

  _toggleLock = () => {
    this.setState({ loading: true});
    fetch(Endpoints.tupelo + '/stamp').then(data => {

      this._fetchLockStatus();

    }, () => {
      
      this._setError('There was an error communicating with your lock');

    });
  };

  _fetchLockStatus = () => {
    fetch(Endpoints.tupelo + '/status')
      .then(res => res.json())
      .then(res => {

        this.setState({ locked: res.locked ? 'Unlock' : 'Lock' });
        this.setState({ loading: false });

      }, () => {

        this._setError('There was an error communicating with your lock');

      });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  errorContent: {
    marginTop: 15,
    alignItems: 'center'
  },
  errorContentText: {
    color: 'red',
    fontSize: 14
  },
  mainContent: {
    marginTop: 15,
    alignItems: 'center',
  },
  mainContentLink: {
    paddingVertical: 15,
  },
  mainContentLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
