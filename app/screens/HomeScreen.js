import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View
} from 'react-native';
import Endpoints from '../constants/Endpoints';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    locked: 'unlocked',
    loading: true
  };

  constructor(props) {
    super(props);
    this._fetchLockStatus();
  }

  render() {

    let mainContent = this._showButton();

    if (this.state.loading) {
      mainContent = this._showLoader();
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
            {mainContent}
          </View>
        </ScrollView>

      </View>
    );
  }

  _showLoader = () => {
    return <ActivityIndicator size="large" color="#0000ff" />
  }

  _showButton = () => {
    return <View style={styles.mainContent}>
      <TouchableOpacity onPress={this._toggleLock} style={styles.mainContentLink}>
        <Text style={styles.mainContentLinkText}>{this.state.locked}</Text>
      </TouchableOpacity>
    </View>
  }

  _toggleLock = () => {
    this.setState({ loading: true});
    fetch(Endpoints.tupelo + '/stamp').then(data => {
      this._fetchLockStatus();
    });
  };

  _fetchLockStatus = () => {
    fetch(Endpoints.tupelo + '/status')
      .then(res => res.json())
      .then(res => {
        this.setState({ locked: res.locked ? 'Unlock' : 'Lock' });
        this.setState({ loading: false});
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
