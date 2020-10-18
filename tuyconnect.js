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
            this.turnOff();
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
                    return;
                }
                sleep( 1500 ).then( () => {
                    console.log( "Waiting...")
                    if ( this.connected ) {
                        resolve("Connected");
                        return;
                    }
                    sleep( 1500 ).then( () => {
                        console.log( "Waiting...")
                        if ( this.connected ) {
                            resolve("Connected");
                            return;
                        }
                        sleep( 1500 ).then( () => {
                            console.log( "Waiting...")
                            if ( this.connected ) {
                                resolve("Connected");
                                return;
                            }
                            sleep( 1500 ).then( () => {
                                console.log( "Waiting...")
                                if ( this.connected ) {
                                    resolve("Connected");
                                    return;
                                }
                                sleep( 1500 ).then( () => {
                                    console.log( "Waiting...")
                                    if ( this.connected ) {
                                        resolve("Connected");
                                        return;
                                    }
                                    sleep( 1500 ).then( () => {
                                        console.log( "Waiting...")
                                        if ( this.connected ) {
                                            resolve("Connected");
                                            return;
                                        } else {
                                            reject ("Connection could not be established!");
                                            return;
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
        // Turn off the device
        this.isConnected().then( () => {
            this.deviceConnect.set(
                {dps: 1, set: true}
            ).then(() => console.log ( "Device was turned on"))
        }, () =>{
            console.log( "Not yet connected!")
        }
        );
    }

    turnOnFast ( ) {
        // Turn on the device fast without checking its status first
        this.deviceConnect.set(
            {dps: 1, set: true}
        ).then(() => {
            console.log ( "Device was turned on")
        }, () => {
            console.log("Not yet connected!")
        });
    }

    turnOffFast ( ) {
        // Turn off the device fast without checking its status first
        this.deviceConnect.set(
            {dps: 1, set: false}
        ).then(() => {
            console.log ( "Device was turned off")
        }, () => {
            console.log("Not yet connected!")
        });
    }

    turnOff ( ) {
        // Turn on the device
        this.isConnected().then( () => {
             this.deviceConnect.set(
                {dps: 1, set:false}
            ).then(() => {
                console.log ("Device was turned off")
            },
            () => {
                console.log("Error! Could not turn off the device!")
            })

        },
        () => {
            console.log( "Not yet connected!")
        });
    }

    changePowerState ( ) {
        // Change the power state of the device
        this.isTurnedOn().then( (status) => {
            if ( status ) {
                this.turnOffFast()
            } else {
                this.turnOnFast()
            }
        },
        (msg) => {
            console.log(msg)
        })
    }

    async isTurnedOn ( ){
        // Check whether or not the device is turned on
        return await this.isConnected().then( async() =>{
            return await this.deviceConnect.get( {dps: 1} )
        },
        () => {
            console.log("Not yet connected!")
            return new Promise ( (resolve, reject) => {
                reject("Error")
            })
        });       
    }
    

}

module.exports = TuyConnect