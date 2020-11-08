class TimeSequence {
    constructor ( ) {
        this.sample_intervals = new Array() 

        this.values = new Array()
    }

    get length() {
        return this.data.length
    }

    get time() {
        // Get the amount of time that has been collected by this TimeSequence
        let sum = 0;
        this.sample_intervals.forEach ( 
            timeVal => {
                sum += timeVal
            }
        )

        return sum
    }

    collect ( new_value, time_since_last = 0 ) {
        // Collect a new value in this TimeSequence
        this.values.push( new_value )
        this.sample_intervals.push ( time_since_last )
    }

    integrate ( ) {
        // Integrate the gathered values of this TimeSequence

        let result = 0
        for ( let i = 0; i < this.values.length - 1; ++i  ){
            result += this.values[ i ] * this.sample_intervals [ i + 1 ]
        }

        return result;
    }

    average ( time_interval = 30 ) {
        // Build the average of this TimeSequence over the specified time interval, starting from the end of the TimeSequence

        let interval = 0;
        let sum = 0, index = this.values.length -2;

        while ( interval < time_interval && index > 0 ) {
            // Start at the end of the TimeSequence and get sample_intervals and values
            let interval_value = this.sample_intervals [ index + 1 ]
            sum += this.values[ index ] * interval_value 
            // Mulitply them accordingly and sum them up on the sum variable

            interval += interval_value
            --index; 
            // Increase interval counter by gathered interval and decrement index
        }

        return sum / time_interval;

    } 

    
}
module.exports = TimeSequence