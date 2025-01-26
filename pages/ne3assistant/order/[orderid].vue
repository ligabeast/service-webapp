<template>
  <div class="flex w-full h-full flex-col p-4 space-y-4">
    <!-- Überschrift -->
    <h1 class="text-2xl font-semibold">Ne3 Assistent</h1>

    <!-- Auftragsdetails -->
    <div class="flex flex-col space-y-2">
      <span class="text-sm text-gray-500 font-semibold">{{
        order?.adress
      }}</span>
      <span class="text-sm text-gray-500 font-semibold"
        >KLS-ID: {{ order?.kls_id }}</span
      >
      <span class="text-sm text-gray-500 font-semibold"
        >Auftragsnummer: {{ order?.ordernumber }}</span
      >
    </div>

    <!-- Fragenbox -->
    <div
      class="border border-blue-500 rounded-md p-4 bg-white"
      v-if="!showResult"
    >
      <div class="text-lg font-semibold flex justify-center mb-4">
        <span>Frage {{ totalQuestions }}</span>
      </div>
      <span class="block text-center mb-8">{{ currentQuestion.question }}</span>

      <!-- Antworten -->
      <div class="flex flex-col space-y-2">
        <template
          v-for="answer in currentQuestion.possibleAnswers"
          :key="answer.text"
        >
          <button
            class="rounded-md p-2 transition"
            @click="selectAnswer(answer)"
            :class="{
              'bg-blue-600 text-white':
                selectedAnswer && selectedAnswer?.text === answer?.text,
              'bg-blue-500 hover:bg-blue-600 text-white':
                selectedAnswer !== answer,
            }"
          >
            {{ answer.text }}
          </button>
        </template>
      </div>
    </div>

    <!-- Ergebnis-Box -->
    <div class="border border-blue-500 rounded-md p-4 bg-white" v-else>
      <div class="text-lg font-semibold flex justify-center mb-4">
        <span>Ergebnis</span>
      </div>
      <span class="block text-center">{{ result }}</span>
    </div>

    <!-- Weiter-Button -->
    <div v-if="selectedAnswer && !showResult" class="flex justify-end">
      <button
        class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
        @click="goToNextQuestion"
      >
        Weiter
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

// Routen- und API-Daten
const route = useRoute();
const orderid = route.params.orderid;

const totalQuestions = ref(1);

const data: any = await $fetch(`/api/getOrder?orderid=${orderid}`, {
  headers: {
    Authorization: `Bearer ${useCookie("jwt").value}`,
  },
});
const order = ref(data.data[0] ?? null);

// Frage-Logik
const currentQuestionId = ref("q1");
const currentQuestion = computed(() => questions[currentQuestionId.value]);
const showResult = ref(false);
const result = ref<string | null>(null);

// Auswahl
const selectedAnswer = ref<any | null>(null);

function selectAnswer(answer: any) {
  selectedAnswer.value = answer;
}

// Zur nächsten Frage wechseln
function goToNextQuestion() {
  if (selectedAnswer.value?.nextQuestionId) {
    currentQuestionId.value = selectedAnswer.value.nextQuestionId;
    selectedAnswer.value = null; // Zurücksetzen
    totalQuestions.value++;
  } else if (selectedAnswer.value?.result) {
    console.log("Ergebnis:", selectedAnswer.value.result);
    showResult.value = true;
    result.value = selectedAnswer.value.result;
  }
}

// Fragen und Antworten
type QuestionNode = {
  id: number;
  question: string;
  possibleAnswers: {
    text: string;
    nextQuestionId?: string;
    result?: string;
  }[];
};

const questions: Record<string, QuestionNode> = {
  q1: {
    id: 1,
    question:
      "Ist im Direkt-Link kein Port frei? Falls ja, kontaktiere die Fiber-Hotline. Wie leuchtet das Modem?",
    possibleAnswers: [
      { text: "Modem leuchtet orange durchgehend", nextQuestionId: "q2" },
      { text: "Modem blinkt grün", nextQuestionId: "q3" },
    ],
  },
  q2: {
    id: 2,
    question:
      "Steck den Laser am TA blinkend an. Kommt das Rotlicht am Stecker nicht an, repariere deine Leitung(WZL) bzw. Spleiß. Schließe das Modem am AP an und teste erneut. Wie leuchtet das Modem nun?",
    possibleAnswers: [
      {
        text: "Modem leuchtet orange durchgehend",
        nextQuestionId: "q4",
      },
      { text: "Modem blinkt grün", result: "WZL beschädigt" },
    ],
  },
  q3: {
    id: 3,
    question: "Sind alle Kabel korrekt angeschlossen?",
    possibleAnswers: [
      { text: "Ja", result: "Kein Fehler erkannt" },
      { text: "Nein", result: "Bitte Kabel korrekt anschließen" },
    ],
  },
  q4: {
    id: 4,
    question:
      "Schließe den blinkenden Stecker am richten Port an und prüfe im AP den Spleiß der NE3-Kassette. Koppler 1 Rote Faser, Koppler 2 Grüne Faser und Koppler 3 Blaue Faser etc. Vergewissere dich, dass die Stecker hinter dem Port auch korrekt sind. Ist hinter und vor dem Spleiß Rotlicht zu sehen?",
    possibleAnswers: [
      {
        text: "Rotlicht geht durch den Spleiß",
        nextQuestionId: "q5",
      },
      {
        text: "Rotlicht geht nicht durch den Spleiß",
        result: "Spleiß beschädigt, Ne3-Fehler beseitigt",
      },
    ],
  },
  q5: {
    id: 5,
    question:
      "Gebe die KLS-ID in der Mess-App ein und frage den Leitungsweg ab, für dein Port und NVT-Adresse.",
    possibleAnswers: [
      { text: "Werte stimmen überein", result: "Messung erfolgreich" },
      { text: "Werte weichen ab", result: "Weitere Überprüfung notwendig" },
    ],
  },
};
</script>
