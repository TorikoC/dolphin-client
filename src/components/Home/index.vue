<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" fixed clipped class="grey lighten-4" app>
      <v-btn @click="newTag.dialog = true">新建标签</v-btn>
      <v-list>
        <v-list-tile @click="queryAllCards">All Cards</v-list-tile>
        <template v-for="(tag,index) in tags">
          <v-list-tile :key="tag._id" @click="queryCards(tag)">
            <template v-if="editTag.index === index">
              <v-text-field v-model="editTag.name"></v-text-field>
              <v-btn @click.stop="editTag.index = -1">Cancel</v-btn>
              <v-btn @click.stop="saveNewTag(tag,index)" color="primary">Confirm</v-btn>
            </template>
            <template v-else>
              <v-list-tile-content>{{ tag.name }}</v-list-tile-content>
              <v-list-tile-action @click.stop="toEditTag(tag, index)">
                <v-icon>edit</v-icon>
              </v-list-tile-action>
              <v-list-tile-action>
                <v-icon @click.stop="toDeleteTag(tag, index)">delete</v-icon>
              </v-list-tile-action>
            </template>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app clipped-left>
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
            <h1>{{ currentTag}}</h1>
            <v-spacer></v-spacer>
            <v-btn dark color="red" @click="toDeleteAll">delete all</v-btn>
            <v-btn dark color="primary" @click="toReview">Review</v-btn>
          </div>
          <div class="text-xs-right">
            <v-pagination v-model="page" :length="total"></v-pagination>
          </div>
          <v-layout fill-height align-center justify-center v-if="loadingCards">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-layout>
          <v-layout fill-height align-center justify-center v-else-if="cards.length === 0">
            <p>no cards found - - !</p>
          </v-layout>
          <v-layout v-else row wrap>
            <card
              @del="toDel(c)"
              @edit="toEdit(c, i)"
              v-for="(c,i) in cards"
              :card="c"
              :key="c._id"
            />
          </v-layout>
        </v-layout>
      </v-container>
    </v-content>
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
            <template v-if="editing">
              <v-autocomplete
                v-model="editCard.tags"
                :items="tags"
                multiple
                item-text="name"
                item-value="_id"
              >
                <template v-slot:selection="data">
                  <v-chip close @input="removeTag2(data.item)">{{data.item.name}}</v-chip>
                </template>
              </v-autocomplete>
              <v-layout>
                <v-flex xs12 sm6>
                  <v-textarea
                    ref="front"
                    name="front"
                    label="front"
                    v-model="editCard.front"
                    outline
                    append-outer-icon
                    box
                    required
                    no-resize
                  ></v-textarea>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-textarea
                    ref="back"
                    name="back"
                    v-model="editCard.back"
                    label="back"
                    outline
                    no-resize
                    box
                    required
                  ></v-textarea>
                </v-flex>
              </v-layout>
              <v-flex xs12>
                <v-btn color="warnning" block @click.prevent="toCancel">Cancel</v-btn>
                <v-btn color="success" block @click.prevent="toUpdate">Save</v-btn>
              </v-flex>
            </template>
            <template v-else>
              <v-autocomplete
                v-model="newCard.tags"
                :items="tags"
                multiple
                item-text="name"
                item-value="_id"
              >
                <template v-slot:selection="data">
                  <v-chip close @input="removeTag(data.item)">{{data.item.name}}</v-chip>
                </template>
              </v-autocomplete>
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
                    no-resize
                  ></v-textarea>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-textarea
                    ref="back"
                    name="back"
                    v-model="selectedCard.back"
                    label="back"
                    outline
                    no-resize
                    box
                    required
                  ></v-textarea>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-btn color="success" block type="submit">Add</v-btn>
              </v-layout>
            </template>
          </v-container>
        </v-form>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-snackbar :top="true" :timeout="3000" v-model="snackbar.show">{{ snackbar.msg }}</v-snackbar>
    <v-dialog v-model="newTag.dialog" width="300">
      <v-card class="pa-3">
        <v-card-title>新建标签</v-card-title>
        <v-text-field v-model="newTag.name"></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="newTag.dialog = false">Cancel</v-btn>
          <v-btn @click="toCreateTag" color="primary">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      newTag: {
        dialog: false,
        name: ""
      },
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
      currentDeck: "",
      page: 1,
      total: 1,
      tags: [],
      editTag: {
        index: -1,
        name: ""
      },
      newCard: {
        tags: []
      },
      editCard: {
        index: -1,
        front: "",
        back: "",
        tags: []
      },
      currentTag: {}
    };
  },
  watch: {
    page(value) {
      this.toDeck(this.currentDeck);
    }
  },
  beforeMount() {
    api.getCards().then(resp => {
      this.cards = resp.data.list;
      this.total = resp.data.total;
    });
    api.getTags().then(resp => {
      this.tags = resp.data;
    });
  },
  methods: {
    queryAllCards() {
      this.currentTag = "All";
      api.getCards().then(resp => {
        this.cards = resp.data.list;
        this.total = resp.data.total;
      });
    },
    queryCards(tag) {
      this.currentTag = tag.name;
      api.getCards({ tags: tag._id }).then(resp => {
        this.cards = resp.data.list;
        this.total = resp.data.total;
      });
    },
    toDeleteTag(tag, index) {
      api.deleteTag(tag._id).then(resp => {
        this.tags.splice(index, 1);
      });
    },
    saveNewTag(tag, index) {
      let body = {
        name: this.editTag.name
      };
      api.updateTag(tag._id, body).then(resp => {
        this.tags[index].name = resp.data.name;
        this.editTag.index = -1;
      });
    },
    toEditTag(tag, index) {
      this.editTag.index = index;
      this.editTag.name = tag.name;
    },
    toCreateTag() {
      if (!this.newTag.name) return;
      if (!this.newTag.name.trim()) return;
      let body = {
        name: this.newTag.name
      };
      api
        .createTag(body)
        .then(resp => {
          this.tags.push(resp.data);
          this.newTag.name = "";
          this.newTag.dialog = false;
        })
        .catch(err => {
          this.newTag.name = "";
          this.newTag.dialog = false;
        });
    },
    toDeck(item) {
      if (this.loadingCards) {
        return;
      }
      this.loadingCards = true;
      this.currentDeck = item;
      api.getCards(item._id, { page: this.page }).then(resp => {
        this.cards = resp.data.list;
        this.total = resp.data.total;
        this.loadingCards = false;
      });
    },
    removeTag2(item) {
      let index = this.editCard.tags.findIndex(n => n === item._id);
      if (index !== -1) this.editCard.tags.splice(index, 1);
    },
    removeTag(item) {
      let index = this.newCard.tags.findIndex(n => n === item._id);
      if (index !== -1) this.newCard.tags.splice(index, 1);
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
      this.editCard.index = index;
      this.editCard._id = card._id;
      this.editCard.front = card.front;
      this.editCard.back = card.back;
      this.editCard.tags = card.tags;
      this.editing = true;
      this.$set(this.expand, 0, true);
    },
    toCancel() {
      this.editing = false;
    },
    toUpdate() {
      let body = {
        front: this.editCard.front,
        back: this.editCard.back,
        tags: this.editCard.tags
      };
      api
        .updateCard(this.editCard._id, body)
        .then(resp => {
          this.cards[this.editCard.index] = Object.assign({}, resp.data);
          this.editCard = {
            index: -1,
            front: "",
            back: "",
            tags: []
          };
          this.editing = false;
        })
        .catch(err => {
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
        back: this.selectedCard.back,
        tags: this.newCard.tags
      };
      api.createCard(body).then(resp => {
        this.cards.unshift(resp.data);
        this.selectedCard.front = "";
        this.selectedCard.back = "";
        this.newCard.tags = [];
      });
    },
    toReview() {
      if (this.cards.length < 1) {
        this.snackbar.show = true;
        this.snackbar.msg = "没有卡片可以复习- -!";
        return;
      }
      this.$router.push("/room/" + this.currentDeck._id);
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
.v-textarea textarea {
  text-align: center;
}
.expansion-panel {
  position: fixed;
  bottom: 0;
  z-index: 9999;
}
.v-expansion-panel__header__icon {
  width: 100%;
  color: white;
  text-align: center;
}
</style>
