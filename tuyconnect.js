const TuyApi = require ('tuyapi')
const TimeSequence = require('./timeseq')


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

        // Initialle, the state of this device is off
        this.state = false

        // Initialize the sequence of power values that is to be stored
        this.power_vals = new TimeSequence()
        
        // Initialize the last timestamp with -1
        this.lastTimestamp = -1

        // Initialize the new timestamp with -1 as well
        this.newTimestamp = -1

        // Initialize the variable storing the current current
        this.latestCurrent = -1

        // Initialize the variable storing the current voltage
        this.latestVoltage = -1

        this.latestPower = -1

        // Intialize the Array of handlers for this TuyConnect
        this.handlers = {}
    }

    on( eventName, handler ) {
        // Register's events and associated handlers
        if ( !this.handlers[eventName]){
            this.handlers[ eventName ] = []
        }
        this.handlers[ eventName ].push( handler)
    }
    
    emit ( eventName ) {
        // Emits event with the specified name and data to all registered handlers
        for ( const handler of this.handlers[eventName]) {
            handler( )
        }
    }

    startCommunication( ) {
        // Find the device
        this.deviceConnect.find().then(
            () => {
                this.deviceConnect.connect().then(
                    () => {
                        this.connected = true;
                        console.log("Connection has been established!")
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
            console.log ( 'New data has arrived! ', data);
            
            let dps = null

            // Assure that json object is valid
            try{
                dps = data['dps']
                
            } catch ( e ) {
                if ( e instanceof TypeError ) {
                    return;
                }
            }
            // If the device is turned on: Start collecting values!
            if ( dps != undefined && ( this.state == true || dps['1'] == true || dps['18'] > 0 || dps['19'] > 0 )) {

                if ( this.state == false ) {
                    // The device had been turned off and now it has been turned on!
                    this.resetStatistics()
                    // Therefore, the statistics have to be reset!
                
                    this.state = true
                    // Also, we have to store the new state!
                }
                // Get time value
                if ( data['t'] != undefined) {
                    if ( this.lastTimestamp == -1 ) {
                        this.lastTimestamp = data['t']
                        this.newTimestamp = data['t']
                    } else {
                        this.lastTimestamp = this.newTimestamp
                        this.newTimestamp = data['t']
                    }
                }

                // Get power value, collect it in the TimeSequence and test for OffChange of machine behind device
                if ( data['t'] != undefined && dps['19'] != undefined) {
                    this.latestPower = dps['19'] / 10

                    // Do only collect the power if it's greater than 0
                    if ( this.latestPower >= 0 ) {
                        this.power_vals.collect ( 
                            this.latestPower, // Collect the power in Watt
                            this.newTimestamp - this.lastTimestamp // Collect sample_interval in seconds
                        )
                    }

                    // Finally, test whether the just collected power value signals an off change of the machine working on the device
                    this.detectMachineOffChange().then(
                        (status) => {
                            // If an off change has detected: Emit an event to all registered handlers!
                            if ( status ) {
                                console.log("Offchange has been detected!")
                                this.emit ( "offChange" )
                            } else {
                                console.log( "No Offchange could have been detected!")
                            }
                        }
                    )
                }

                // Get current value
                if ( dps ['18'] != undefined ) {
                    this.latestCurrent = dps['18'] // Get latest current in mA
                }

                // Get current voltage
                if ( dps ['20'] != undefined ) {
                    this.latestVoltage = dps['20'] / 10 // Get latest voltage in V
                }

                // Finally, emit an event signaling the observer that data has updated
                this.emit ( "newData" )
            } else {
                // Otherwise, if data is valid and device is turned off: Set state to be false
                if ( data != undefined && dps != undefined && this.state == true ){
                    this.state = false
                }
            }
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
                }
                sleep( 2000 ).then( () => {
                    console.log( "Waiting...")
                    if ( this.connected ) {
                        resolve("Connected");
                    }
                    sleep( 2000 ).then( () => {
                        console.log( "Waiting...")
                        if ( this.connected ) {
                            resolve("Connected");
                        }
                        sleep( 2000 ).then( () => {
                            console.log( "Waiting...")
                            if ( this.connected ) {
                                resolve("Connected");
                            }
                            sleep( 2000 ).then( () => {
                                console.log( "Waiting...")
                                if ( this.connected ) {
                                    resolve("Connected");
                                }
                                sleep( 2000 ).then( () => {
                                    console.log( "Waiting...")
                                    if ( this.connected ) {
                                        resolve("Connected");
                                    }
                                    sleep( 2000 ).then( () => {
                                        console.log( "Waiting...")
                                        if ( this.connected ) {
                                            resolve("Connected");
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
            this.state = true;
            this.emit("newData");
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
            this.state = true;
            this.emit("newData");
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
            this.state = false;
            this.emit("newData");
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
                this.state = false
                this.emit("newData");
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
            return await Promise.resolve( this.deviceConnect.get( {dps: 1} ))
        },
        () => {
            console.log("Not yet connected!")
            return new Promise ( (resolve, reject) => {
                reject("Error")
            })
        });       
    }

    detectMachineOffChange ( ) {
    // Detects whether or not the machine working on the device ( i.e. the socket ) has just been turned off
        if ( this.state && this.power_vals.average( 60 ) < 2.8 && this.uptime > 900) {
            return Promise.resolve( true )
        } else {
            return Promise.resolve( false )
        }
    }
   
    
    resetStatistics ( ) {
        // Resets the collectd statistics
        this.power_vals = new TimeSequence()
        this.latestVoltage = -1
        this.latestCurrent = -1
        this.latestPower = -1
        this.lastTimestamp = -1
        this.newTimestamp = -1
    }

    // Reset the energy measured so far by reinitializing the 
    // Power value sequence
    resetEnergy ( ) {
        this.power_vals = new TimeSequence()
        this.lastTimestamp = -1;
        this.newTimestamp = -1;
    }

    get energyConsumption ( ) {
        // Gets the consumed energy 
        let energy = this.power_vals.integrate ( ) // Compute the consumed energy in Wh
        
        return energy;
    }
    get current ( ) {
        return this.latestCurrent;
    }

    get voltage ( ) {
        return this.latestVoltage;
    }

    get power ( ) {
        return this.latestPower;
    }

    get powerVals ( ) {
        return this.power_vals;
    }

    // Get amount of time the device consumed power
    get uptime ( ) {
        return this.power_vals.time;
    }

    get deviceIsOn ( ) {
        return this.state;
    }
}

module.exports = TuyConnect