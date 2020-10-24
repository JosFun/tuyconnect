const TConnect = require("./tuyconnect"); // Smart Device functionality
const DBAccess = require("./db_access"); // Database functionality
const express = require("express") // Webserver functionality of nodejs

// Initialize the webserver
const app = express();
app.set('view engine', 'ejs');

const deviceData = {
    power: 27.8,
    current: 2.6,
    voltage: 230.8,
    energy: 56.5,
    uptime: 34
}


app.get('/', (req,res) => {
    deviceIsOn = false;
    power = deviceData.power;
    current = deviceData.current;
    voltage = deviceData.voltage;
    energy = deviceData.energy;
    uptime = deviceData.uptime;

    /*
    connector.isTurnedOn().then(
        (status) => {
            deviceIsOn = status;
        }
    )*/
    res.render("index");
});


app.listen(
    port="8080",
    () => {
        console.log("Server is up and running!")
    }
)

let connector = new TConnect ( 
    deviceId = 'bff623ba34e3ac0371ga6m',
    deviceKey = '0b575259a923a549'
)

let db_communication = new DBAccess ( );

promise = db_communication.connectionState;
promise.then(
    () => {
        db_communication.queryForID(2, printResult);
        db_communication.queryForDateBetween( "2020-01-30", "2020-02-30", printResult);
        db_communication.energy_table(printResult);
        db_communication.addEntry( "2020-10-24", "40 Grad", 0.8);
        db_communication.energy_table(printResult);
        db_communication.getProgramAvgEnergy ( "40 Grad", printResult);
        db_communication.getProgramAvgEnergyList(printResult);
    }
)

function printResult ( result ) {
    console.log(JSON.stringify(result))
}

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


connector.turnOff()
connector.on ( "offChange", ( ) => {
    console.log("An off change has been detected!");

    energyConsumption = connector.energyConsumption;
    connector.resetStatistics();

    console.log("Total energy consumption: ", energyConsumption )
    console.log("Statistics have been reset!");
})

connector.on( "newData", () => {
    deviceData.current = connector.current;
    deviceData.voltage = connector.voltage;
    deviceData.power = connector.power;
    deviceData.uptime = connector.uptime;
    powerVals = connector.powerVals;
    deviceData.energy = connector.energyConsumption;
    
    console.log("");
    if ( current >= 0 ) {
            console.log("Current: ", deviceData.current );
    } else {
        console.log("Current: no value yet")
    }
    if ( voltage >= 0 ) {
            console.log("Voltage: ", deviceData.voltage );
    } else {
        console.log("Voltage: no value yet")
    }
    if ( power >= 0 ) {
            console.log("Power: ", deviceData.power );
    } else {
        console.log("Power: no value yet")
    }
    if ( powerVals != undefined ) {
        console.log ( powerVals );
    } else {
        console.log("No power values yet");
    }

    console.log("Energy consumption: ", deviceData.energy ) ;
    console.log("");
})
