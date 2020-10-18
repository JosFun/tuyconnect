const List = require ( "collections/list")

class TimeSequence {
    constructor ( sample_interval ) {
        this.sample_interval = sample_interval

        this.values = new List ()
    }

    get sample_interval ( ) {
        return this.samle_interval
    }

    get length() {
        return this.data.length
    }

    collect ( new_value ) {
        // Collect a new value in this TimeSequence
        this.values.push( new_value )
    }

    integrate ( ) {
        result = 0
        // Integrate the gathered values of this TimeSequence
        this.values.forEach(
            (value) => {
                result += this.sample_interval * value 
            }
        )

        return result;
    }

    

    
}