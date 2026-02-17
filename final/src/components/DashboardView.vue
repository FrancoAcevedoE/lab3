<!-- esto sirve para ver el userID en el dashboard y trabajarlo en la api -->
<script>
export default {
  name: "DashboardView",
props: {
  userID: {
    type: String,
    required: true
  }
}
}
</script>

<!-- el dashboard es una interfaz grafica que centra, organiza y visaliza datos claves -->