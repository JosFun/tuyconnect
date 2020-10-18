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

connector.on ( "offChange", ( ) => {
    console.log("An off change has been detected!");

    energyConsumption = connector.energyConsumption;
    connector.resetStatistics();

    console.log("Total energy consumption: ", energyConsumption )
    console.log("Statistics have been reset!");
})

connector.on( "newDate", () => {
    current = connector.current;
    voltage = connector.voltage;
    power = connector.power;
    energyConsumption = connector.energyConsumption;
    
    console.log("");
    console.log("Current: ", current );
    console.log("Voltage: ", voltage );
    console.log("Power: ", power );
    console.log("Energy consumption: ", energyConsumption ) ;
    console.log("");
})
