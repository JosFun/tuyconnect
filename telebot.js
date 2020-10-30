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
                "Die Waschmaschine ist fertig!"
            )
        }
    })
}

bot.on('message', (msg) => {
    const text = msg.text;

    console.log( text)

    // Register a new user
    if( text.localeCompare("/register") == 0) {
        db_communication.addSubscriber( 
            id= msg.chat.id,
            first_name= msg.chat.first_name,
            last_name= msg.chat.last_name
        );

        bot.sendMessage ( 
            msg.cat.id,
            "Erfolgreich registriert, " + msg.chat.first_name + " " + msg.chat.last_name
        );
    }

    if ( text.localeCompare("/energytable") == 0) {
        db_communication.energyTable( ( progs ) => {
            bot.sendMessage(
                msg.chat.id,
                JSON.stringify( progs )
            );
        });
    }

    if ( text.localeCompare("/avgenergy") == 0) {
        db_communication.getFullProgramAvgEnergyList ( ( progs ) => {
            bot.sendMessage (
                msg.chat.id,
                JSON.stringify ( progs )
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
            botDeviceData.power+ "W"
        )
    }

    if ( text.localeCompare("/energy") == 0) {
        bot.sendMessage(
            msg.chat.id,
            botDeviceData.energy + "kWh"
        )
    }       
});

module.exports.updateBotDeviceData = updateBotDeviceData;
module.exports.notifyDeviceFinished = notifyDeviceFinished;