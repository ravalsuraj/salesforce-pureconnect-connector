<template>
  <div class="d-flex flex-column align-items-center justify-content-around mt-4">
    <div v-if="isInboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold green-text">Inbound Call Answered</h4>
      <h4 class>{{sfRecord.recordName}}</h4>
    </div>

    <div v-if="isCampaignCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold green-text">Campaign Call Connected</h4>
      <h4 class>{{sfRecord.recordName}}</h4>
    </div>

    <div v-if="isOutboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold light-blue-text">Outbound Call Answered</h4>
      <h4 class>{{clickToDialRequest.recordName}}</h4>
    </div>
    <mdb-col col="8">
      <mdb-btn
        class="danger-color btn-block mb-3"
        size="sm"
        @click="sendTelephonyControlRequest('disconnect')"
      >Disconnect</mdb-btn>
      <mdb-btn
        class="special-color btn-block mb-3"
        size="sm"
        @click="sendTelephonyControlRequest('hold')"
      >Hold</mdb-btn>
      <mdb-btn
        class="mdb-color btn-block mb-3"
        size="sm"
        @click="sendTelephonyControlRequest('unhold')"
      >Unhold</mdb-btn>
    </mdb-col>
    <mdb-alert :color="loginAlert.color" v-if="loginAlert.show">{{loginAlert.message}}</mdb-alert>
  </div>
</template>

<script>
import {
  mdbContainer,
  mdbRow,
  mdbCol,
  mdbBtn,
  mdbCard,
  mdbCardBody,
  mdbCardHeader,
  mdbCardText,
  mdbInput,
  mdbIcon,
  mdbAlert
} from "mdbvue";
import {
  AGENT_STATES,
  CALL_STATES,
  CALL_DIRECTION,
  CALL_NATURE
} from "@/defines.js";
import IcwsConnector from "@/services/icwsConnector.js";
export default {
  name: "CallAnswered",
  components: {
    mdbContainer,
    mdbRow,
    mdbCol,
    mdbBtn,
    mdbCard,
    mdbCardBody,
    mdbCardHeader,
    mdbCardText,
    mdbInput,
    mdbIcon,
    mdbAlert
  },
  mounted() {
    if (this.isInboundCall || this.isCampaignCall) {
      this.fetchLeadFromCli();
    } else if (this.isOutboundCall) {
      this.screenPopOutboundLead();
    } else {
      console.log("mounted(): call is neither inbound nor outbound");
    }
  },
  props: {},

  data() {
    return {
      showAgentNotReadyError: false,
      showWidget: true,

      loginAlert: {
        message: "",
        color: "",
        show: false
      }
    };
  },
  methods: {
    sendTelephonyControlRequest(controlType) {
      this.icwsControlRequestParams.controlType = controlType;
      IcwsConnector.callControlRequest(this.icwsControlRequestParams)
        .then(resp => {
          console.log(
            "sendTelephonyControlRequest(): response successful. resp.data=",
            resp.data
          );

          if (resp.data.responseCode === 0) {
            console.log("sendTelephonyControlRequest(): response code is 0");

            console.log("sendTelephonyControlRequest() Successful", resp);
          } else {
            console.log("sendTelephonyControlRequest() Failed", resp);
            this.ShowAlert("danger", JSON.stringify(resp));
          }
        })
        .catch(error => {
          console.log(
            "sendTelephonyControlRequest(): response failed: ",
            error
          );
        })
        .finally(() => {});
    },

    //Call OPENCTI RunApex method. CTI_Helper class with doPost method created by IBM,
    //to get lead ID from CLI and DNIS (customerNumber and virtualNumber)
    //TODO: add country code
    fetchLeadFromCli() {
      //build the input arguments
      let methodParams =
        "virtualNumberCalled=" +
        this.virtualNumber +
        "&callerPhoneCountryCode=" +
        this.countryCode +
        "&callerPhoneNumber=" +
        this.customerNumber;
      console.log(
        "CTI_Helper/doPost(): Calling runApex with methodParams=" + methodParams
      );
      var param = {
        apexClass: "CTIHelper_PMT",
        methodName: "doPost",
        methodParams: methodParams
      };

      //callback function once the apex method returns something
      param.callback = response => {
        if (response.success) {
          //parsing the response since runApex returns a JSON string
          let jsonResp = JSON.parse(response.returnValue.runApex);

          console.log(
            "CTIHelper_PMT/doPost(): response successful. response.returnValue=",
            jsonResp
          );

          if (!jsonResp.leads) {
            //Caller is a new lead.
            console.log(
              "CTIHelper_PMT/doPost(): CTI helper returned results for NEW LEAD"
            );
            this.$store.commit("setSfRecordForNewLeadCaller", jsonResp);
            //if new lead, create the lead in salesforce, then run the screenpop method inside the createLead method
            this.createAndScreenPopNewLead(jsonResp);
          } else if (jsonResp.leads.length === 1) {
            console.log(
              "CTIHelper_PMT/doPost(): CTI helper returned results for SINGLE EXISTING LEAD"
            );

            //Commit existing lead details and screenpop existing lead
            this.$store.commit("setSfRecordForExistingLeadCaller", jsonResp);
            this.updateAndScreenPopExistingLead(jsonResp.leads[0].leadId);
          } else if (jsonResp.leads.length > 1) {
            console.log(
              "CTIHelper_PMT/doPost(): CTI helper returned results for MULTIPLE EXISTING LEADS"
            );
            this.$store.commit("setSfRecordForMultipleLeadCaller", jsonResp);
            this.screenPopMultipleLeads(jsonResp);
          } else {
            console.error(
              "CTIHelper_PMT/doPost(): CTI helper returned improper result: ",
              jsonResp
            );
          }
        } else {
          console.error(
            "CTI_Helper/doPost(): response failure. response.errors=",
            response.errors
          );
        }
      };
      //Invokes API method
      sforce.opencti.runApex(param);
    },

    screenPopOutboundLead() {
      if (
        this.clickToDialRequest.recordId &&
        this.clickToDialRequest.objectType
      ) {
        this.screenPopExistingLead(
          this.clickToDialRequest.recordId,
          this.clickToDialRequest.objectType
        );
      } else {
        this.showAlert(
          "danger",
          "Click To Dial did not return a valid record ID and record Type"
        );
      }
    },
    createAndScreenPopNewLead(record) {
      let newLeadPacket = {
        FirstName: "New",
        LastName: "CTI Lead",
        MobilePhone: this.customerNumber,
        Campaign__c: record.campaignId,
        Country_Code__c: this.countryCode,
        Virtual_Number_Text__c: this.virtualNumber,
        Lead_Stage__c: "Open",
        LeadSource: "Virtual No."
      };
      console.log(
        "createAndScreenPopNewLead(): request packet updated. strLeadInput=",
        newLeadPacket
      );
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "createLead",
        methodParams: "strLeadInput=" + JSON.stringify(newLeadPacket)
      };
      param.callback = response => {
        console.log(response);
        if (response.returnValue) {
        } else {
        }

        if (response.success && response.returnValue) {
          let jsonResp = JSON.parse(response.returnValue.runApex);
          console.log(
            "createAndScreenPopNewLead(): response successful. response.returnValue="
          );
          console.log(jsonResp);
          this.$store.commit("setSfNewLeadId", jsonResp.Id);

          this.screenPopExistingLead(jsonResp.Id, "Lead");
        } else {
          console.error(
            "createAndScreenPopNewLead(): response failure. response.errors=",
            response.errors
          );
          if (
            response.errors[0].description.includes(
              "Unidentified Virtual Number"
            )
          ) {
            this.showAlert(
              "danger",
              "Error: Virtual Number not found in Salesforce"
            );
          } else {
            this.showAlert("danger", response.errors[0].description);
          }
        }
      };

      //Invokes API method
      sforce.opencti.runApex(param);
    },
    updateAndScreenPopExistingLead(leadId) {
      let methodParams =
        "leadIdToUpdate=" +
        leadId +
        "&virtualNumberToUpdate=" +
        this.virtualNumber;
      console.log(
        "calling CTI_OpenCTIConnector/updateLead with methodParams= " +
          methodParams
      );
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "updateLead",
        methodParams: methodParams
      };
      param.callback = response => {
        console.log(response);
        let jsonResp = JSON.parse(response.returnValue.runApex);
        if (response.success) {
          console.log(
            "updateAndScreenPopExistingLead(): response successful. response.returnValue="
          );
          this.screenPopExistingLead(leadId, "Lead");
        } else {
          console.error(
            "updateAndScreenPopExistingLead(): response failure. response.errors=",
            response.errors
          );
        }
      };
      //Invokes API method
      sforce.opencti.runApex(param);
    },
    screenPopNewLead(record) {
      console.log("screenPopNewLead(record) entered with lead", record);
      sforce.opencti.screenPop({
        type: sforce.opencti.SCREENPOP_TYPE.NEW_RECORD_MODAL,
        params: {
          entityName: "Lead",
          defaultFieldValues: {
            FirstName: "New",
            LastName: "CTI Lead",
            MobilePhone: this.customerNumber,
            Campaign__c: record.campaignId,
            Country_Code__c: "+" + this.countryCode,
            Virtual_Number_Text__c: this.virtualNumber
          }
        },
        callback: callback
      });
      var callback = response => {
        if (response.success) {
          console.log(
            "CallAnswered.vue/screenPopNewLead() successful. returnValue:",
            response.returnValue
          );
        } else {
          console.error(
            "CallAnswered.vue/screenPopNewLead() failed. error:",
            response.errors
          );
        }
      };
    },
    screenPopExistingLead(leadId, objectType) {
      console.log(
        "CallAnswered.vue/screenPopExistingLead() : entered the function"
      );
      sforce.opencti.screenPop({
        type: sforce.opencti.SCREENPOP_TYPE.SOBJECT,
        params: {
          recordId: leadId,
          entityName: objectType
          //defaultFieldValues: { Phone: this.customerNumber }
        },
        callback: callback
      });
      var callback = response => {
        if (response.success) {
          console.log(
            "CallAnswered.vue/screenPopExistingLead() successful. returnValue:",
            response.returnValue
          );
        } else {
          console.error(
            "CallAnswered.vue/screenPopExistingLead() failed. error:",
            response.errors
          );
        }
      };
    },

    screenPopMultipleLeads(records) {
      sforce.opencti.screenPop({
        type: sforce.opencti.SCREENPOP_TYPE.SOBJECT,
        params: {
          recordId: jsonResp.leads[0].leadId,
          entityName: "Lead"
          //defaultFieldValues: { Phone: this.customerNumber }
        },
        callback: callback
      });
      var callback = response => {
        if (response.success) {
          console.log(
            "CallAnswered.vue/screenPopExistingLead() successful. returnValue:",
            response.returnValue
          );
        } else {
          console.error(
            "CallAnswered.vue/screenPopExistingLead() failed. error:",
            response.errors
          );
        }
      };
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
        interactionId: this.$store.state.call.interactionId,
        subscriptionId: this.$store.state.session.subscriptionId
      };
    },
    customerNumber() {
      return this.$store.state.call.customerNumber;
    },
    countryCode() {
      return this.$store.state.call.customerCountryCode;
    },
    virtualNumber() {
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
    clickToDialRequest() {
      return this.$store.state.clickToDialRequest;
    },
    sfRecord() {
      return this.$store.state.sfRecord;
    }
  }
};
</script>