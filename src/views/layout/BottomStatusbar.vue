<template>
  <footer class="page-footer font-small special-color p-2" style="height:25px">
    <span class="float-left">SessionID: {{sessionId}}</span>
    <span class="float-right">{{agentDetails}}</span>
  </footer>
</template>

<script>
export default {
  name: "TopNavbar",
  components: {},
  computed: {
    sessionId() {
      return this.$store.state.session.sessionId;
    },
    agentDetails() {
      return (
        this.$store.state.agent.userId + " : " + this.$store.state.agent.station
      );
    }
  }
};
</script>