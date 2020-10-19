let TConnect = require("./tuyconnect");

let connector = new TConnect ( 
    deviceId = 'bff623ba34e3ac0371ga6m',
    deviceKey = '0b575259a923a549'
)

connector.startCommunication();
/*let promise = connector.isTurnedOn()
promise.then(
    status => {
        if (status) {
            console.log("The device is currently turned on!")
        } else {
            console.log( "The device is currently turned off!")
        }
    },
    (msg) => {
        console.log(msg)
    }
)*/

//connector.turnOn()
connector.on ( "offChange", ( ) => {
    console.log("An off change has been detected!");

    energyConsumption = connector.energyConsumption;
    connector.resetStatistics();

    console.log("Total energy consumption: ", energyConsumption )
    console.log("Statistics have been reset!");
})

connector.on( "newData", () => {
    current = connector.current;
    voltage = connector.voltage;
    power = connector.power;
    powerVals = connector.powerVals;
    energyConsumption = connector.energyConsumption;
    
    console.log("");
    if ( current >= 0 ) {
            console.log("Current: ", current );
    } else {
        console.log("Current: no value yet")
    }
    if ( voltage >= 0 ) {
            console.log("Voltage: ", voltage );
    } else {
        console.log("Voltage: no value yet")
    }
    if ( power >= 0 ) {
            console.log("Power: ", power );
    } else {
        console.log("Power: no value yet")
    }
    if ( powerVals != undefined ) {
        console.log ( powerVals );
    } else {
        console.log("No power values yet");
    }

    console.log("Energy consumption: ", energyConsumption ) ;
    console.log("");
})
