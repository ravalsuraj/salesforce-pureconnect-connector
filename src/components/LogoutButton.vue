<template>
  <mdb-btn color="mdb-color" size="sm" @click="agentLogoutBtnClicked" class="mt-0">Log out</mdb-btn>
</template>

<script>
import { mdbBtn } from "mdbvue";
import { SocketEvents } from "@/defines.js";
import IcwsConnector from "@/services/icwsConnector.js";
export default {
  name: "LogoutButton",
  components: {
    mdbBtn
  },
  mounted() {},
  props: {},

  data() {
    return {};
  },

  methods: {
    agentLogoutBtnClicked() {
      console.log("agentLogoutBtnClicked(): event received");

      IcwsConnector.agentLogoutRequest(this.logoutRequestParams)
        .then(resp => {
          console.log(
            "agentLogoutBtnClicked(): response successful. resp=",
            resp
          );

          //resp.responseCode is correct
          if (resp.responseCode === 0) {
            console.log("agentLogoutBtnClicked(): response code is 0");
            let socketLogoutRequest = {
              userId: this.logoutRequestParams.userId,
              subscriptionId: this.logoutRequestParams.subscriptionId
            };
            console.log(
              "agentLogoutBtnClicked(): sending socket event for logout. socketLogoutRequest=",
              socketLogoutRequest
            );
            try {
              this.$socket.emit("LOGOUT", socketLogoutRequest, response => {
                console.log(
                  "agentLogoutBtnClicked(): Socket event sent for socketLogout(): ack=",
                  response
                );
              });
            } catch (err) {
              console.error(err.message);
            }

            console.log("agentLogoutBtnClicked(): Logout Successful", resp);
            this.$store.dispatch("processAgentLogout");
          } else {
            console.log("agentLogoutBtnClicked(): Logout Failed", resp);
            if (resp.responseCode === 401 || resp.body.errorCode === 7) {
              this.$store.dispatch("processAgentLogout");
            }
          }
        })
        .catch(error => {
          console.log("agentLogoutBtnClicked(): response failed: ", error);
        })
        .finally(() => {});
    }
  },
  computed: {
    logoutRequestParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        subscriptionId: this.$store.state.session.subscriptionId,
        userId: this.$store.state.agent.userId
      };
    }
  }
};
</script>

