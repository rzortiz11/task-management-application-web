<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const name = ref("test");
const email = ref("@gmail.com");
const password = ref("");
const errorMessage = ref(null);
const authStore = useAuthStore();
const router = useRouter();

const register = async () => {
  try {
    const success = await authStore.register(name.value, email.value, password.value);
    if (success) {
      router.push("/home");
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
};

const goToLogin = () => {
  router.push("/login");
};
</script>

<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <label>Name:</label>
      <input type="text" v-model="name" required />

      <label>Email:</label>
      <input type="email" v-model="email" required />

      <label>Password:</label>
      <input type="password" v-model="password" required />

      <button type="submit">Register</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p>
      Already have an account?
      <button @click="goToLogin" class="link-btn">Login here</button>
    </p>
  </div>
</template>

<style scoped>
.register-container {
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
.link-btn {
  background: none;
  color: #42b983;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: 10px;
}
.error {
  color: red;
}
</style>
