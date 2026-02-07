<template>
  <div>
    <h1>Market</h1>
    <CompraVenta :userID="userID" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import CompraVenta from "../components/CompraVenta.vue";

export default {
  name: "MarketView",
  components: {
    CompraVenta,
  },
  computed: {
    ...mapState({
      userID: (state) => state.userID,
    }),
  },
};
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}
</style>
