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
            "SELECT ID, PROGRAM, DATE_INFO D, KWH FROM ENERGY_DATA WHERE D BETWEEN $1 and $2 ORDER BY D ASC;",
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
        "SELECT ID, PROGRAM, DATE_INFO D, KWH FROM ENERGY_DATA WHERE ID == $1 ORDER BY D ASC;",
        [ id ],
        (err, rows) => {
            if ( err ) {
                calback(err);
            }
            callback(rows);
        }
        );
    }

    energy_table ( callback ) {
        this.db.all(
            "SELECT ID, PROGRAM, DATE_INFO D, KWH FROM ENERGY_DATA ORDER BY D ASC;",
            [],
            (err, rows) => {
                if ( err ) {
                    callback(err);
                }
                callback(rows);
        });
    }

    get connectionState () {
        return this.connected;
    }
}

module.exports = DBAccess
