<template>
  <router-view></router-view>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
import Home from "./components/Home/index.vue";

export default {
  name: "App",
  components: {
    Home
  },
  data() {
    return {
      //
    };
  }
};
</script>

<style>
</style>

<style lang="stylus" scoped>
html, body {
}

.search {
  width: 6rem;
}
</style>

