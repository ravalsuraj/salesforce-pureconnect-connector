
<template>
  <mdb-container fluid class="h-100">
    <transition name="component-fade" mode="out-in">
      <component v-bind:is="currentView"></component>
    </transition>
  </mdb-container>
</template>

<script>
import Login from "@/views/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import CallRinging from "@/views/CallRinging.vue";
import CallAnswered from "@/views/CallAnswered.vue";
import AfterCallWork from "@/views/AfterCallWork.vue";
import OutboundCallRinging from "@/views/OutboundCallRinging.vue";
import { mdbContainer } from "mdbvue";
import { APP_STATES } from "@/defines.js";
export default {
  name: "MainContent",
  components: {
    mdbContainer,
    Login,
    Dashboard,
    CallAnswered,
    AfterCallWork,
    OutboundCallRinging
  },
  data() {
    return {};
  },
  computed: {
    currentView() {
      switch (this.appState) {
        case APP_STATES.LOGGED_IN:
          return Dashboard;

        case APP_STATES.LOGGED_OUT:
          return Login;

        case APP_STATES.CALL_RINGING:
          return CallRinging;

        case APP_STATES.CALL_ANSWERED:
          return CallAnswered;

        case APP_STATES.AFTER_CALL_WORK:
          return AfterCallWork;

        case APP_STATES.CALL_DIALING:
          return CallRinging;

        default:
          return Login;
      }
    },
    appState() {
      return this.$store.state.app.state;
    },
    appState_loggedIn() {
      return this.appState === APP_STATES.LOGGED_IN;
    },
    appState_loggedOut() {
      return this.appState === APP_STATES.LOGGED_OUT;
    },

    appState_callRinging() {
      return this.appState === APP_STATES.CALL_RINGING;
    },

    appState_callAnswered() {
      return this.appState === APP_STATES.CALL_ANSWERED;
    },
    appState_afterCallWork() {
      return this.appState === APP_STATES.AFTER_CALL_WORK;
    },
    appState_outboundCallRinging() {
      return this.appState === APP_STATES.CALL_DIALING;
    }
  }
};
</script>

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
