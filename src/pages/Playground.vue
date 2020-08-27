<template>
  <div>
    <div class="container h-screen mx-auto" v-if="!finished && !starting">
      <div class="shadow w-full bg-grey-light h-3">
        <div
          ref="timeBar"
          class="bg-green-500 text-xs leading-none py-1 text-center text-white h-3"
          style="transition: 1s; width: 100%;"
        ></div>
      </div>
      <div class="flex h-full flex-wrap">
        <div class="w-2/3 p-2">
          <div>{{ (maxTime - timePassed) | secondsToString }}</div>
          <div>{{ exerciseDescription }}</div>
          <div style="height: 60vh;" @keyup.ctrl.83="validate">
            <codemirror
              ref="cmEditor"
              v-model="code"
              :options="cmOption"
              @blur="onCmBlur($event)"
              @focus="onCmFocus($event)"
              @ready="onCmReady($event)"
            ></codemirror>
          </div>
          <div
            v-if="isExerciseCorrect"
            class="bg-green-200 p-3 rounded-md border text-gray-800"
          >
            <p>
              Great, you got it right! We will let the rest of the people
              finish. Please, wait until the time is up.
            </p>
          </div>
          <div
            v-if="isExerciseCorrect === false"
            class="bg-red-200 p-3 rounded-md border text-gray-800"
          >
            <p>Sorry, this is not the right solution. Try again!</p>
          </div>
          <div class="mt-2">
            <!--<button
                class="bg-yellow-800 hover:bg-yellow-700 p-3 text-white shadow-md focus:outline-none focus:shadow-outline m-1"
                onClick="toggleControlMode();"
              >
                Give control
              </button>-->
            <button
              class="bg-teal-600 hover:bg-teal-500 p-3 text-white shadow-md focus:outline-none focus:shadow-outline m-1"
              @click="validate()"
            >
              Validate (CTRL-S)
            </button>
          </div>
          <div id="return"></div>
          <div id="result"></div>
        </div>
        <div class="w-1/3 h-full p-2">
          <div class="bg-gray-100 h-full p-2 flex flex-col-reverse">
            <div class="order-4 h-2/6">
              <img class="w-12 inline" src="@/assets/chat.png" />
              <p class="text-2xl inline pl-3 mt-2 text-teal-900">
                Chat
              </p>
              <p class="p-3">This is a place to chat with your peer</p>
            </div>
            <div
              class="flex-grow p-3 order-2 h-3/6 overflow-auto w-full"
              ref="messageContainer"
            ></div>
            <div class="p-3 order-1 h-1/6">
              <textarea
                :disabled="exerciseType != 'PAIR'"
                v-model="myMessage"
                class="border resize-none w-full text-sm p-2"
                placeholder="Write message here and press ENTER"
                v-on:keyup.enter="sendMessage()"
              >
              </textarea>
              <p class="text-xs text-gray-600">
                Press ENTER to send Message
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="finished"
      class="container mx-auto h-screen flex justify-center items-center"
    >
      <div class="max-w-lg">
        <h1 class="mb-6 text-center font-hairline text-3xl">
          Session is over
        </h1>
        <div
          class="bg-teal-100 border-teal-600 p-8 border-t-8 bg-white mb-6 rounded-lg shadow-lg m-5"
        >
          <h1 class="font-bold text-2xl mb-4">Congratulations!</h1>
          <p class="font-medium">
            Thank you for participating in this session. Further questions about
            the experiment SESSIONID can be sent to: xxxx@xxxx.org, with the
            subject [FLOCK SESSIONID]
          </p>
        </div>
        <div class="text-center">
          <p class="text-grey-dark text-sm inline">
            Universidad de Sevilla
          </p>
          <p class="text-grey-dark text-sm inline font-hairline mr-1 ml-1">|</p>
          <p class="text-grey-dark text-sm inline">
            University of California, Berkeley
          </p>
        </div>
      </div>
    </div>
    <div
      v-if="starting"
      class="fixed h-full w-full top-0 z-50 flex justify-center items-center"
      style="backdrop-filter: blur(2px);"
    >
      <img src="@/assets/tc_color.png" class="w-48" />
    </div>
    <div
      v-if="loadingTest"
      class="fixed h-full w-full top-0 z-50 flex justify-center items-center"
      style="backdrop-filter: blur(2px);"
    >
      <div
        class="border-teal-600 p-8 border-t-8 bg-white mb-6 rounded-lg shadow-lg m-5 w-2/3"
      >
        <h1 class="font-bold text-2xl mb-4">A new test begins!</h1>
        <h2 class="font-bold text-xl text-gray-600">
          {{ (maxTime - timePassed) | secondsToString }}
        </h2>
        <p class="font-medium">{{ testDescription }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Message from "../components/Message";
import { codemirror } from "vue-codemirror";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/lib/codemirror.css";

export default {
  components: {
    codemirror,
  },
  data() {
    return {
      code: `return 0;\n`,
      cmOption: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        mode: "text/javascript",
      },
      myMessage: "",
      uid: "",
      rid: "",
      lastReceived: "",
      exerciseDescription: "Please, wait until the exercise loads...",
      exerciseLoaded: false,
      exerciseType: "PAIR",
      testDescription: "",
      finished: false,
      starting: true,
      loadingTest: false,
      peerChange: false,
      timeInterval: null,
      maxTime: 0,
      timePassed: 0,
      isExerciseCorrect: null,
    };
  },
  filters: {
    secondsToString: function(value) {
      const minutes = Math.floor(value / 60);
      const seconds = value - minutes * 60;

      return `${minutes}:${("0" + seconds).slice(-2)}`;
    },
  },
  sockets: {
    msg(pack) {
      if (pack.uid != this.uid && pack.rid == this.rid) {
        console.log(
          "newMsg event triggered with data <" + this.toJSON(pack) + "> "
        );
        this.newMessage(pack.data, false);
      }
    },
    text(pack) {
      console.log(
        "text event triggered with data <" + this.toJSON(pack) + "> "
      );
      if (pack.uid != this.uid && pack.rid == this.rid) {
        this.lastReceived = pack.data;
        this.code = pack.data;
        console.log("  --> Updating code!");
      } else {
        console.log("  --> Ignored!");
      }
    },
    finish() {
      this.finished = true;
    },
    loadTest(pack) {
      this.finished = false;
      this.loadingTest = true;
      this.starting = false;
      this.testDescription = pack.data.testDescription;
      this.peerChange = !this.peerChange;
      this.$refs.messageContainer.innerHTML = "";
    },
    newExercise(pack) {
      this.loadingTest = false;
      this.maxTime = pack.data.maxTime;
      this.timePassed = 0;
      this.isExerciseCorrect = null;
      this.$refs.timeBar.style.width = "100%";
      this.$refs.timeBar.classList.remove("bg-red-500");
      this.$refs.timeBar.classList.add("bg-green-500");
      this.exerciseDescription = pack.data.exerciseDescription;
      this.exerciseType = pack.data.exerciseType;
    },
    reconnect() {
      this.$socket.client.emit("clientReconnection", localStorage.token);
    },
    countDown(pack) {
      this.timePassed = this.maxTime - pack.data;
      console.log("Counting down!");
      let factor = 100 / this.maxTime;
      let width = parseFloat(this.$refs.timeBar.style.width, 10) - factor;
      this.$refs.timeBar.style.width = width + "%";
      if (width < 20) {
        this.$refs.timeBar.classList.remove("bg-yellow-500");
        this.$refs.timeBar.classList.add("bg-red-500");
      } else if (width < 40) {
        this.$refs.timeBar.classList.remove("bg-green-500");
        this.$refs.timeBar.classList.add("bg-yellow-500");
      }
    },
  },
  created() {
    var pathParams = window.location.pathname.split("/");
    this.rid = pathParams[3] + ":" + pathParams[2];

    this.uid = new String(
      new Date().getTime() + new Date().getUTCMilliseconds()
    ).substr(8, 13);

    this.$socket.client.emit("clientReconnection", localStorage.token);
  },
  watch: {
    code: function(newVal) {
      this.clearResult();
      console.log("Code updated:");
      if (newVal != this.lastReceived) {
        this.$socket.client.emit("text", this.pack(newVal));
        console.log(
          "  --> Emitting text event with data <" +
            this.toJSON(this.pack(newVal)) +
            "> "
        );
      } else {
        console.log(
          "  --> Text updated from external source: no event to be emitted"
        );
      }
    },
  },
  methods: {
    sendMessage() {
      if (this.exerciseType == "PAIR") {
        this.newMessage(this.myMessage, true);
        this.$socket.client.emit("msg", this.pack(this.myMessage));

        this.myMessage = "";
      }
    },
    newMessage(msg, mine) {
      const MessageClass = Vue.extend(Message);
      const msgInstance = new MessageClass({
        propsData: {
          mine: mine,
          message: msg,
          girl: this.peerChange,
        },
      });

      msgInstance.$mount();
      this.$refs.messageContainer.appendChild(msgInstance.$el);

      var container = this.$refs.messageContainer;
      container.scrollTop = container.scrollHeight;
    },
    validate() {
      this.clearResult("block");
      try {
        const ret = this.evaluateCode(this.code);
        if (ret) {
          this.valid(ret);
        }
      } catch (e) {
        console.log("ERROR HERE: ", e);
      }
    },
    valid(v) {
      fetch("/verify", {
        method: "POST",
        body: JSON.stringify({
          solution: v,
          user: Number(localStorage.token),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.status == 200) {
          response.json().then((data) => {
            this.isExerciseCorrect = data.result;
          });
        }
      });
    },
    clearResult() {
      console.log("Clearing result!");
    },
    onCmBlur(cm) {
      console.log("cm blur!", cm);
    },
    onCmFocus(cm) {
      console.log("cm focus!", cm);
    },
    onCmReady(cm) {
      console.log("cm ready!", cm);
    },
    loadExercise() {
      this.onTimesUp();
      fetch("/test?code=" + localStorage.token, {
        method: "GET",
      }).then((response) => {
        if (response.status == 200) {
          response.json().then((data) => {
            if (data.finished) {
              window.location.href = "/finished";
            } else {
              this.exerciseDescription = data.description;
              this.maxTime = data.time;
              this.startTimer();
            }
          });
        }
      });
    },
    pack(data) {
      return {
        rid: this.rid,
        uid: this.uid,
        token: localStorage.token,
        data: data,
      };
    },
    toJSON(obj) {
      return JSON.stringify(obj, null, 2);
    },
    evaluateCode(code) {
      return Function('"use strict";' + code)();
    },
  },
  computed: {
    cmEditor() {
      return this.$refs.cmEditor.codemirror;
    },
  },
  mounted() {
    console.log("the codemirror instance object", this.cm);
    //this.loadExercise();
    this.$refs.timeBar.style.width = `${((this.maxTime - this.timePassed) /
      this.maxTime) *
      100}%`;
  },
};
</script>

<style>
.CodeMirror {
  border: 1px solid #eee;
  height: 50vh !important;
}
</style>
