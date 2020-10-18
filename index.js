let TConnect = require("./tuyconnect");

let connector = new TConnect ( 
    deviceId = 'bff623ba34e3ac0371ga6m',
    deviceKey = '0b575259a923a549'
)

connector.startCommunication();
connector.turnOn()
connector.terminateCommunication();