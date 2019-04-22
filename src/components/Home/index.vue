<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" fixed clipped class="grey lighten-4" app>
      <v-btn @click="toCreateNode('')">Add Deck</v-btn>
      <v-treeview
        activatable
        transition
        :active.sync="active"
        open-on-click
        hoverable
        :items="decks"
      >
        <template v-slot:label="{ item }">
          <v-layout column v-if="editDeck.deck._id === item._id">
            <v-text-field v-model="editDeck.name"></v-text-field>
            <v-btn small @click="editDeck.deck = ''">Cancel</v-btn>
            <v-btn small @click="toUpdateNode">Save</v-btn>
          </v-layout>
          <v-layout class="tree-node" v-else>
            <v-flex @click="toDeck(item)">{{ item.name }}</v-flex>
            <v-layout float>
              <v-icon class="tree-node__icon" @click="toEditNode(item, $event)">edit</v-icon>
              <v-icon class="tree-node__icon" @click="toDeleteNode(item)">delete</v-icon>
              <v-icon class="tree-node__icon" @click="toCreateNode(item)">add</v-icon>
            </v-layout>
          </v-layout>
        </template>
      </v-treeview>
    </v-navigation-drawer>
    <v-toolbar absolute app clipped-left>
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <span class="title ml-3 mr-5">
        DolphinApp&nbsp;
        <span class="font-weight-light">Web</span>
      </span>
      <v-text-field solo-inverted flat hide-details label="Search" prepend-inner-icon="search"></v-text-field>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <v-container fluid grid-list-lg fill-height>
        <v-layout column>
          <div class="home-header">
            <h1>{{ currentDeck.name }}</h1>
            <v-spacer></v-spacer>
            <v-btn dark color="red" @click="toDeleteAll">delete all</v-btn>
            <v-btn dark color="primary" @click="toReview">Review</v-btn>
          </div>
          <v-layout fill-height align-center justify-center v-if="loadingCards">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-layout>
          <v-layout v-else row wrap>
            <card
              @del="toDel(c)"
              @edit="toEdit(c, i)"
              v-for="(c,i) in cards"
              :card="c"
              :key="c.id"
            />
          </v-layout>
        </v-layout>
      </v-container>
      <v-expansion-panel fluid class="expansion-panel" expand v-model="expand">
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
                  <v-btn color="warnning" block @click.prevent="toCancel">Cancel</v-btn>
                  <v-btn color="success" block @click.prevent="toUpdate">Save</v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="success" block type="submit">Add</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-content>

    <v-snackbar :top="true" :timeout="3000" v-model="snackbar.show">{{ snackbar.msg }}</v-snackbar>
    <v-dialog v-model="addDeck.dialog" width="300">
      <v-card class="pa-3">
        <v-card-title>添加牌组</v-card-title>
        <v-text-field v-model="addDeck.name"></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn dark @click="addDeck.dialog = false">Cancel</v-btn>
          <v-btn dark @click="toAddDeck">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  </v-app>
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
      addDeck: {
        dialog: false,
        name: ""
      },
      editDeck: {
        name: "",
        deck: ""
      },
      nodes: [],
      active: [],
      deck: [],
      decks: [
        {
          id: "1",
          name: "javascript",
          children: [
            {
              id: "2",
              name: "performance"
            }
          ]
        },
        {
          id: "3",
          name: "japanese",
          children: [
            {
              id: "4",
              name: "grammer"
            }
          ]
        }
      ],
      loadingCards: false,
      drawer: true,
      expand: [false],
      cards: [],
      selectedCard: {
        front: "",
        back: ""
      },
      currentIndex: -1,
      editing: false,
      deleteAllDialog: false,
      activeNode: "",
      currentDeck: ""
    };
  },
  beforeMount() {
    api.getDecks().then(resp => {
      this.decks = resp.data;
      if (this.decks.length > 0) {
        this.toDeck(this.decks[0]);
      }
    });
  },
  methods: {
    toDeck(item) {
      if (this.loadingCards) {
        return;
      }
      this.loadingCards = true;
      this.currentDeck = item;
      api.getCards(item._id).then(resp => {
        this.cards = resp.data;
        this.loadingCards = false;
      });
    },
    toAddDeck() {
      let data = {
        name: this.addDeck.name
      };
      let parent;
      if (this.activeNode) {
        parent = this.activeNode;
        data.parent = this.activeNode._id;
      }
      api
        .createDeck(data)
        .then(resp => {
          if (parent) {
            parent.children.push(resp.data);
          } else {
            this.decks.push(resp.data);
          }
          this.addDeck.dialog = false;
          this.addDeck.name = "";
          this.activeNode = "";
        })
        .catch(err => {
          console.log(err);
        });
    },
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
        .updateCard(
          this.currentDeck._id,
          this.selectedCard._id,
          this.selectedCard
        )
        .then(resp => {
          this.cards[this.currentIndex] = Object.assign({}, this.selectedCard);
          this.selectedCard = {};
          this.editing = false;
        })
        .catch(() => {
          this.editing = false;
        });
    },
    toDel(card) {
      api.removeCard(this.currentDeck._id, card._id).then(() => {
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
      api.createCard(this.currentDeck._id, body).then(resp => {
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
    },
    toEditNode(item, event) {
      event.preventDefault();
      event.stopPropagation();
      this.editDeck.deck = item;
      this.editDeck.name = item.name;
    },
    toUpdateNode() {
      let data = {
        name: this.editDeck.name
      };
      let id = this.editDeck.deck._id;
      api.updateDeck(id, data).then(resp => {
        this.editDeck.deck.name = this.editDeck.name;
        this.editDeck.deck = "";
      });
    },
    toDeleteNode(item) {
      function findParent(decks, id) {
        for (let d of decks) {
          if (d.children && d.children.findIndex(c => c._id === id) !== -1) {
            return d;
          } else {
            if (d.children) {
              return findParent(d.children, id);
            }
          }
        }
      }
      let parent = findParent(this.decks, item._id);
      api.deleteDeck(item._id).then(resp => {
        if (parent) {
          let idx = parent.children.findIndex(d => d._id === item._id);
          parent.children.splice(idx, 1);
          if (parent.children.length === 0) {
            delete parent.children;
          }
        } else {
          let idx = this.decks.findIndex(d => d._id === item._id);
          this.decks.splice(idx, 1);
        }
      });
    },
    toCreateNode(item) {
      if (item) {
        this.activeNode = item;
      }
      this.addDeck.dialog = true;
    }
  }
};
</script>

<style lang="stylus" scoped>
.v-toolbar .v-text-field {
  width: 20rem;
  flex-grow: 0;
}

.tree-node .tree-node__icon {
  display: none;
}

.tree-node:hover .tree-node__icon {
  display: initial;
}

.home-header {
  display: flex;
  flex-direction: row;
}
</style>

<style>
#app {
  font-family: "Roboto", "Microsoft Yahei", sans-serif;
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
