<template>
  <div>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">Dolphin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field sm3 append-icon="search" clearable :clear-icon="$vuetify.icons.clear"></v-text-field>
    </v-toolbar>
    <v-container grid-list-lg>
      <v-layout row>
        <v-spacer></v-spacer>
        <v-btn dark color="red" @click="toDeleteAll">delete all</v-btn>
        <v-btn dark color="primary" @click="toReview">Review</v-btn>
      </v-layout>
      <v-layout row wrap>
        <card @del="toDel(c)" @edit="toEdit(c, i)" v-for="(c,i) in cards" :card="c" :key="c.id"/>
      </v-layout>
    </v-container>
    <v-expansion-panel class="expansion-panel" expand v-model="expand">
      <v-expansion-panel-content>
        <template v-slot:actions>
          <v-icon>menu</v-icon>
        </template>
        <template v-slot:header>
          <div class="expansion-panel__header"></div>
        </template>
        <v-form class="card-form" @submit.prevent="toAdd">
          <v-container dark>
            <v-layout>
              <v-flex xs12 sm6>
                <v-textarea
                  ref="front"
                  name="front"
                  label="front"
                  v-model="selectedCard.front"
                  outline
                  append-outer-icon
                  box
                  required
                ></v-textarea>
              </v-flex>
              <v-flex xs12 sm6>
                <v-textarea
                  ref="back"
                  name="back"
                  v-model="selectedCard.back"
                  label="back"
                  outline
                  box
                  required
                ></v-textarea>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex xs12 v-if="editing">
                <v-btn color="warnning" block @click="toCancel">Cancel</v-btn>
                <v-btn color="success" block @click="toUpdate">Save</v-btn>
              </v-flex>
              <v-flex v-else>
                <v-btn color="success" block type="submit">Add</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-snackbar :top="true" :timeout="3000" v-model="snackbar.show">{{ snackbar.msg }}</v-snackbar>
    <v-dialog v-model="deleteAllDialog" width="300">
      <v-card>
        <v-card-title>确定删除所有卡片吗？</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn dark @click="deleteAllDialog = false">取消</v-btn>
          <v-btn color="red" @click="confirmDeleteAll">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Card from "./components/card.vue";
import api from "@/apis";

export default {
  components: {
    Card
  },
  data() {
    return {
      snackbar: {
        show: false,
        msg: "没有卡片可以复习"
      },
      expand: [false],
      cards: [],
      selectedCard: {
        front: "",
        back: ""
      },
      currentIndex: -1,
      editing: false,
      deleteAllDialog: false
    };
  },
  beforeMount() {
    api
      .getCards()
      .then(resp => {
        console.log(resp);
        this.cards = resp.data;
      })
      .catch(err => {
        console.log(err);
      });
  },
  methods: {
    toEdit(card, index) {
      this.currentIndex = index;
      this.selectedCard = Object.assign({}, card);
      this.editing = true;
      this.$set(this.expand, 0, true);
    },
    toCancel() {
      this.editing = false;
    },
    toUpdate() {
      api
        .updateCard(this.selectedCard._id, this.selectedCard)
        .then(resp => {
          this.cards[this.currentIndex] = Object.assign({}, this.selectedCard);
          // this.$set(this.cards, this.currentIndex, this.selectedCard);
          this.editing = false;
        })
        .catch(() => {
          this.editing = false;
        });
    },
    toDel(card) {
      api.removeCard(card._id).then(() => {
        let idx = this.cards.findIndex(c => c._id === card._id);
        this.cards.splice(idx, 1);
      });
    },
    toAdd(event) {
      let form = event.target;
      let front = form.querySelector('[name="front"]');
      let back = form.querySelector('[name="back"]');
      if (!front.checkValidity() || !back.checkValidity()) {
        return;
      }
      const body = {
        front: this.selectedCard.front,
        back: this.selectedCard.back
      };
      api.createCard(body).then(resp => {
        this.cards.unshift(resp.data);
        this.selectedCard.front = "";
        this.selectedCard.back = "";
      });
    },
    toReview() {
      if (this.cards.length < 1) {
        this.snackbar.show = true;
        this.snackbar.msg = "没有卡片可以复习- -!";
        return;
      }
      this.$router.push("/room");
    },
    toDeleteAll() {
      if (this.cards.length > 0) {
        this.deleteAllDialog = true;
      } else {
        this.snackbar.show = true;
        this.snackbar.msg = "没有卡片可以删除- -!";
      }
    },
    confirmDeleteAll() {
      api.removeCards().then(resp => {
        this.cards = [];
        this.deleteAllDialog = false;
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
.v-toolbar .v-text-field {
  width: 20rem;
  flex-grow: 0;
}
</style>

<style>
#app {
  font-family: "Microsoft Yahei", "Roboto", sans-serif;
}
.expansion-panel {
  position: fixed;
  bottom: 0;
}
.v-expansion-panel__header__icon {
  width: 100%;
  color: white;
  text-align: center;
}
</style>
