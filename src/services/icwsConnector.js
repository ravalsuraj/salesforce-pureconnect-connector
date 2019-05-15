import axios from 'axios'

var instance = axios.create({
    baseURL: "https://104.211.95.34:8080/api",
    timeout: 15000
});
export default {

    getAgentLoginState(request) {
        console.log("getAgentLoginState() received request=", request)
        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        };

        console.log("getAgentLoginState(): sending request. header=", header)

        return instance.get('/agent/connection', {
            headers: header
        }).then(response => {
            console.log("getAgentLoginState() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("getAgentLoginState() :  error=", error)
        })
    },
    /***************************************************************************************
     * Agent Login Request: used to log the agent into genesys
     ***************************************************************************************/
    agentLoginRequest(loginRequest) {
        console.log("agentLoginRequest() received request=", loginRequest)
        let header = {
            'content-type': 'application/json',
            'subscriptionId': loginRequest.subscriptionId
        }
        let body = {
            role: 'PMT',
            userId: loginRequest.userId,
            password: loginRequest.password,
            station: loginRequest.station
        };

        console.log("agentLoginRequest(): sending request. header=", header)
        console.log("agentLoginRequest(): sending request. body=", body)

        return instance.post('/agent/connection', body, {
            headers: header
        }).then(response => {
            console.log("agentLoginRequest() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("agentLoginRequest() :  error=", error)
            return error
        })
    },

    /***************************************************************************************
     * Agent Logout Request: used to log the agent out of genesys. ALso unsubscribes from queues
     ***************************************************************************************/
    agentLogoutRequest(logoutRequest) {
        console.log("agentLogoutRequest() received request=", logoutRequest)
        let header = {
            'content-type': 'application/json',
            'set-cookie': logoutRequest.cookie,
            'csrfToken': logoutRequest.csrfToken,
            'sessionId': logoutRequest.sessionId
        };
        let body = {
            'userId': logoutRequest.userId,
            'subscriptionId': logoutRequest.subscriptionId
        };

        console.log("agentLogoutRequest(): sending request. header=", header)
        console.log("agentLogoutRequest(): sending request. body=", body)

        instance.interceptors.request.use(config => {
            config.headers.post['set-cookie'] = logoutRequest.cookie;
            config.headers.post['csrfToken'] = logoutRequest.csrfToken;
            return config;
        });
        return axios.delete('https://104.211.95.34:8080/api/agent/connection', {
            timeout: 5000,
            headers: header,
            data: body
        }).then(response => {
            console.log("agentLogoutRequest() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("agentLogoutRequest() :  error=", error)
            return error
        })
    },

    /***************************************************************************************
     * Agent State Request: used to change agent state from ready to AUX, etc.
     ***************************************************************************************/
    agentStateChangeRequest(request) {
        console.log("agentStateChangeRequest() received request=", request)
        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        };
        let body = {
            userId: request.userId,
            statusId: request.statusId
        }
        console.log("agentStateChangeRequest(): sending request. header=", header)
        console.log("agentStateChangeRequest(): sending request. body=", body)

        return instance.put('/agent/status', body, {
            headers: header
        }).then(response => {
            console.log("agentStateChangeRequest() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("agentStateChangeRequest() :  error=", error)
            return error
        })
    },


    /***************************************************************************************
     * Call Control Request: used to make requests to perform call related actions: 
     * Actions can be: answer, drop , hold or unhold depending
     ***************************************************************************************/

    callControlRequest(controlRequest) {
        console.log("callControlRequest(): request received Request=", controlRequest)
        let header = {
            'content-type': 'application/json',
            'set-cookie': controlRequest.cookie,
            'csrfToken': controlRequest.csrfToken,
            'sessionId': controlRequest.sessionId,
            'subscriptionId': controlRequest.subscriptionId
        }
        let body = null
        let answerbody = {
            interactionId: controlRequest.interactionId,
        };

        let holdBody = {
            interactionId: controlRequest.interactionId,
            holdParameters: {
                on: null
            }
        }
        let urlControlPath = controlRequest.controlType;
        if (controlRequest.controlType === "hold" || controlRequest.controlType === "unhold") {
            body = holdBody
            urlControlPath = "hold";
            body.holdParameters.on = controlRequest.controlType === "hold"
        }
        else {
            body = answerbody
        }
        console.log("callControlRequest(): sending request. header=", header)
        console.log("callControlRequest(): sending request. body=", body)
        return instance.post('/call/' + urlControlPath, body, {
            headers: header
        }).then(response => {
            console.log("callControlRequest() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("callControlRequest() :  error=", error)
            return error
        })
    },


    /***************************************************************************************
     * Create an outbound call:Called when user clicks on a number on Salesforce
     ***************************************************************************************/
    createOutboundCall(outboundCallRequest) {
        console.log("createOutboundCall(): request received Request=", outboundCallRequest)
        let body = {
            __type: 'urn:inin.com:interactions:createCallParameters',
            target: outboundCallRequest.targetNumber,
            workgroup: 'PMT'
        }
        let header = {
            'content-type': 'application/json',
            'set-cookie': outboundCallRequest.cookie,
            'csrfToken': outboundCallRequest.csrfToken,
            'sessionId': outboundCallRequest.sessionId,
            'subscriptionId': outboundCallRequest.subscriptionId
        }

        return instance.post('/call/outbound', body, {
            headers: header
        }).then(response => {
            console.log("createOutboundCall() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("createOutboundCall() :  error=", error)
            return error
        })

    },


    /***************************************************************************************
     * Wrap-up Request: used to send call dispostion to genesys
     ***************************************************************************************/

    sendWrapUpRequestToGenesys(request) {
        console.log("sendWrapUpRequestToGenesys(): request received Request=", request)

        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        }
        console.log("sendWrapUpRequestToGenesys(): sending request. header=", header)

        //'call/:interactionId/code/:wrapupCode/wrapup'
        return instance.post('/call/' + request.interactionId + '/code/' + request.wrapupCode + '/wrapup', "", {
            headers: header
        }).then(response => {
            console.log("sendWrapUpRequestToGenesys() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("sendWrapUpRequestToGenesys() :  error=", error)
            return error
        })

    },




    /***************************************************************************************
     * Dialer Wrap-up Request: used to send call dispostion to dialer
     ***************************************************************************************/

    sendWrapUpRequestToDialer(request) {
        console.log("sendWrapUpRequestToDialer(): request received Request=", request)

        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        }

        let body = {
            'userId': request.userId
        }

        console.log("sendWrapUpRequestToDialer(): sending request. header=", header)
        console.log("sendWrapUpRequestToDialer(): sending request. body=", body)
        //'call/:interactionId/code/:wrapupCode/wrapup'
        ///dialer/code/:wrapupCode/wrapup
        return instance.post('/dialer/code/' + request.wrapupCode + '/wrapup', body, {
            headers: header
        }).then(response => {
            console.log("sendWrapUpRequestToDialer(): response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("sendWrapUpRequestToDialer(): error=", error)
            return error
        })

    },

    /***************************************************************************************
     * Fetch Recording URL: used to get the audio recording URL from the recording ID. 
     * Note: The recording ID is retreived as a socket event when the call starts.
     ***************************************************************************************/

    fetchRecordingUrl(request) {
        console.log("fetchRecordingUrl(): request received Request=", request)

        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        }

        return instance.get('/call/recording/' + request.recordingId + '/recordingUri', {
            headers: header
        }).then(response => {
            console.log("fetchRecordingUrl() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("fetchRecordingUrl() :  error=", error)
            return error
        })
    },


}