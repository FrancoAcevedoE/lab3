<template>
  <div>
    <History :userID="userID"/>
  </div>
</template>

<script>
import { mapState } from "vuex";
import History from "@/components/History.vue";

export default {
  name: "HistoryView",
  components: {
    History,
  },
  computed: {
    ...mapState({
      userID: (state) => state.userID,
    }),
  },
};
</script>

<style scoped>

</style>
