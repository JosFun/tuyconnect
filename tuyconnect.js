const TuyApi = require ('tuyapi')

function sleep ( ms ) {
    return new Promise ( resolve => setTimeout( resolve, ms));
}
class TuyConnect {
    constructor ( deviceId, deviceKey ) {
        this.deviceConnect = new TuyApi ( {
            id: deviceId,
            key: deviceKey
        });

        // Initially, we are not connected to the device
        this.connected = false;
    }

    startCommunication( ) {
        // Find the device
        this.deviceConnect.find().then(
            () => {
                this.deviceConnect.connect().then(
                    () => {
                        this.connected = true;
                    },
                    () => {
                        console.log( "Connection timed out!")
                    }
                )
            },
            () => {
                console.log("Device could not be found!")
            }
        );

        // Add event listeners to now what's going on

        this.deviceConnect.on('disconnected', () => {
            this.connected = false;
            console.log( 'Disconnected from the device')
        });

        this.deviceConnect.on( 'error', error => {
            console.log( 'Error!', error )
        });

        this.deviceConnect.on('data', data => {
            console.log ( 'Data from device: ', JSON.stringify(data));


        });
    }

    terminateCommunication ( ) {
        // Terminate the communication with the device after 10 seconds
        setTimeout ( () => { 
            this.turnOff()
            this.deviceConnect.disconnect();
        }, 
        50000
        );
    }

    async isConnected ( ) {
        // Wait for an established connection
        console.log("Waiting for connection");
        return await new Promise ( 
            ( resolve, reject ) => {
                
                if ( this.connected ) {
                    resolve("Connected");
                }
                sleep( 1500 ).then( () => {
                    console.log( "Waiting...")
                    if ( this.connected ) {
                        resolve("Connected");
                    }
                    sleep( 1500 ).then( () => {
                        console.log( "Waiting...")
                        if ( this.connected ) {
                            resolve("Connected");
                        }
                        sleep( 1500 ).then( () => {
                            console.log( "Waiting...")
                            if ( this.connected ) {
                                resolve("Connected");
                            }
                            sleep( 1500 ).then( () => {
                                console.log( "Waiting...")
                                if ( this.connected ) {
                                    resolve("Connected");
                                }
                                sleep( 1500 ).then( () => {
                                    console.log( "Waiting...")
                                    if ( this.connected ) {
                                        resolve("Connected");
                                    }
                                    sleep( 1500 ).then( () => {
                                        console.log( "Waiting...")
                                        if ( this.connected ) {
                                            resolve("Connected");
                                        } else {
                                            reject ("Connection could not be established!");
                                        }
                                    });
                                });
                            });
                        });
                    });
                }
                );
            });
    }

    turnOn ( ) {
        this.isConnected().then( () => {
            this.deviceConnect.set(
                {dps: 1, set: true}
            ).then(() => console.log ( "Device was turned on"))
        }, () =>{
            console.log( "Not yet connected!")
        }
        );
    }

    turnOff ( ) {
        this.isConnected().then(
            this.deviceConnect.set(
                {dps: 1, set:false}
            ).then(() => console.log ("Device was turned off")),

            console.log( "Not yet connected!")
        );
    }

}

module.exports = TuyConnect