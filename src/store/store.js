import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import VuexPersist from 'vuex-persist'

import {
  APP_STATES,
  AGENT_STATES,
  TIMER_STATES,
  CALL_STATES,
  CALL_DIRECTION,
  CALL_NATURE
} from '@/defines.js'

import parsePhone from "@/services/phoneParser.js";
const vuexPersist = new VuexPersist({
  key: 'sf-cti-connector',
  storage: localStorage,
  expiration: 60000 //1 minute
})
export default new Vuex.Store({
  plugins: [vuexPersist.plugin],
  state: {
    app: {
      state: APP_STATES.LOGGED_OUT,
    },
    session: {
      sessionId: null,
      csrfToken: '',
      cookie: '',
      subscriptionId: ''
    },
    agent: {
      salesforceUserIdForAgent: '',
      status: '',
      userId: '',
      station: '',
      auxCodes: []
    },
    call: {
      interactionId: '',
      nature: null,
      state: CALL_STATES.IDLE,
      direction: null,
      customerNumber: null,
      customerCountryCode: null,
      virtualNumber: null,
      callStartDateTime: null,
      callEndDateTime: null,
      callDuration: null,
      recordingId: null,
      recordingURL: null,
      comments: '',
      terminationType: ''
    },
    sfRecord: {
      leadId: null,
      wasLeadIdNull: 'yes',
      callerName: '',
      siteId: null,
      siteName: null,
      projectName: null,
      projectId: null
    },

    clickToDialRequest: {
      number: null,
      recordId: null,
      recordName: null,
      objectType: null,
    },

    callDisposition: {
      sfCallId: '',
      sessionId: '',
      calledNumber: '',
      callingCountrycode: '',
      callingNumber: '',
      leadId: '',
      contactId: '',
      opportunityId: '',
      projectId: '',
      tower: '',
      property: '',
      booking: '',
      broker: '',
      campaign: '',
      site: '',
      wasLeadIdNull: '',
      callStartDateTime: '',
      callEndDateTime: '',
      callDuration: '',
      comments: '',
      callTeam: '',
      callType: '',
      callStatus: '',
      agent: '',
      recordingURL: ''
    },
    timerControl: {
      acwTimer: {
        control: 0,
        state: 0,
        expiry: 60
      }
    }
  },

  sockets: {
    connect() {
      console.log("socket connected");
      this.$store.commit("socketConnected");
    },
    connect_error() {
      console.log("Connection Error for WebSocket");
      this.$store.commit("socketDisconnected");
    },
    connection_error() {
      console.log("Connection Timeout for WebSocket");
      this.$store.commit("socketDisconnected");
    }
  },

  mutations: {
    setLeadId(state, payload) {
      state.sfRecord.leadId = payload
      state.sfRecord.wasLeadIdNull = "no"
    },

    clickToDialPressed(state, payload) {
      state.call.state = CALL_STATES.RINGING
      state.call.customerNumber = payload.number
      state.call.direction = CALL_DIRECTION.OUTBOUND

      state.app.state = APP_STATES.CALL_DIALING
    },

    setClickToDialRequestPacket(state, payload) {
      state.clickToDialRequest = payload
      if (payload.objectType === "Lead") {
        state.sfRecord.leadId = payload.recordId
      }
      console.log("setClickToDialRequestPacket() commited packet. clickToDialRequest=" + state.clickToDialRequest)
    },
    updateAgentStatus(state, payload) {
      state.agent.status = payload
    },
    packCallDispositionObject(state) {
      state.callDisposition.sessionId = state.call.interactionId
      state.callDisposition.calledNumber = state.call.virtualNumber
      state.callDisposition.callingCountrycode = state.call.customerCountryCode
      state.callDisposition.callingNumber = state.call.customerNumber
      state.callDisposition.leadId = state.sfRecord.leadId
      state.callDisposition.contactId = null
      state.callDisposition.opportunityId = null
      state.callDisposition.projectId = state.sfRecord.projectId
      state.callDisposition.tower = null
      state.callDisposition.property = null
      state.callDisposition.booking = null
      state.callDisposition.broker = null
      state.callDisposition.campaign = null
      state.callDisposition.site = state.sfRecord.siteId
      state.callDisposition.wasLeadIdNull = state.sfRecord.wasLeadIdNull
      state.callDisposition.callStartDateTime = state.call.callStartDateTime
      state.callDisposition.callEndDateTime = state.call.callEndDateTime
      state.callDisposition.callDuration = state.call.callDuration
      state.callDisposition.callTeam = 'PMT'
      state.callDisposition.callType = state.call.direction
      state.callDisposition.callStatus = 'Answered'
      state.callDisposition.agent = state.agent.salesforceUserIdForAgent
      state.callDisposition.recordingURL = state.call.recordingURL

      console.log(state.callDisposition)
    },

    setAutoDisposedCallId(state, payload) {
      state.callDisposition.sfCallId = payload
    },
    setCallDirection(state, payload) {
      state.call.direction = payload
    },
    setCallRecordingId(state, payload) {
      state.call.recordingId = payload
    },
    setCallrecordingURL(state, payload) {
      state.call.recordingURL = payload
    },

    setCallNature(state, payload) {
      state.call.nature = payload
    },
    setCallDispositionComments(state, payload) {
      state.call.comments = payload
    },
    setSfRecordForCaller(state, payload) {
      state.sfRecord = payload
    },

    setSfNewLeadId(state, payload) {
      state.sfRecord.leadId = payload
    },

    setSfRecordForNewLeadCaller(state, payload) {
      state.sfRecord.campaignId = payload.campaignId
      state.sfRecord.wasLeadIdNull = 'yes'
    },

    setSfRecordForExistingLeadCaller(state, payload) {
      console.log("setSfRecordForExistingLeadCaller(): about to commit payload=", payload)
      state.sfRecord = payload.leads[0]
      state.sfRecord.wasLeadIdNull = 'no'
      console.log("setSfRecordForExistingLeadCaller(): set sfRecord=" + state.sfRecord)
    },

    setSfRecordForMultipleLeadCaller(state, payload) {
      state.sfRecord = payload
      state.sfRecord.wasLeadIdNull = 'no'
      //TODO: add commit logic for multiple leads
    },

    setSalesforceAgentId(state, payload) {
      state.agent.salesforceUserIdForAgent = payload;
    },
    setSessionParams(state, payload) {
      console.log("setSessionParams paylod=", payload)
      state.session.sessionId = payload.sessionId
      state.session.csrfToken = payload.csrfToken
      state.session.cookie = payload.cookie
      state.session.subscriptionId = payload.subscriptionId
    },
    removeSessionParams(state) {
      state.session.sessionId = null
      state.session.csrfToken = ''
      state.session.cookie = null
      state.session.subscriptionId = ''
      //localStorage.removeItem('sessionParams')
    },
    socketConnected() {
      console.log("socket connected")
    },


    startAcwTimer(state) {
      state.timerControl.acwTimer.control = TIMER_STATES.CONTROL.START
    },
    stopAcwTimer(state) {
      state.timerControl.acwTimer.control = TIMER_STATES.CONTROL.STOP
    },
    pauseAcwTimer(state) {
      state.timercontrol.acwTimer.control = TIMER_STATES.CONTROL.PAUSE
    },

    setTimerStateExpired(state, payload) {
      state.timerControl[payload].state = TIMER_STATES.EVENTS.EXPIRED
      state.timerControl[payload].control = TIMER_STATES.CONTROL.PAUSE
    },

    agentLogin(state, payload) {
      state.app.state = APP_STATES.LOGGED_IN
      state.agent.status = AGENT_STATES.LOGGED_IN

      state.agent.userId = payload.userId
      state.agent.station = payload.station
      state.agent.auxCodes = payload.auxCodes
    },

    agentLogout(state) {
      state.agent.status = AGENT_STATES.LOGGED_OUT
      state.app.state = APP_STATES.LOGGED_OUT
      state.agent.userId = ''
      state.agent.station = ''
      state.agent.auxCodes = []
      //localStorage.removeItem('loginRequest')
    },
    // updateAgentState(state, payload) {
    //   console.log("Store/Mutation/updateAgentState: payload=" + payload)
    //   state.agent.status = payload
    // },
    callAlerting(state) {
      state.call.
        state.app.state = APP_STATES.CALL_RINGING

    },

    callDropped(state) {
      //TODO: 
      if (state.app.state === APP_STATES.CALL_ANSWERED) {
        state.app.state = APP_STATES.AFTER_CALL_WORK
      } else if (state.app.state === APP_STATES.CALL_RINGING) {
        state.app.state = APP_STATES.AFTER_CALL_WORK

      } else if (state.app.state === APP_STATES.CALL_DIALING) {
        state.app.state = APP_STATES.AFTER_CALL_WORK
      }
    },

    callAnswered(state) {
      state.app.state = APP_STATES.CALL_ANSWERED
      // state.call.direction = CALL_DIRECTION.INBOUND
      // state.call.customerNumber = payload.cli
      // state.call.virtualNumber = payload.dnis
      //state.call.interactionId = payload.interactionId

    },
    acwEnded(state) {
      console.log("acwEnded() clearing Call Parameters and making them NULL")
      //clearing call data to make it ready for the next call
      for (var key in state.call) {
        state.call[key] = null;
      }

      for (var key in state.call) {
        state.sfRecord[key] = null;
      }

      state.app.state = APP_STATES.LOGGED_IN
      state.call.state = CALL_STATES.IDLE
      state.sfRecord.wasLeadIdNull = 'yes'
    },
    setCallStartTime(state, payload) {
      state.call.callStartDateTime = payload.toString()
    },
    setCallEndTime(state, payload) {
      state.call.callEndDateTime = payload.toString()
      state.call.callDuration = ((state.call.callEndDateTime - state.call.callStartDateTime) / 1000).toFixed(2);
    },

    setCallVirtualNumber(state, payload) {
      state.call.virtualNumber = payload
    },

    setCallCustomerNumber(state, payload) {

      state.call.customerNumber = ("" + (payload.areaCode ? payload.areaCode : '') + payload.number)
      state.call.customerCountryCode = "+" + payload.countryCode

    },

    setCallInteractionId(state, payload) {
      state.call.interactionId = payload
    },

    setTestEvent(state, payload) {
      state.app.state = APP_STATES.CALL_RINGING
      state.call.customerNumber = payload.agentLogin
    }
  },
  actions: {
    enableClickToDial() {
      sforce.opencti.enableClickToDial({
        callback: response => {
          if (response.success) {
            console.log(
              "enableClickToDial() successful returnValue:",
              response.returnValue
            );
          } else {
            console.error("enableClickToDial() failed. Errors:", response.errors);
          }
        }
      });
    },
    disableClickToDial() {
      sforce.opencti.disableClickToDial({
        callback: response => {
          if (response.success) {
            console.log(
              "disableClickToDial() successful returnValue:",
              response.returnValue
            );
          } else {
            console.error("disableClickToDial() failed. Errors:", response.errors);
          }
        }
      });
    },
    processAgentLogin(context, loginpacket) {
      console.log("processAgentLogin sessionParams=", loginpacket.sessionParams)
      context.commit("agentLogin", loginpacket.loginRequest);
      context.commit("setSessionParams", loginpacket.sessionParams);
      context.dispatch("enableClickToDial")

    },
    processAgentLogout(context) {
      context.commit("agentLogout");
      context.commit("removeSessionParams");
      context.dispatch("disableClickToDial")

      window.localStorage.removeItem('vuex');
    },
    endAcwState(context) {
      context.commit('stopAcwTimer')
      context.commit('acwEnded')
    },


    SOCKET_AGENT_LOGGED_IN(context, payload) {
      console.log("SOCKET_AGENT_LOGGED_IN()")
    },
    SOCKET_AGENT_LOGGED_OUT(context, payload) {
      console.log("SOCKET_AGENT_LOGGED_OUT()")
      context.dispatch("processAgentLogout")
    },

    SOCKET_readyForCalls_Resp(context, payload) {
      console.log("SOCKET_readyForCalls_Resp(): event received. payload=", payload)
    },


    SOCKET_connectionStateChangeMessage() {
      //console.log(payload);
    },

    //Socket events sent by ICWS through the ICWS Connector whenever user status changes
    SOCKET_userStatusMessage(context, payload) {
      //console.log(payload);
      if (payload.userStatusList.length > 0) {
        let agentStatus = payload.userStatusList[0].statusId
        if (agentStatus) {
          context.commit('updateAgentStatus', agentStatus)
        }
      }

    },
    //Socket events sent by ICWS through the ICWS Connector
    SOCKET_queueContentsMessage(context, payload) {
      let callStateString = "";
      let callState = "";
      let cli = "";
      let dnis = "";
      let interactionId = "";
      let recordingId = "";
      if (payload.interactionsChanged) {
        if (payload.interactionsChanged.length > 0) {

          callStateString = payload.interactionsChanged[0].attributes.Eic_CallStateString
          callState = payload.interactionsChanged[0].attributes.Eic_CallState
          console.log("SOCKET_queueContentsMessage(): Event received for interactionsChanged: " + "callState=" + (callState ? callState : '-') + ", callStateString=" + (callStateString ? callStateString : '-'))
          recordingId = payload.interactionsChanged[0].attributes.Eic_IRRecordingId
          if (recordingId) {
            console.log("SOCKET_queueContentsMessage(): setting recordingId=" + recordingId)
            this.commit('setCallRecordingId', recordingId)
          } else {
            console.log("SOCKET_queueContentsMessage(): recordingId was not received in the event")
          }
        }
      }

      if (payload.interactionsAdded) {

        if (payload.interactionsAdded.length > 0 && callState !== "Disconnected") {
          callState = payload.interactionsAdded[0].attributes.Eic_CallState
          callStateString = payload.interactionsAdded[0].attributes.Eic_CallStateString
          console.log("SOCKET_queueContentsMessage(): Event received for interactionsAdded: " + "callState" + callState ? callState : '-' + "callStateString=" + callStateString ? callStateString : '-')

          //split the number by ':' first, then by '@'
          interactionId = payload.interactionsAdded[0].interactionId
          if (interactionId !== '') {
            console.log("SOCKET_queueContentsMessage(): commiting call state values: interactionId=" + interactionId)
            this.commit('setCallInteractionId', interactionId)
          }

          let dnisColonArray = payload.interactionsAdded[0].attributes.Eic_LocalTnRaw.split(":")
          let dnisAtArray = dnisColonArray.length > 0 ? dnisColonArray[dnisColonArray.length > 1 ? 1 : 0] : ''
          dnis = (dnis.length > 0) ? dnis : (dnisAtArray.split("@")[0])
          if (dnis !== '') {
            console.log("SOCKET_queueContentsMessage(): commiting call state values: dnis=" + dnis)
            //TODO: IMPORTANT: the next line is only for testing. comment it after the test is complete
            // dnis = '02268630702'

            this.commit('setCallVirtualNumber', dnis)
          }

          let cliColonArray = payload.interactionsAdded[0].attributes.Eic_RemoteTnRaw.split(":")
          let cliAtArray = cliColonArray.length > 0 ? cliColonArray[cliColonArray.length > 1 ? 1 : 0] : ''
          cli = (cli.length > 0) ? cli : (cliAtArray.split("@")[0])
          if (cli !== '') {

            let parsedCli = parsePhone(cli)
            console.log("SOCKET_queueContentsMessage(): commiting call state values: cli=" + cli)
            console.log("SOCKET_queueContentsMessage(): areaCode = " + parsedCli.areaCode)
            console.log("SOCKET_queueContentsMessage(): number = " + parsedCli.number)
            console.log("SOCKET_queueContentsMessage(): countryCode = " + parsedCli.countryCode)

            this.commit('setCallCustomerNumber', parsedCli)
          }

          recordingId = payload.interactionsAdded[0].attributes.Eic_IRRecordingId
          if (recordingId) {
            console.log("SOCKET_queueContentsMessage(): setting recordingId=" + recordingId)
            this.commit('setCallRecordingId', recordingId)
          } else {
            console.log("SOCKET_queueContentsMessage(): recordingId was not received in the event")
          }

        }
      }
      else if (payload.interactionsAdded) {
        if (payload.interactionsAdded.length > 0) {
          console.log("interaction added")
        }
      }

      if (callStateString) {

        switch (callStateString) {
          case "Initializing":
          case "Dialing":
            console.log("SOCKET_queueContentsMessage() Socket message received for callStateString = " + callStateString)
            if (this.state.call.direction === null) {
              this.commit("setCallDirection", CALL_DIRECTION.OUTBOUND)
            }

            break;

          case "Alerting":
            console.log("SOCKET_queueContentsMessage() Socket message received for callStateString = " + callStateString)
            this.commit('callAlerting')
            //this.commit('setCallStartTime', new Date().valueOf())
            if (this.state.call.direction === null) {
              this.commit("setCallDirection", CALL_DIRECTION.INBOUND)
            }

            break;
          case "Offering":
            console.log("SOCKET_queueContentsMessage() Socket message received for callStateString = " + callStateString)
            if (this.state.call.direction === null) {
              let callPurpose = payload.interactionsAdded[0].attributes.Eic_CallPurpose

              if (callPurpose === CALL_NATURE.DIALER) {
                this.commit("setCallDirection", CALL_DIRECTION.OUTBOUND)
                this.commit("setCallNature", CALL_NATURE.DIALER)
              } else {
                this.commit("setCallDirection", CALL_DIRECTION.INBOUND)
              }

            }
          case "Connected":
            console.log("SOCKET_queueContentsMessage() Socket message received for callStateString = " + callStateString)
            this.commit('callAnswered')
            if (this.state.call.callStartDateTime === null) {
              this.commit('setCallStartTime', new Date().valueOf())
            }

            break;

          case "Disconnected [Remote Disconnect]":
          case "Disconnected [Local Disconnect]":
          case "Disconnected (Insufficient Dialing Privileges)":
          case "Disconnected [Local Hang Up]":
            console.log("SOCKET_queueContentsMessage() Socket message received for callStateString = " + callStateString)
            this.commit('callDropped')
            this.commit('setCallEndTime', new Date().valueOf())
            break;



          default:
          // code block
        }
      }

    }
  },

})