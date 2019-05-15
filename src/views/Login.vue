<template>
  <div fluid class="fl_corner_bg w-100">
    <!-- Material form login -->

    <mdb-row class="d-flex flex-fill justify-content-center pt-4">
      <!-- <div v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <div>
          <span v-for="error in errors">{{ error }}</span>
        </div>
      </div>-->
      <mdb-col col="lg-4" class style>
        <div class="h4 mx-auto d-flex align-items-baseline">
          <img src="@/assets/oberoi_logo.png" class alt="Responsive image" style="height: 30px">
          <span class="mx-auto align-baseline h2">CTI Login</span>
        </div>

        <div class="grey-text" @keyup="handleEnterKeyForLogin">
          <mdb-input
            required
            label="Agent ID"
            icon="user"
            type="text"
            size="sm"
            v-model="inpCredentials.userId"
          />
          <mdb-input
            required
            label="Station ID"
            icon="phone"
            type="text"
            size="sm"
            v-model="inpCredentials.station"
          />
          <mdb-input
            required
            label="Password"
            icon="lock"
            type="password"
            size="sm"
            v-model="inpCredentials.password"
          />
        </div>

        <span class="spinner-border text-info float-left" v-if="spinner.show"></span>
        <div class="btn-group text-center my-2 w-100">
          <mdb-btn
            class="btn white-text unique-color mr-3"
            size
            @click="agentLoginBtnClicked"
          >Log in</mdb-btn>
        </div>
        <mdb-alert :color="loginAlert.color" v-if="loginAlert.show">{{loginAlert.message}}</mdb-alert>
      </mdb-col>
    </mdb-row>
  </div>
</template>

<script>
import {
  mdbAlert,
  mdbContainer,
  mdbRow,
  mdbCol,
  mdbBtn,
  mdbInput
} from "mdbvue";
import { SocketEvents } from "@/defines.js";
import IcwsConnector from "@/services/icwsConnector.js";
export default {
  name: "LoginPage",
  components: {
    mdbAlert,
    mdbContainer,
    mdbRow,
    mdbCol,
    mdbBtn,
    mdbInput
  },
  mounted() {},
  props: {},

  data() {
    return {
      inpCredentials: {
        userId: "1101",
        station: "2101",
        password: "1101"
      },
      loginResponse: "",
      loginAlert: {
        message: "",
        color: "",
        show: false
      },
      spinner: {
        show: false
      },
      ipAddress: ""
    };
  },

  methods: {
    handleEnterKeyForLogin(e) {
      if (e.keyCode === 13) {
        this.agentLoginBtnClicked();
      }
    },

    agentLoginBtnClicked() {
      console.log("agentLoginBtnClicked(): onClick function called");
      //show the loading spinner
      this.showSpinner();

      //generate a subscription ID using the current timestamp and the userId
      let generatedSubscriptionId = IcwsConnector.generateSubscriptionId(
        this.inpCredentials.userId
      );

      //create the login request packet using the input values entered by the user
      let loginRequest = {
        userId: this.inpCredentials.userId,
        station: this.inpCredentials.station,
        password: this.inpCredentials.password,
        subscriptionId: generatedSubscriptionId,
        auxCodes: []
      };
      //create the socket request
      let socketLoginRequest = {
        userId: loginRequest.userId,
        subscriptionId: loginRequest.subscriptionId
      };
      console.log(
        "Socket event about to send for socketLogin(): ",
        socketLoginRequest
      );
      try {
        //check if the agent is already logged in
        if (
          loginRequest.userId &&
          loginRequest.station &&
          loginRequest.password &&
          loginRequest.subscriptionId
        ) {
          IcwsConnector.getAgentLoginState(loginRequest).then(
            agentStateResp => {
              console.log(
                "getAgentLoginState() request successful. resp=",
                agentStateResp
              );
            }
          );
        }

        this.$socket.emit("LOGIN", socketLoginRequest, response => {
          console.log("Socket event sent for socketLogin(): ack=", response);

          IcwsConnector.agentLoginRequest(loginRequest)
            .then(resp => {
              console.log(
                "agentLoginBtnClicked(): response received: resp=",
                resp
              );

              if (resp.responseCode === 0) {
                console.log("agentLoginBtnClicked() entering respCode 0");
                loginRequest.auxCodes = resp.statusMessages;
                let sessionParams = {
                  sessionId: resp.sessionId,
                  csrfToken: resp.csrfToken,
                  cookie: resp.cookie[0],
                  subscriptionId: resp.subscriptionId
                };

                console.log("agentLoginBtnClicked() Login Successful", resp);

                console.log(
                  "agentLoginBtnClicked() sessionParams=",
                  sessionParams
                );
                let loginPacket = {
                  loginRequest: loginRequest,
                  sessionParams: sessionParams
                };
                this.$store.dispatch("processAgentLogin", loginPacket);
                //this.enableClickToDial();
              } else {
                console.log("agentLoginBtnClicked(): ", resp);
                this.showAlert(
                  "danger",
                  "Agent Login failed:" + resp.body.message
                );
              }
            })
            .catch(error => {
              console.log("agentLoginBtnClicked(): response failed: ", error);
            })
            .finally(() => {
              this.hideSpinner();
            });
        });
      } catch (err) {
        console.error(err.message);
      }
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
    },
    showSpinner() {
      this.spinner.show = true;
    },
    hideSpinner() {
      this.spinner.show = false;
    }
  },
  computed: {
    mySession() {
      return this.$store.state.session;
    },
    credentials() {
      return this.$store.state.agent;
    },
    socketRequest() {
      return this.$store.state.socketRequest;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* .fl_corner_bg {
} */
.fl_login_banner {
  background: rgba(204, 0, 0, 1);
  background: -moz-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -webkit-gradient(
    left top,
    right top,
    color-stop(0%, rgba(204, 0, 0, 1)),
    color-stop(100%, rgba(255, 102, 0, 1))
  );
  background: -webkit-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -o-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -ms-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: linear-gradient(
    to right,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient( 
    startColorstr='#cc0000', endColorstr='#ff6600', 
    GradientType=1 );
}
.login-radio-container {
  align-content: center;
  justify-content: space-around;
  display: flex;
  width: 50%;
  margin: auto;
  padding-bottom: 10px;
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

.iconCallHangup {
  transform: rotate(135deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
