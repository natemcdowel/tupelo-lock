## Installation

- Install Openzwave from https://github.com/OpenZWave/open-zwave/archive/master.zip. Run `sudo make && sudo make install && sudo ldconfig` to compile.
- Uncomment the NetworkKey in the `options.xml` file of your openzwave installation.
- Run `npm install`

## Setting up a Zwave device

- Run `node`
- Run `.load /server/server.js`
- Wait until the Zwave device notifies it is ready
- Put your Zwave device into pairing mode
- Run `zwave.addDevice(true);`
- Your Zwave device should now be paired

## Server Configuration

- https://github.com/natemcdowel/tupelo-zwave/blob/master/server/config.json

## Running the server

- Run the Tupelo-Zwave server `node server/server.js`

## Running the host app (Raspberry Pi)

- Run `cd host-app`
- Run `npm install`
- Run `npm start` to start the Tupelo Pi executable, Node server and host app
- Go to `http://localhost:3000` to run the host app.
- Submitting an email will create a new ChainTree stored on Tupelo and the validKeys.json file
- An email containing a userId code will be sent to your guest.

## Running the guest app (React-Native Android or IOS)

- Run `cd guest-app`
- Run `npm install`
- Run `npm start` to start the app.
- Select Android or iPhone emulation mode
- Enter a valid userId code to gain access to the host's lock
- Click lock or unlock for access to the host's home
