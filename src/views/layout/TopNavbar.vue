<template>
  <mdb-container class="mt-3 clearfix" fluid>
    <mdb-row class="no-gutters">
      <mdb-col col="8">
        <agent-state-dropdown></agent-state-dropdown>
      </mdb-col>
      <mdb-col col="4">
        <logout-button></logout-button>
      </mdb-col>
    </mdb-row>
  </mdb-container>
</template>

<script>
import IcwsConnector from "@/services/icwsConnector.js";
import { mdbContainer, mdbRow, mdbCol } from "mdbvue";

import AgentStateDropdown from "@/components/AgentStateDropdown.vue";
import LogoutButton from "@/components/LogoutButton.vue";

export default {
  name: "TopNavbar",
  components: {
    AgentStateDropdown,
    LogoutButton,

    mdbContainer,
    mdbRow,
    mdbCol
  },
  methods: {},
  computed: {}
};
</script>

<style scoped>
</style>

