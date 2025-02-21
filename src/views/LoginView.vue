<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const email = ref("admin@taskmangement.ph");
const password = ref("");
const errorMessage = ref(null);
const authStore = useAuthStore();
const router = useRouter();

const login = async () => {
  try {
    const success = await authStore.login(email.value, password.value);
    if (success) {
      router.push("/home");
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
};
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <label>Email:</label>
      <input type="email" v-model="email" required />

      <label>Password:</label>
      <input type="password" v-model="password" required />

      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.login-container {
    grid-column: 1 / -1;
  max-width: 300px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}
input {
  display: block;
  width: 100%;
  padding: 8px;
  margin: 8px 0;
}
button {
  width: 100%;
  padding: 8px;
  background: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
.error {
  color: red;
}
</style>
