const TelegramBot = require("node-telegram-bot-api"); // Telegram bot functionality
const DBAccess = require ("./db_access");

const token = "1067081596:AAGOlkBItoCX1Zg-4q03EZQ1KM6qvwQ-WfY";

const db_communication = new DBAccess();

const bot = new TelegramBot ( 
    token, // Specify the token
    {polling: true} // Listen for user input 
)

let botDeviceData = {
    power: 27.8,
    current: 2.6,
    voltage: 230.8,
    energy: 0,
    uptime: 34,
    deviceIsOn: false,
    programList:[ "Baumwolle", "Jeans"],
    degreeList: [ 20, 30, 40, 60, 90],
    rotationList: [ 600, 1000, 1200, 1400 ]
}

// To be invoked by other modules in order to update the dataset of this bot
function updateBotDeviceData ( data ) {
    botDeviceData = data;
}

function notifyDeviceFinished () {
    db_communication.getSubscribers ( (rows) => {
        for ( let i = 0; i < rows.length; ++i ) {
            bot.sendMessage ( 
                rows[i].ID,
                "Hey, ich habe fertig gewaschen!"
            )
        }
    })
}

bot.on('message', (msg) => {
    const text = msg.text;

    console.log( text)

    // Register a new user
    if( text.localeCompare("/register") == 0) {
        db_communication.getSubscriberByID( msg.chat.id, ( subs ) => {
            
            if ( subs.length > 0 ) {
                bot.sendMessage(
                    msg.chat.id,
                    "Du bist bereits registriert, " + msg.chat.first_name + " " + ( msg.chat.last_name != undefined ? msg.chat.last_name : "")
                )
            } else {
                db_communication.addSubscriber( 
                    id= msg.chat.id,
                    first_name= msg.chat.first_name,
                    last_name= msg.chat.last_name
                );  
                
                bot.sendMessage ( 
                    msg.chat.id,
                    "Erfolgreich registriert, " + msg.chat.first_name + " " + msg.chat.last_name
                );
            }

            
        } );


    }

    if ( text.localeCompare("/webpage") == 0) {
        bot.sendMessage ( 
            msg.chat.id,
            "raspberrypi.fritz.box:80"
        )
    }

    if ( text.localeCompare("/energytable") == 0) {
        db_communication.energyTable( ( progs ) => {
            let text = "";
            for ( let i = 0; i < progs.length; ++i ) {
                text += "Programm: " + progs[i].PROGRAM + ", " + progs[i].DEGREE + "°, " + progs[i].ROTATIONS + " rpm, Intensiv: " + (progs[i].INTENSIVE ? "An" : "Aus") + ", Datum: " + progs[i].DATE_INFO + ", Verbrauch: " + progs[i].KWH + " kWh";
                if ( i != progs.length -1 ) text += "\n\n"
            }

            bot.sendMessage(
                msg.chat.id,
                text
            );
        });
    }

    if ( text.localeCompare("/avgenergy") == 0) {
        db_communication.getFullProgramAvgEnergyList ( ( progs ) => {
            let text = "";
            for( let i = 0; i < progs.length; ++i ) {
                text += "Programm: " + progs[i].PROGRAM + ", " + progs[i].DEGREE + "°, " + progs[i].ROTATIONS + " rpm, Intensiv: " + ( progs[i].INTENSIVE ? "An" : "Aus" ) + ", Verbrauch: " + progs[i].AVG_CONSUMP + " kWh";
                if ( i != progs.length -1 ) text += "\n\n"
            }
            bot.sendMessage (
                msg.chat.id,
                text
            );
        })
    }

    if ( text.localeCompare("/state") == 0) {
        bot.sendMessage (
            msg.chat.id,
            botDeviceData.deviceIsOn ? "ON" : "OFF"
        )
    }

    if ( text.localeCompare("/power") == 0) {
        bot.sendMessage (
            msg.chat.id,
            botDeviceData.power+ " W"
        )
    }

    if ( text.localeCompare("/energy") == 0) {
        bot.sendMessage(
            msg.chat.id,
            botDeviceData.energy + " kWh"
        )
    }       
});

module.exports.updateBotDeviceData = updateBotDeviceData;
module.exports.notifyDeviceFinished = notifyDeviceFinished;