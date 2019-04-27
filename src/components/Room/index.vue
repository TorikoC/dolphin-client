<template>
  <v-app>
    <v-content>
      <div class="header">
        <router-link to="/">
          <v-icon class="header__home">exit_to_app</v-icon>
        </router-link>
      </div>
      <v-container>
        <v-layout>
          <v-flex>
            <p class="front">{{ card.front }}</p>
            <div class="divisor"></div>
            <p class="back">{{ card.back }}</p>
          </v-flex>
        </v-layout>
      </v-container>
      <div class="actions">
        <div v-if="hasAnswer" class="actions__buttons">
          <v-btn color="yellow" block @click.prevent="forget">forget</v-btn>
          <v-btn color="blue" block @click.prevent="remember">remember</v-btn>
        </div>
        <v-btn color="green" dark v-else block @click="showAnswer">show answer</v-btn>
      </div>
      <v-snackbar :top="true" :timeout="3000" v-model="snackbar">没有更多卡片了</v-snackbar>
    </v-content>
  </v-app>
</template>

<script>
import api from "@/apis";

export default {
  computed: {
    card() {
      return this.cards[this.idx];
    }
  },
  beforeMount() {
    api.getRandomCards(this.$route.params.id).then(resp => {
      this.cards = resp.data;
    });
  },
  data() {
    return {
      snackbar: false,
      hasAnswer: false,
      idx: 0,
      cards: [
        {
          front: "春天",
          back: "はる"
        },
        {
          front: "夏天",
          back: "なつ"
        }
      ]
    };
  },
  methods: {
    showAnswer() {
      document.querySelector(".back").style.display = "block";
      this.hasAnswer = true;
    },
    forget() {
      let body = Object.assign({}, this.cards[this.idx]);
      if (body.hasOwnProperty("score")) {
        body.score = 0;
        api.updateCard(this.$route.params.id, body._id, body);
      }
      this.next();
    },
    remember() {
      let body = Object.assign({}, this.cards[this.idx]);
      if (body.hasOwnProperty("score")) {
        body.score += 1;
        api.updateCard(this.$route.params.id, body._id, body);
      }
      this.next();
    },
    next() {
      if (this.idx + 1 >= this.cards.length) {
        api.getRandomCards(this.$route.params.id).then(resp => {
          this.cards = resp.data;
          this.idx = 0;
          document.querySelector(".back").style.display = "none";
          this.hasAnswer = false;
        });
      } else {
        this.idx += 1;
        document.querySelector(".back").style.display = "none";
        this.hasAnswer = false;
      }
    }
  }
};
</script>

<style>
.header {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 1rem 2rem;
  opacity: 0;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  transition: all 0.3s;
}
.header:hover {
  opacity: 0.8;
}
.header__home:hover {
  cursor: pointer;
  color: blue;
}
.front {
  text-align: center;
}
.divisor {
  margin: 1rem 0;
  height: 2px;
  width: 100%;
  background: #f0f0f0;
}
.back {
  display: none;
  text-align: center;
}
.actions {
  width: 100%;
  position: fixed;
  bottom: 0;
}
.actions__buttons {
  display: flex;
  flex-direction: row;
}
.actions button {
  margin: 0;
}
</style>

