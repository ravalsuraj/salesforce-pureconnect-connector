<template>
  <div id="app" class="d-flex flex-column">
    <top-navbar v-if="isUserLoggedIn"></top-navbar>
    <!-- <top-navbar></top-navbar> -->
    <main-content></main-content>
    <bottom-statusbar></bottom-statusbar>
  </div>
</template>

<script>
import IcwsConnector from "@/services/icwsConnector.js";

import TopNavbar from "@/views/layout/TopNavbar.vue";
import MainContent from "@/views/layout/MainContent.vue";
import BottomStatusbar from "@/views/layout/BottomStatusbar.vue";

import { APP_STATES } from "@/defines.js";
export default {
  name: "App",
  components: {
    TopNavbar,
    MainContent,
    BottomStatusbar
  },
  mounted() {
    console.log("CTI Connector App mounted");
    // this.enableClickToDial();
    this.getSfUserId();

    //this.checkAgentLoginStatus();
    //this.addAppViewChangeListener();
    this.onClickToDial();
    this.sendJoinRoomSocketEvent();
    if (this.isUserLoggedIn) {
      this.$store.dispatch("enableClickToDial");
    } else {
      this.$store.dispatch("disableClickToDial");
    }
  },
  methods: {
    sendJoinRoomSocketEvent() {
      if (this.joinRoomRequest.userId && this.joinRoomRequest.subscriptionId) {
        this.$socket
          .emit("JOIN_ROOM", this.joinRoomRequest, response => {
            console.log(
              "sendJoinRoomSocketEvent: sent successfully: ack=" +
                JSON.stringify(response)
            );
          })
          // .catch(err => {
          //   console.error(
          //     "sendJoinRoomSocketEvent: failed" + JSON.stringify(err)
          //   );
          // });
      } else {
        console.log(
          "Skipping sendJoinRoomSocketEvent() since username or subscriptipId are blank"
        );
      }
    },
    checkAgentLoginStatus() {
      IcwsConnector.createOutboundCall(this.icwsOutboundCallRequestParams)
        .then(resp => {
          console.log(
            "icwsCreateOutboundCall(): response successful. resp=" +
              JSON.stringify(resp)
          );

          if (resp.data.responseCode === 0) {
            console.log("icwsCreateOutboundCall(): response code is 0");

            console.log(
              "icwsCreateOutboundCall Successful" + JSON.stringify(resp)
            );
          } else {
            console.log("icwsCreateOutboundCall Failed" + JSON.stringify(resp));
            //this.showAlert("danger", JSON.stringify(resp.body.message));
          }
        })
        .catch(error => {
          console.log(
            "icwsCreateOutboundCall(): response failed: " +
              JSON.stringify(error)
          );
        })
        .finally(() => {
          this.$store.commit("clickToDialPressed", payload);
        });
    },
    getSfUserId() {
      // console.log("going to dispatch getSfUserId()")
      // this.$store.dispatch('getSfUserId');
      console.log("getSfUserId(): Entered method");
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "getUserId",
        methodParams: ""
      };
      param.callback = response => {
        if (response.success) {
          console.log(
            "getSfUserId(): response successful. response.returnValue=" +
              JSON.stringify(response.returnValue)
          );
          this.$store.commit(
            "setSalesforceAgentId",
            response.returnValue.runApex
          );
        } else {
          console.error(
            "getSfUserId(): response failure. response.errors=" +
              JSON.stringify(response.errors)
          );
        }
      };
      //Invokes API method
      sforce.opencti.runApex(param);
    },
    onClickToDial() {
      var listener = payload => {
        console.log("Clicked phone number: " + JSON.stringify(payload));
        this.$store.commit("setClickToDialRequestPacket", payload);
        let outboundCallNumber = payload.number;
        if (true) {
          outboundCallNumber = "91" + outboundCallNumber;
        }
        this.icwsOutboundCallRequestParams.targetNumber = outboundCallNumber;

        IcwsConnector.createOutboundCall(this.icwsOutboundCallRequestParams)
          .then(resp => {
            console.log(
              "icwsCreateOutboundCall(): response successful. resp=" +
                JSON.stringify(resp)
            );

            if (resp.data.responseCode === 0) {
              console.log("icwsCreateOutboundCall(): response code is 0");

              console.log(
                "icwsCreateOutboundCall Successful" + JSON.stringify(resp)
              );
            } else {
              console.log(
                "icwsCreateOutboundCall Failed" + JSON.stringify(resp)
              );
              //this.showAlert("danger", JSON.stringify(resp.body.message));
            }
          })
          .catch(error => {
            console.log(
              "icwsCreateOutboundCall(): response failed: " +
                JSON.stringify(error)
            );
          })
          .finally(() => {
            this.$store.commit("clickToDialPressed", payload);
          });
      };

      // Register the listener.
      window.addEventListener("load", () => {
        console.log("adding onClickToDial event Listener");
        sforce.opencti.onClickToDial({ listener: listener });
      });
    },
    addAppViewChangeListener() {
      sforce.opencti.getAppViewInfo({
        callback: response => {
          if (response.success) {
            console.log(
              "addAppViewChangeListener() executed successfully! returnValue:",
              response.returnValue
            );
          } else {
            console.error(
              "addAppViewChangeListener() returned Errors:",
              response.errors
            );
          }
        }
      });
    }
  },
  computed: {
    joinRoomRequest() {
      return {
        userId: this.$store.state.agent.userId,
        subscriptionId: this.$store.state.session.subscriptionId
      };
    },
    isUserLoggedIn() {
      return this.$store.state.app.state !== APP_STATES.LOGGED_OUT;
    },
    icwsOutboundCallRequestParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        subscriptionId: this.$store.state.session.subscriptionId,
        interactionId: this.$store.state.call.interactionId
      };
    },
    agentId() {
      return;
    }
  }
  // watch: {
  //   isUserLoggedIn(nowLoggedIn, wasLoggedIn) {
  //     if (nowLoggedIn && !wasLoggedIn) {
  //       this.onClickToDial();
  //     } else if (wasLoggedIn && !nowLoggedIn) {

  //     }
  //   }
  // }
};
</script>


<style lang="scss">
#app {
  height: 325px;
  // font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  // color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
html {
  font-size: 65%;
  color: rgba(0, 0, 0, 0.45);
}
.main-body {
  height: 290px;
  overflow-y: auto;
  background: linear-gradient(#fff, rgb(243, 243, 243));
  /* background: rgba(204, 0, 0, 1);
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
    GradientType=1 ); */
}
footer {
  height: 25px;
}

@media (min-width: 992px) {
  .col-lg-2p5 {
    -ms-flex: 0 0 20.833333%;
    flex: 0 0 20.833333%;
    max-width: 20.833333%;
  }
}

.fl_widget {
  margin-bottom: 10px !important;
}

.fl_btn_btnIcon i {
  color: #9e9e9e;
}
.fl_btn_btnIcon:hover i {
  color: #00bcd4;
}
.fl_btn_btnIcon:active i {
  color: #0097a7;
}
.fl-color-agc {
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
.fa-1p5x {
  font-size: 1.5em;
}
.btn-circle {
  width: 30px;
  height: 30px;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.428571429;
  border-radius: 15px;
}
.btn-circle.btn-lg {
  width: 50px;
  height: 50px;
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.33;
  border-radius: 25px;
}
.btn-circle.btn-xl {
  width: 70px;
  height: 70px;
  padding: 10px 16px;
  font-size: 24px;
  line-height: 1.33;
  border-radius: 35px;
}

/******************Slide Animation Styles********************/

.slide-enter-active {
  -moz-transition-duration: 0.4s;
  -webkit-transition-duration: 0.4s;
  -o-transition-duration: 0.4s;
  transition-duration: 0.4s;

  transition-timing-function: linear;
}

.slide-leave-active {
  -moz-transition-duration: 0.8s;
  -webkit-transition-duration: 0.8s;
  -o-transition-duration: 0.8s;
  transition-duration: 0.8s;
  -moz-transition-timing-function: linear;
  -webkit-transition-timing-function: linear;
  -o-transition-timing-function: linear;
  transition-timing-function: linear;
}

.slide-enter-to,
.slide-leave {
  max-height: 100px;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}

.flip-list-move {
  transition: transform 0.2s;
}

/******************Fade Animation Styles********************/

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to
/* .-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.card {
  box-shadow: 3px 2px 15px 2px rgba(0, 0, 0, 0.16),
    0 2px 10px 0 rgba(0, 0, 0, 0.12) !important;
}

// .md-form .prefix.active {
//   /* color: #d63333; */
// }
</style>
<style scoped>
main {
  /* background: url("https://cdn-images-1.medium.com/max/2000/1*AcYLHh0_ve4TNRi6HLFcPA.jpeg"); */
  background-size: cover;
}
.fl_topSpacing {
  padding-top: 64px;
}
</style>
