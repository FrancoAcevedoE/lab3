<script>
import { createStore } from "vuex";

export default createStore({
  state: {
    userID: "",
  },
  mutations: {
    setUser(state, userID) {
      state.userID = userID;
    },
  },
});
</script>
