import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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