<template>
    <pre>{{ jsondata }}</pre>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      jsondata: null,
      error: null,
    };
  },
  mounted() {
    this.getBookCountAPI(); // Call the method when the component is mounted
  },
  methods: {
    async getBookCountAPI() {
      try {
        const response = await axios.get(
          "https://us-central1-week7-weifeng.cloudfunctions.net/countBooks"
        );
        this.jsondata = response.data;
        this.error = null;
      } catch (error) {
        console.error("Error fetching book count:", error);
        this.error = error;
        this.jsondata = null;
      }
    },
  },
};
</script>

<style>
#app {
  text-align: center;
  margin-top: 100px;
}
</style>
