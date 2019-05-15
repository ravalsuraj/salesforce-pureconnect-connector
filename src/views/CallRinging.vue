<template>
  <div class="d-flex flex-column align-items-center justify-content-around mt-4">
    <div v-if="isInboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold green-text">Inbound Call Ringing</h4>
      <h4>{{sfRecord.recordName}}</h4>

      <mdb-btn
        v-if="isInboundCall"
        class="success-color"
        @click="sendTelephonyControlRequest('answer')"
      >Answer</mdb-btn>
    </div>
    <div v-if="isOutboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold light-blue-text">Outbound Call Dialing</h4>
      <h4>{{clickToDialRequest.recordName}}</h4>
    </div>

    <div v-if="isCampaignCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold light-blue-text">Campaign Call Ringing</h4>
      <h4>{{sfRecord.recordName}}</h4>
    </div>

    <mdb-alert :color="loginAlert.color" v-if="loginAlert.show">{{loginAlert.message}}</mdb-alert>
  </div>
</template>

<script>
/* eslint-disable */
import { mdbBtn, mdbAlert } from "mdbvue";
import { CALL_DIRECTION, CALL_NATURE } from "@/defines.js";
import IcwsConnector from "@/services/icwsConnector.js";
export default {
  name: "CallRinging",
  components: { mdbBtn, mdbAlert },
  mounted() {
    this.showSoftphone();
    if (this.isInboundCall || this.isCampaignCall) {
      // this.sendTelephonyControlRequest("answer");
    } else if (this.isOutboundCall) {
      console.log("CallRinging mounted for OutboundCall");
    }
  },
  props: {},

  data() {
    return {
      loginAlert: {
        message: "",
        color: "",
        show: false
      }
    };
  },
  methods: {
    showSoftphone() {
      sforce.opencti.setSoftphonePanelVisibility({
        visible: true,
        callback: callback
      });
      var callback = response => {
        if (response.success) {
          console.log(
            "showSoftphone(): call executed successfully! returnValue:",
            response.returnValue
          );
        } else {
          console.error("showSoftphone(): Errors:", response.errors);
        }
      };
    },
    sendTelephonyControlRequest(controlType) {
      this.icwsControlRequestParams.controlType = controlType;
      console.log(
        " sendTelephonyControlRequest():  sending call control request with request=" +
          JSON.stringify(this.icwsControlRequestParams)
      );
      IcwsConnector.callControlRequest(this.icwsControlRequestParams)
        .then(resp => {
          console.log(
            " sendTelephonyControlRequest(): response successful. resp=" +
              JSON.stringify(resp.data)
          );

          if (resp.data.responseCode === 0) {
            console.log(" sendTelephonyControlRequest(): response code is 0");
            if (this.isOutboundCall) {
              this.$store.dispatch("endAcwState");
            }

            console.log(
              " sendTelephonyControlRequest():  Successful" +
                JSON.stringify(resp)
            );
          } else {
            console.log(
              " sendTelephonyControlRequest():  Failed" + JSON.stringify(resp)
            );
            this.showAlert("danger", JSON.stringify(resp.body.message));
          }
        })
        .catch(error => {
          console.log(
            " sendTelephonyControlRequest(): response failed: " +
              JSON.stringify(error)
          );
        })
        .finally(() => {});
    },
    hideAlert() {
      this.loginAlert.message = "";
      this.loginAlert.color = "";
      this.loginAlert.show = false;
    },
    showAlert(color, message) {
      this.loginAlert.message = message;
      this.loginAlert.color = color;
      this.loginAlert.show = true;
    }
  },
  computed: {
    icwsControlRequestParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        subscriptionId: this.$store.state.session.subscriptionId,
        interactionId: this.$store.state.call.interactionId
      };
    },
    cli() {
      return this.$store.state.call.customerNumber;
    },
    dnis() {
      return this.$store.state.call.virtualNumber;
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
    },
    sfRecord() {
      return this.$store.state.sfRecord;
    },
    clickToDialRequest() {
      return this.$store.state.clickToDialRequest;
    }
  }
};
</script>
