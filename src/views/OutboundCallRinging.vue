<template>
  <div class="d-flex flex-column align-items-center justify-content-around mt-4">
    <div v-if="isInboundCall">
      <h3 class="light-blue-text">Inbound Call</h3>
    </div>
    <div v-if="isOutboundCall">
      <h3 class="green-text">Outbound Call</h3>
    </div>
    <h4>{{sfRecord.recordName}}</h4>
    <h4>{{maskedSfNumber}}</h4>
    <mdb-btn class="danger-color" @click="controlCall('answer')">Disconnect Call</mdb-btn>
    <!-- <mdb-alert :color="loginAlert.color" v-if="loginAlert.show">{{loginAlert.message}}</mdb-alert> -->
    <!-- <mdb-btn class="success-color" @click="controlCall('mute')">Disconnect Call</mdb-btn>
    <mdb-btn class="success-color" @click="controlCall('unmute')">Disconnect Call</mdb-btn>-->
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
  mdbIcon
} from "mdbvue";
import { AGENT_STATES, CALL_STATES } from "@/defines.js";

export default {
  name: "OutboundCallRinging",
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
    mdbIcon
  },
  mounted() {},
  props: {},

  data() {
    return {};
  },
  methods: {},
  computed: {
    sfRecord() {
      return this.$store.state.sfRecord;
    },
    customerNumber() {
      return this.sfRecord.number.toString();
    },
    maskedSfNumber() {
      this.customerNumber.substring(0, 3) +
        "xxxx" +
        this.customerNumber.substring(
          this.customerNumber.length - 3,
          this.customerNumber.length
        );
    }
  }
};
</script>
