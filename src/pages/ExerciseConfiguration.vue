<template>
  <div>
    <Header />
    <div class="text-center align-middle">
      <div class="inline-block w-full max-w-screen-xl">
        <div class="text-left">
          <h1 class="p-5 text-2xl md:text-3xl md:ml-3 font-semibold">
            Exercise configuration
          </h1>
        </div>
      </div>
      <div class="p-3 text-left max-w-4xl mx-auto mb-20">
        <div class="mt-5">
          <h2 class="font-bold text-xl">
            {{ this.$route.params.sessionName }} session
          </h2>
        </div>
        <div class="mt-5">
          <h2 class="mb-3 text-md font-light">Tests list:</h2>
          <Table
            :head="['Test', 'Number of exercises', 'Total time (minutes)']"
            :body="orderedTests"
            v-model="selectedTest"
          />
        </div>
        <div v-if="tests.length > 0" class="mt-10">
          <h2 class="mb-3 text-md font-light">Exercises:</h2>
          <ButtonSelector
            v-model="selectedExerciseIndex"
            :listOfValues="tests[this.selectedTest].exercises"
            propertyName="name"
          />
          <div class="border items-center py-6">
            <div class="mt-4 max-w-xl mx-auto">
              <label
                class="align-middle text-gray-700 text-sm font-bold mb-2"
                for="description"
              >
                Name:
              </label>
              <input
                class="ml-2 appearance-none border rounded py-2 px-3 w-40 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                type="text"
                v-model="
                  this.tests[this.selectedTest].exercises[
                    this.selectedExerciseIndex
                  ].name
                "
              />
            </div>
            <div class="mt-4 max-w-xl mx-auto">
              <label
                class="align-top text-gray-700 text-sm font-bold mb-2"
                for="description"
              >
                Description:
              </label>
              <textarea
                class="ml-2 appearance-none border rounded py-2 px-3 w-10/12 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                type="text"
                v-model="
                  this.tests[this.selectedTest].exercises[
                    this.selectedExerciseIndex
                  ].description
                "
              />
            </div>
            <div class="mt-4 max-w-xl mx-auto">
              <label
                class="align-middle text-gray-700 text-sm font-bold mb-2"
                for="solution"
              >
                Solution:
              </label>
              <input
                class="ml-2 appearance-none border rounded py-2 px-3 w-40 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="solution"
                type="number"
                v-model="
                  this.tests[this.selectedTest].exercises[
                    this.selectedExerciseIndex
                  ].solution
                "
              />
            </div>
            <div class="mt-4 max-w-xl mx-auto">
              <label
                class="align-middle text-gray-700 text-sm font-bold mb-2"
                for="time"
              >
                Available time to complete the exercise:
              </label>
              <input
                class="ml-2 appearance-none border rounded py-2 px-3 w-20 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="time"
                type="number"
                v-model="
                  this.tests[this.selectedTest].exercises[
                    this.selectedExerciseIndex
                  ].time
                "
              />
              <p class="inline text-gray-700 font-light mx-3">seconds</p>
            </div>
            <div class="mt-4 max-w-xl mx-auto">
              <label
                class="align-middle text-gray-700 text-sm font-bold mb-2"
                for="type"
              >
                Type of exercise:
              </label>
              <input
                class="ml-2 appearance-none border rounded py-2 px-3 w-40 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="type"
                type="text"
                v-model="
                  this.tests[this.selectedTest].exercises[
                    this.selectedExerciseIndex
                  ].type
                "
              />
            </div>
            <div class="mt-4 max-w-xl mx-auto">
              <button
                class="mt-3 rounded-full bg-orange-400 p-2 px-5 focus:outline-none focus:shadow-outline"
              >
                Update exercise
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "../components/Header";
import Table from "../components/Table";
import ButtonSelector from "../components/ButtonSelector";
export default {
  components: {
    Header,
    Table,
    ButtonSelector,
  },
  data() {
    return {
      participants: [],
      orderedTests: [],
      tests: [],
      selectedTest: 0,
      selectedExerciseIndex: 0,
      selectedExercise: {},
    };
  },
  methods: {
    updateSession() {},
    loadSession() {
      fetch(
        `${process.env.VUE_APP_TC_API}/sessions/${this.$route.params.sessionName}`,
        {
          method: "GET",
          headers: {
            Authorization: localStorage.adminSecret,
          },
        }
      )
        .then((response) => {
          if (response.status == 200) {
            return response.json();
          }
        })
        .then((retrievedSession) => {
          if (retrievedSession) {
            this.session.name = retrievedSession.name;
            this.session.tokens = retrievedSession.tokens;
            this.session.tokenPairing = retrievedSession.tokenPairing;
          }
        });
    },
    loadParticipants() {
      fetch(
        `${process.env.VUE_APP_TC_API}/participants/${this.$route.params.sessionName}`,
        {
          method: "GET",
          headers: {
            Authorization: localStorage.adminSecret,
          },
        }
      )
        .then((response) => {
          if (response.status == 200) {
            return response.json();
          }
        })
        .then((participants) => {
          if (participants) {
            this.participants = participants;
          }
        });
    },
    loadTests() {
      fetch(
        `${process.env.VUE_APP_TC_API}/tests/${this.$route.params.sessionName}`,
        {
          method: "GET",
          headers: {
            Authorization: localStorage.adminSecret,
          },
        }
      )
        .then((response) => {
          if (response.status == 200) {
            return response.json();
          }
        })
        .then((tests) => {
          if (tests) {
            let orderedTests = [];
            tests.forEach((test) => {
              let orderedTest = {};
              orderedTest.name = test.name;
              orderedTest.excercises = test.exercises.length;
              let totalTime = 0;
              test.exercises.forEach((exercise) => {
                totalTime += exercise.time;
              });
              orderedTest.totalTime = totalTime;
              orderedTests.push(orderedTest);
            });
            this.orderedTests = orderedTests;
          }
          this.tests = tests;
        });
    },
    loadExercise() {
      this.selectedExercise = this.test[this.selectedTest].excercises[
        this.selectedExerciseIndex
      ];
    },
  },
  mounted() {
    this.loadTests();
  },
};
</script>

<style></style>
