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

## Running the server

- Run Tupelo `docker run -p 50051:50051 quorumcontrol/tupelo:v0.1.1 rpc-server -l 3`
- Run the Tupelo-zwave server `node server/server.js`
