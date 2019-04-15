<template>
  <v-flex xs6 sm3 md2>
    <v-card color="yellow" class="card">
      <v-menu bottom left class>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" class="menu-entry">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile @click="toEdit">
            <v-list-tile-title>编辑</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="toDelete">
            <v-list-tile-title>删除</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-card-text>{{ card.front }}</v-card-text>
    </v-card>
    <v-dialog v-model="dialog" max-width="300">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>你确定要删除该卡片吗?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="yellow" @click="dialog = false">取消</v-btn>
          <v-btn color="red" @click="confirmDelete">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
export default {
  props: {
    card: {
      type: Object,
      default: {
        front: "",
        back: ""
      }
    }
  },
  data() {
    return {
      dialog: false
    };
  },
  methods: {
    toEdit() {
      this.$emit("edit");
      console.log("to edit");
    },
    toDelete() {
      this.dialog = true;
      this.console.log("to delete");
    },
    confirmDelete() {
      this.$emit("del");
      this.dialog = false;
    }
  }
};
</script>

<style lang="stylus" scoped>
.card {
  height: 180px;
  overflow: auto;
}

.card .menu-entry {
  position: absolute;
  right: 0;
  top: 0;
}

.card .card__actions {
  display: none;
}

.card:hover .card__actions {
  display: initial;
}

.card .v-card__text {
  font-family: 'Microsoft Yahei';
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>

