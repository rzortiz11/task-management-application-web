import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }, 
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/',
      redirect: '/home', 
    },
  ],
});

// Add navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");

  console.log("Stored Token:", token);
  console.log("User:", user);

  if (to.meta.requiresAuth) {
    if (!token) {
      console.log("No token found, redirecting to login.");
      return next("/login");
    }
  }

  if (token && to.path === "/login") {
    console.log("User  is logged in, redirecting to home.");
    return next("/home");
  }

  next();
});
export default router;