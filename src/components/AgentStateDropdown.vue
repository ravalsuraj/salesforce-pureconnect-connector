<template>
  <mdb-container class="form form-inline d-flex align-items-center">
    <mdb-dropdown class="mr-5">
      <a class="dropdown-toggle-a primary-text" slot="toggle">
        <mdb-icon icon="circle" :class="getAgentStateColor(activeAgentState)" class="mr-1"/>
        {{activeAgentState}}
      </a>
      <mdb-dropdown-menu left>
        <!-- <mdb-dropdown-item class="p-0 fl_dropdown_item" v-if="activeReasonIndex!==0">
          <div @click="agentStateChangeRequest(0)" class="p-2">
            <mdb-icon icon="circle" class="green-text mr-1"/>
            <span>Ready</span>
          </div>
        </mdb-dropdown-item>-->

        <!--
  v-if="showReasonCode(i)"
:key="reasonCode.id"
        -->
        <mdb-dropdown-item
          class="p-0 fl_dropdown_item"
          v-for="(statusMessage) in statusMessages"
          :key="statusMessage.id"
        >
          <div @click="agentStateChangeClicked(statusMessage)" class="p-2">
            <mdb-icon icon="circle" class="mr-1" :class="getAgentStateColor(statusMessage)"/>
            <span>{{statusMessage}}</span>
          </div>
        </mdb-dropdown-item>
      </mdb-dropdown-menu>
    </mdb-dropdown>
  </mdb-container>
</template>

<script>
import IcwsConnector from "@/services/icwsConnector.js";

import {
  mdbContainer,
  mdbDropdown,
  mdbDropdownItem,
  mdbDropdownMenu,
  mdbIcon
} from "mdbvue";
export default {
  name: "AgentStateDropdown",
  components: {
    mdbContainer,
    mdbIcon,
    mdbDropdown,
    mdbDropdownItem,
    mdbDropdownMenu
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    getAgentStateColor(state) {
      let color = "red-text";
      if (state !== undefined) {
        if (state.includes("Available")) {
          color = "green-text";
        }
      }
      return color;
    },

    //This Method is called whenever the Agent Dropdown option is changed
    agentStateChangeClicked(statusMessage) {
      let updateStateRequest = this.updateStateSessionParams;
      updateStateRequest.statusId = statusMessage;
      IcwsConnector.agentStateChangeRequest(updateStateRequest)
        .then(resp => {
          console.log(
            "agentStateChangeRequestClicked(): response received: ",
            resp
          );

          //resp.responseCode is correct
          if (resp.responseCode === 0) {
            console.log(
              "agentStateChangeRequestClicked() agentStateChangeRequest Successful",
              resp
            );
            //this.$store.commit("agentStateChangeRequest", statusMessage);
          } else {
            console.log(
              "agentStateChangeRequestClicked() agentStateChangeRequest Failed",
              resp
            );
          }
        })
        .catch(error => {
          console.log(
            "agentStateChangeRequestClicked(): response failed: " +
              JSON.stringify(error)
          );
        })
        .finally(() => {});
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
    activeAgentState() {
      return !this.$store.state.agent.status !== undefined
        ? this.$store.state.agent.status
        : "Not Set";
    },
    statusMessages() {
      return this.$store.state.agent.auxCodes;
    }
  }
};
</script>

<style scoped>
.fl_dropdown_item {
  font-size: 1rem !important;
}
.drop .dropdown-toggle-a {
  background-color: none;
}
.dropdown-toggle-a:after {
  display: inline-block;
  margin-left: 0.255em;
  vertical-align: 0.255em;
  content: "";
  border-top: 0.3em solid;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
}
.custom-select {
  height: unset !important;
  line-height: 1;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
