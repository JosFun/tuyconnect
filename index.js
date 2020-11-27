const TConnect = require("./tuyconnect"); // Smart Device functionality
const DBAccess = require("./db_access"); // Database functionality
const express = require("express") // Webserver functionality
const bodyParser = require("body-parser") // Parse html bodies in express
const telegramBot = require("./telebot") // Telegram bot functionality

// Initialize the webserver
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Json parser
const jsonParser = bodyParser.json;
// URL Encoded parser ( for form data )
const urlEncodedParser = bodyParser.urlencoded({ extended: false})

let db_communication = new DBAccess ( );

let connector = new TConnect ( 
    deviceId = 'bff623ba34e3ac0371ga6m',
    deviceKey = '0b575259a923a549'
);

// Initially, no off change has been detected yet
let detected = false;

const deviceData = {
    power: 0,
    current: 0,
    voltage: 230,
    energy: 0,
    uptime: 0,
    deviceIsOn: false,
    programList:[ "Baumwolle", "Jeans"],
    degreeList: [ 20, 30, 40, 60, 90],
    rotationList: [ 600, 1000, 1200, 1400 ]
}

app.locals.deviceData = deviceData;
app.locals.postFinished = false;
app.locals.postSucessful = false;
app.locals.turnOn = connector.turnOn;
app.locals.turnOff = connector.turnOff;

db_communication.queryForProgamList ( (result) => {
    deviceData.programList = new Array();
    for ( let i = 0; i < result.length; ++i ) {
        deviceData.programList.push( result[i].PROGRAM)
    }

    app.listen(
        port="80",
        () => {
            console.log("Server is up and running!")
        }
    )  
});

app.get('/', (req,res) => {
    //console.log(req);
    app.locals.postFinished = false;
    app.locals.postSucessful = false;

    /*
    connector.isTurnedOn().then(
        (status) => {
            deviceIsOn = status;
        }
    )*/
    res.status(200).render("index");
});

app.post('/state', urlEncodedParser, (req,res) => {
    let state = req.headers.state;

    if ( state.toUpperCase().localeCompare("ON") == 0) {
            connector.turnOn();
            deviceData.deviceIsOn = true;
            res.status(200).send();
    } else if ( state.toUpperCase().localeCompare("OFF") == 0) {
            connector.turnOff();
            deviceData.deviceIsOn = false;
            res.status(200).send();
    } else {
        res.status(400).send()
    }
} )

app.post('/', urlEncodedParser, (req,res) => {
    //console.log(req);
    
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth()).padStart(2, '0');
    let yyyy = today.getFullYear();

    // Gather necessary data to add an entry in the database 
    let washDate = yyyy + '-' + mm + '-' + dd;
    let programName = req.body.program.replace(';','');
    let degree = req.body.degree.replace(';','');
    let rotations = req.body.rotation.replace(';','');
    let intensive = req.body.intensive ? 1 : 0;
    let energy = deviceData.energy;


    app.locals.postFinished = true;
    if ( energy == 0 ) {
        app.locals.postSucessful = false;
        res.status(400).render( "index" );
    } else {
        app.locals.postSucessful = true;    
        res.status(200).render("index")
    }

});

app.get('/data', (req, res) => {
    console.log(req);
    energyData = null;

    db_communication.energyTable( (result) => {
        energyData = result;    
        console.log( JSON.stringify(energyData));

        res.status(200).render("data");
    })


});

app.get('/updateData', (req, res) => {
    res.status(200).send(
        JSON.stringify(deviceData)
    );
});

promise = db_communication.connectionState;
promise.then(
    () => {
        //db_cmmunication.queryForID(2, printResult);
        //db_communication.queryForDateBetween( "2020-01-30", "2020-02-30", printResult);
        //db_communication.energy_table(printResult);
        //db_communication.addEntry( "2020-10-24", "Baumwolle", 40, 1400, 0.8);
        //db_communication.energy_table(printResult);
        //db_communication.getProgramAvgEnergy ( "Baumwolle", 40, 1400, printResult);
        //db_communication.getProgramAvgEnergyList(printResult);
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


//connector.turnOn();
connector.on ( "offChange", ( ) => {
    if (detected == false) {
        console.log("An off change has been detected!");

        // Notify the telegramBot that the device be finished
        telegramBot.notifyDeviceFinished ();
        energyConsumption = connector.energyConsumption;
        connector.resetStatistics();

        console.log("Total energy consumption: ", energyConsumption )
        console.log("Statistics have been reset!");

        // In order to prohibute notifying everyone all the time, the offChange counts as detected
        detected = true;
    }
})

connector.on( "newData", () => {
    deviceData.current = connector.current;
    deviceData.voltage = connector.voltage;
    deviceData.power = connector.power;
    deviceData.uptime = connector.uptime;
    deviceData.deviceIsOn = connector.deviceIsOn;
    powerVals = connector.powerVals;
    deviceData.energy = Math.round ( 1000 * connector.energyConsumption / ( 3600 * 1000) ) / 1000;

    if ( detected && deviceData.power > 3 ) {
        // If the power is greater than 3 W: reset the detected variable, since another program must have been started!
        detected = false;
    }

    // Update the locals of the webapp
    app.locals.deviceData = deviceData;

    // Update the bot's data
    telegramBot.updateBotDeviceData( deviceData );
    
    console.log("");
    if ( deviceData.current >= 0 ) {
            console.log("Current: ", deviceData.current );
    } else {
        console.log("Current: no value yet")
    }
    if ( deviceData.voltage >= 0 ) {
            console.log("Voltage: ", deviceData.voltage );
    } else {
        console.log("Voltage: no value yet")
    }
    if ( deviceData.power >= 0 ) {
            console.log("Power: ", deviceData.power );
    } else {
        console.log("Power: no value yet")
    }
    if ( deviceData.powerVals != undefined ) {
        console.log ( powerVals );
    } else {
        console.log("No power values yet");
    }

    console.log("Turned on: " + deviceData.deviceIsOn );

    console.log("Energy consumption: ", deviceData.energy ) ;
    console.log("");
})
