import moment from 'moment'

export default {

    /***************************************************************************************
         * Utility method: used to generate a subscription ID. 
         * This subscription ID will be sent to ICWS
         ***************************************************************************************/
    generateSubscriptionId(userId) {
        let subscriptionId = userId + "-" + getFormattedTime();
        //Get time format for unique ID
        function getFormattedTime() {
            var today = new Date();

            return moment(today).format("YYYYMMDDHHmmss");
        }
        return subscriptionId
    }
}