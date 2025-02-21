import { defineStore } from "pinia";
import api from "@/api"; // Axios instance

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("accessToken") || null,
  }),
  actions: {
    async login(email, password) { 
      try {
        const response = await api.post("/auth/login", { email, password });
  
        const token = response.data.accessToken;
        if (!token) {
          throw new Error("Authentication failed: No access token received.");
        }
  
        this.token = token;
        this.user = response.data.user;
  
        localStorage.setItem("accessToken", this.token);
        localStorage.setItem("user", this.user);
        api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
  
        return true; 
  
      } catch (error) {
        throw new Error(error.response?.data?.message || "Invalid email or password");
      }
    },

    async logout(router) { 
      if (!this.token) return;
      try {
        await api.post("/auth/logout", {}, { 
          headers: { Authorization: `Bearer ${this.token}` } 
        });

        this.user = null;
        this.token = null;

        localStorage.removeItem("accessToken");
        delete api.defaults.headers.common["Authorization"];

        return true; 

      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  },
});
