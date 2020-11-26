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

    // Get a list of all subscribers of this webserver
    getSubscribers ( callback ) {
        this.db.all ( 
            "SELECT ID, FIRST_NAME, LAST_NAME FROM SUBSCRIBERS ORDER BY ID ASC;",
            [],
            (err, rows ) => {
                if ( err ) {
                    callback ( err );
                } else {
                    callback ( rows );
                }
            }
        );
    }

    // Get the subscriber by their id
    getSubscriberByID ( id, callback ) {
        this.db.all ( 
            "SELECT ID, FIRST_NAME, LAST_NAME FROM SUBSCRIBERS WHERE ID == $1;",
            [ id ],
            ( err, rows ) => {
                if ( err ) {
                    callback ( err );
                } else {
                    callback ( rows );
                }
            }
        );
    }

    // Adds a new subscriber to this webserver
    addSubscriber ( id, first_name, last_name ) {
        this.db.run ( 
            "INSERT INTO SUBSCRIBERS ( ID, FIRST_NAME, LAST_NAME ) VALUES ( ?, ?, ? );",
            [ parseInt(id), String(first_name), String(last_name) ]
        );
    }

    queryForDateBetween ( start_date, end_date, callback ) {
        this.db.all ( 
            "SELECT ID, PROGRAM, DEGREE, ROTATIONS, INTENSIVE, DATE_INFO, KWH FROM ENERGY_DATA WHERE DATE_INFO BETWEEN $1 and $2 ORDER BY DATE_INFO ASC;",
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
        "SELECT ID, PROGRAM, DEGREE, ROTATIONS, INTENISVE, DATE_INFO, KWH FROM ENERGY_DATA WHERE ID == $1 ORDER BY DATE_INFO ASC;",
        [ id ],
        (err, rows) => {
            if ( err ) {
                callback(err);
            }
            callback(rows);
        }
        );
    }

    queryForFullProgram ( program, degree, rotations, intensive, callback ) {
        this.db.all( 
            "SELECT ID, PROGRAM, DEGREE, ROTATIONS, INTENSIVE, DATE_INFO, KWH FROM ENERGY_DATA WHERE PROGRAM == $1 AND DEGREE == $2 AND ROTATIONS == $3 AND INTENSIVE == $4 ORDER BY DATE_INFO ASC;",
            [ program, degree, rotations, intensive ],
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
     * @param {[integer]} degree [The used temperatur]
     * @param {[rotations]} rotations [The used number of rotations per minute]
     * @param {[intensive]} intensive [Whether or not the intensive option has been selected]
     * @param {[function]} callback [The callback function this functions reports to]
     * @return {[array<object>]} [The answer of the SQL Query consisting of the program its average consumption]
    */ 
    getFullProgramAvgEnergy ( program, degree, rotations, intensive, callback ) {
        this.db.all ( 
            "SELECT PROGRAM, DEGREE, ROTATIONS, INTENSIVE, AVG(KWH) AS AVG_CONSUMP FROM ENERGY_DATA WHERE PROGRAM == $1 AND DEGREE == $2 AND ROTATIONS == $3 AND INTENSIVE == $4 GROUP BY PROGRAM, DEGREE, ROTATIONS ORDER BY AVG_CONSUMP;",
            [program, degree, rotations, intensive],
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
     * @param {[function]} callback [The callback function this function reports to]
     * @return {[array<object<]} [The answer of the SQL Query consisting of each of the known programs and their specific energy consumption]
     */
    getFullProgramAvgEnergyList ( callback ) {
        this.db.all ( 
            "SELECT PROGRAM, DEGREE, ROTATIONS, INTENSIVE, AVG(KWH) AS AVG_CONSUMP FROM ENERGY_DATA GROUP BY PROGRAM, DEGREE, ROTATIONS, INTENSIVE ORDER BY AVG_CONSUMP ASC;",
            [],
            (err,rows) => {
                if ( err ) {
                    callback( err );
                }
                callback( rows );
            }
        )
    }

    queryForProgamList ( callback ) {
        this.db.all(
            "SELECT DISTINCT PROGRAM FROM ENERGY_DATA ORDER BY PROGRAM ASC;",
            [],
            (err, rows) => {
                if ( err ) {
                    callback( err );
                }
                callback( rows );
            }
        )
    }

    queryForTemperatureList ( callback ) {
        this.db.all(
            "SELECT DISTINCT DEGREE FROM ENERGY_DATA ORDER BY DEGREE ASC;",
            [],
            (err, rows )=> {
                if ( err ) {
                    callback( err );
                }
                callback ( rows );
            }
         )
    }

    queryForRotationsList ( callback ) {
        this.db.all( 
            "SELECT DISTINCT ROTATIONS FROM ENERGY_DATA ORDER BY ROTATIONS ASC;",
            [],
            ( err, rows ) => {
                if ( err ) {
                    callback( err );
                }
                callback ( rows );
            }
        )
    }

    queryForFullProgramList ( callback ) {
        this.db.all ( 
            "SELECT DISTINCT PROGRAM, DEGREE, ROTATIONS, INTENSIVE FROM ENERGY_DATA ORDER BY PROGRAM ASC;",
            [],
            ( err, rows ) => {
                if ( err ){
                    callback ( err );
                }
                callback ( rows );
            }
        )
    }


    energyTable ( callback ) {
        this.db.all(
            "SELECT ID, PROGRAM, DEGREE, ROTATIONS, INTENSIVE, DATE_INFO, KWH FROM ENERGY_DATA ORDER BY PROGRAM ASC;",
            [],
            (err, rows) => {
                if ( err ) {
                    callback(err);
                }
                callback(rows);
        });
    }

    addEntry ( date, program, degree, rotations, intensive, kwh ) {
        this.db.run(
            "INSERT INTO ENERGY_DATA ( DATE_INFO, PROGRAM, DEGREE, INTENSIVE, ROTATIONS, KWH ) VALUES ( ?, ?, ?, ?, ?, ?);",
            [ String(date), String(program), parseInt(degree), parseInt(rotations), parseFloat(kwh), parseInt(intensive)]
        );
    }

    get connectionState () {
        return this.connected;
    }
}

module.exports = DBAccess
