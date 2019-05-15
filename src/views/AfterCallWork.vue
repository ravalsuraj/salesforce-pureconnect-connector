<template>
  <div class="d-flex flex-column align-items-center justify-content-around mt-4">
    <div class="d-flex justify-content-between w-100">
      <h4 class="font-weight-bold">Dispose Call</h4>
      <h5 class>
        Time Left:
        <timer :name="timerName" mode="countdown"></timer>
      </h5>
    </div>

    <div class="form-group mt-1 w-100">
      <textarea
        class="form-control"
        id="inpCallDispositionComments"
        rows="5"
        v-model="inpComments"
        placeholder="no comments set"
      ></textarea>
    </div>
    <mdb-btn block color="mdb-color" @click="manualDisposeCall">Dispose</mdb-btn>
  </div>
</template>

<script>
/* eslint-disable */
import Timer from "@/components/Timer.vue";
import { TIMER_STATES, CALL_DIRECTION, CALL_NATURE } from "@/defines.js";
import IcwsConnector from "@/services/icwsConnector.js";
import { mdbBtn } from "mdbvue";
//import { AGENT_STATES, CALL_STATES } from "@/defines.js";

export default {
  name: "AfterCallWork",
  components: {
    Timer,
    mdbBtn
  },
  mounted() {
    this.fetchRecordingUrl();
    this.$store.commit("startAcwTimer");
    //this.autoDisposeCall();
  },
  props: {},

  data() {
    return {
      inpComments: "",
      timerName: "acwTimer"
    };
  },
  methods: {
    fetchRecordingUrl() {
      let fullRequestParams = this.requestHeaderParams;
      fullRequestParams.recordingId = this.recordingId;
      console.log(
        "fetchRecordingUrl(): making a call to IcwsConnector with request=",
        fullRequestParams
      );
      IcwsConnector.fetchRecordingUrl(fullRequestParams)
        .then(resp => {
          console.log(
            "fetchRecordingUrl(): request made resp=",
            resp.data.body
          );

          if (resp.data.responseCode === 0) {
            console.log(
              "fetchRecordingUrl(): Successful resp.data.responseCode=",
              resp.data.responseCode
            );
            this.$store.commit("setCallrecordingURL", resp.data.body.uri);
          } else {
            console.log("fetchRecordingUrl(): Failed resp=", resp);
          }
        })
        .catch(error => {
          console.log("fetchRecordingUrl(): response failed: ", error);
        })
        .finally(() => {
          this.autoDisposeCall();
        });
    },
    autoDisposeCall() {
      this.$store.commit("packCallDispositionObject");
      this.autoDisposeCallOnSalesforce();
    },

    manualDisposeCall() {
      this.$store.commit("stopAcwTimer");
      this.$store.commit("setCallDispositionComments", this.inpComments);
      //this.$store.commit("packCallDispositionObject");
      this.updateCallDispositionWithComments();
      if (this.isCampaignCall) {
        this.disposeCallOnDialer();
      } else {
        this.disposeCallOnGenesys();
      }
    },

    disposeCallOnGenesys() {
      let fullRequestParams = this.requestHeaderParams;
      fullRequestParams.interactionId = this.interactionId;
      fullRequestParams.wrapupCode = "success";
      //call/:interactionId/code/:wrapupCode/wrapup
      IcwsConnector.sendWrapUpRequestToGenesys(fullRequestParams)
        .then(resp => {
          console.log(
            "disposeCallOnGenesys(): response successful. resp=",
            resp
          );

          if (resp.data.responseCode === 0) {
            console.log(
              "disposeCallOnGenesys(): Response Successful. resp=",
              resp
            );
            this.$store.dispatch("endAcwState");
          } else {
            console.log("disposeCallOnGenesys(): Response Failed. resp=", resp);
            this.$store.dispatch("endAcwState");
          }
        })
        .catch(error => {
          console.log("disposeCallOnGenesys(): error: ", error);
        })
        .finally(() => {});
    },

    disposeCallOnDialer() {
      let fullRequestParams = this.requestHeaderParams;
      fullRequestParams.userId = this.userId;
      fullRequestParams.wrapupCode = "success";
      //call/:interactionId/code/:wrapupCode/wrapup
      IcwsConnector.sendWrapUpRequestToDialer(fullRequestParams)
        .then(resp => {
          console.log(
            "disposeCallOnDialer(): response successful. resp=",
            resp
          );

          if (resp.data.responseCode === 0) {
            console.log(
              "disposeCallOnDialer(): Response Successful. resp=",
              resp
            );
            this.setAgentStateToAvailable("Available");
            this.$store.dispatch("endAcwState");
          } else {
            console.log("disposeCallOnDialer(): Response Failed. resp=", resp);
            this.$store.dispatch("endAcwState");
          }
        })
        .catch(error => {
          console.log("disposeCallOnDialer(): error: ", error);
        })
        .finally(() => {});
    },
    setAgentStateToAvailable(statusMessage) {
      let updateStateRequest = this.updateStateSessionParams;
      updateStateRequest.statusId = statusMessage;
      IcwsConnector.agentStateChangeRequest(updateStateRequest)
        .then(resp => {
          console.log(
            "setAgentStateToAvailable(): response received: ",
            resp
          );

          //resp.responseCode is correct
          if (resp.responseCode === 0) {
            console.log(
              "setAgentStateToAvailable() agentStateChangeRequest Successful",
              resp
            );
            //this.$store.commit("agentStateChangeRequest", statusMessage);
          } else {
            console.log(
              "setAgentStateToAvailable() agentStateChangeRequest Failed",
              resp
            );
          }
        })
        .catch(error => {
          console.log(
            "setAgentStateToAvailable(): response failed: " +
              JSON.stringify(error)
          );
        })
        .finally(() => {});
    },
    autoDisposeCallOnSalesforce() {
      // return new Promise((resolve, reject) => {});

      console.log(
        "autoDisposeCallOnSalesforce(): callDispositionPacket=",
        this.callDispositionPacket
      );
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "disposeFullCall",
        methodParams: "jsonInput=" + JSON.stringify(this.callDispositionPacket)
      };
      param.callback = response => {
        if (response.success) {
          console.log(
            "autoDisposeCallOnSalesforce(): response successful. response=",
            response
          );
          console.log(
            "autoDisposeCallOnSalesforce(): Call Disposition ID=" +
              JSON.parse(response.returnValue.runApex).id
          );

          this.$store.commit(
            "setAutoDisposedCallId",
            JSON.parse(response.returnValue.runApex).id
          );
        } else {
          console.error(
            "autoDisposeCallOnSalesforce(): response failure. response.errors=",
            response.errors
          );
        }
      };
      //Invokes API method
      sforce.opencti.runApex(param);
    },
    updateCallDispositionWithComments() {
      // return new Promise((resolve, reject) => {});

      console.log(
        "updateCallDispositionWithComments(): autoDisposedCallId=",
        this.autoDisposedCallId
      );
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "updateCallWithComments",
        methodParams:
          "callIdToUpdate=" +
          this.autoDisposedCallId +
          "&callComments=" +
          this.callDispositionComments
      };
      param.callback = response => {
        if (response.success) {
          console.log(
            "updateCallDispositionWithComments(): response successful. response.returnValue=",
            response.returnValue.runApex.Id
          );
          console.log(
            "updateCallDispositionWithComments(): Call Disposition ID=",
            response.returnValue.runApex.Id
          );
        } else {
          console.error(
            "updateCallDispositionWithComments(): response failure. response.errors=",
            response.errors
          );
        }
      };
      //Invokes API method
      sforce.opencti.runApex(param);
    }
  },
  computed: {
    updateStateSessionParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        subscriptionId: this.$store.state.session.subscriptionId,
        userId: this.$store.state.agent.userId
      };
    },
    callDispositionPacket() {
      return this.$store.state.callDisposition;
    },

    autoDisposedCallId() {
      return this.callDispositionPacket.sfCallId;
    },

    callDispositionComments() {
      return this.callDispositionPacket.comments;
    },
    timerState() {
      return this.$store.state.timerControl[this.timerName].state;
    },
    requestHeaderParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        subscriptionId: this.$store.state.session.subscriptionId
      };
    },

    recordingId() {
      return this.$store.state.call.recordingId;
    },
    interactionId() {
      return this.$store.state.call.interactionId;
    },
    userId() {
      return this.$store.state.agent.userId;
    },
    callDirection() {
      return this.$store.state.call.direction;
    },
    isInboundCall() {
      return this.callDirection === CALL_DIRECTION.INBOUND;
    },
    isOutboundCall() {
      return (
        this.callDirection === CALL_DIRECTION.OUTBOUND &&
        this.$store.state.call.nature !== CALL_NATURE.DIALER
      );
    },

    isCampaignCall() {
      return (
        this.callDirection === CALL_DIRECTION.OUTBOUND &&
        this.$store.state.call.nature === CALL_NATURE.DIALER
      );
    }
  },
  watch: {
    timerState(newTimerState, oldTimerState) {
      console.log(
        "timer state changed from " + oldTimerState + "to " + newTimerState
      );
      if (
        oldTimerState !== TIMER_STATES.EVENTS.EXPIRED &&
        newTimerState === TIMER_STATES.EVENTS.EXPIRED
      ) {
        this.autoDisposeCall();
      }
    }
  }
};
</script>