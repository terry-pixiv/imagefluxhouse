<script>
import { auth } from "@/plugins/firebase";

export default {
  async beforeRouteEnter(to, from, next) {
    await auth.signOut();
    next({ name: "Home" });
  },
};
</script>
