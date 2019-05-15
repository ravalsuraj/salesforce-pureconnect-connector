<template>
  <div class="h-75 d-flex flex-column align-items-center justify-content-center">
    <h3 class="grey-text">Waiting for calls</h3>
  </div>
</template>

<script>
//import AgentStateControl from '@/components/AgentStateControl.vue'

import { mdbContainer } from "mdbvue";
import { APP_STATES } from "@/defines.js";
export default {
  name: "Dashboard",
  components: {
    mdbContainer
  },
  data() {
    return {};
  },
  mounted() {
    var listener = function(payload) {
      console.log("Clicked phone number: " + payload.returnValue);
    };

    // Register the listener.
    window.addEventListener("load", function() {
      sforce.opencti.onClickToDial({ listener: listener });
    });
  },
  methods: {
    
  },
  computed: {
    CallRinging() {
      return this.$store.state.app.state === APP_STATES.CALL_RINGING;
    }
  },
  watch: {
    CallRinging(newState, oldState) {
      if (newState && !oldState) {
        this.showSoftphone();
      }
    }
  }
};
</script>

<style scoped>
</style>

