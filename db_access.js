const sqlite = require("sqlite3")

const DB_FILE = 'database/energydata.db';

class DBAccess{
    constructor( ) {
        this.connected = new Promise ( 
            (resolve, reject) => {
                this.db = new sqlite.Database (
                DB_FILE,
                sqlite.OPEN_READWRITE,
                (err) => {
                    if (err) {
                        reject(err)
                        console.log("Error")
                    }
                    resolve("Connection established")
                }
            );
        });
    }

    queryForDateBetween ( start_date, end_date, callback ) {
        this.db.all ( 
            "SELECT ID, PROGRAM, DATE_INFO, KWH FROM ENERGY_DATA WHERE DATE_INFO BETWEEN $1 and $2 ORDER BY DATE_INFO ASC;",
            [ start_date, end_date],
            (err, rows) => {
                if ( err ) {
                    callback(err);
                }
                callback(rows);
            }
        );
    }

    queryForID ( id, callback) {
        this.db.all(
        "SELECT ID, PROGRAM, DATE_INFO, KWH FROM ENERGY_DATA WHERE ID == $1 ORDER BY DATE_INFO ASC;",
        [ id ],
        (err, rows) => {
            if ( err ) {
                callback(err);
            }
            callback(rows);
        }
        );
    }

    queryForProgram ( program, callback ) {
        this.db.all( 
            "SELECT ID, PROGRAM, DATE_INFO, KWH FROM ENERGY_DATA WHERE PROGRAM == $1 ORDER BY DATE_INFO ASC;",
            [ program ],
            (err, rows) => {
                if ( err ) {
                    callback(err);
                }
                callback(rows);
            }
        );
    }

    /** 
     * [Get the average energy consumption of the specified program]
     * @param {[string]} program [The name of the program]
     * @param {[function]} callback [The callback function this functions reports to]
     * @return {[array<object>]} [The answer of the SQL Query consisting of the program its average consumption]
    */ 
    getProgramAvgEnergy ( program, callback ) {
        this.db.all ( 
            "SELECT PROGRAM, AVG(KWH) AS AVG_CONSUMP FROM ENERGY_DATA WHERE PROGRAM == $1 GROUP BY PROGRAM ORDER BY AVG_CONSUMP;",
            [program],
            (err, rows) => {
                if ( err ) {
                    callback(err);
                }
                callback( rows );
            }
        );
    }

    /**
     * [Get the average energy consumption of each of the programs known to the database]
     * @param {[string]} program [The name of the program] 
     * @param {[function]} callback [The callback function this function reports to]
     * @return {[array<object<]} [The answer of the SQL Query consisting of each of the known programs and their specific energy consumption]
     */
    getProgramAvgEnergyList ( callback ) {
        this.db.all ( 
            "SELECT PROGRAM, AVG(KWH) AS AVG_CONSUMP FROM ENERGY_DATA GROUP BY PROGRAM ORDER BY AVG_CONSUMP ASC;",
            [],
            (err,rows) => {
                if ( err ) {
                    callback( err );
                }
                callback( rows );
            }
        )
    }


    energy_table ( callback ) {
        this.db.all(
            "SELECT ID, PROGRAM, DATE_INFO, KWH FROM ENERGY_DATA ORDER BY DATE_INFO ASC;",
            [],
            (err, rows) => {
                if ( err ) {
                    callback(err);
                }
                callback(rows);
        });
    }

    addEntry ( date, program, kwh ) {
        this.db.run(
            "INSERT INTO ENERGY_DATA ( DATE_INFO, PROGRAM, KWH ) VALUES ( ?, ?, ?);",
            [ String(date), String(program), parseFloat(kwh)]
        );
    }

    get connectionState () {
        return this.connected;
    }
}

module.exports = DBAccess
