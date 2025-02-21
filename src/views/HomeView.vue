<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import $ from "jquery";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
  const success = await authStore.logout();
    if (success) {
      router.push("/login"); 
    }
};

// Task Management State
const tasks = ref([]);
const task = ref({ id: "", title: "", description: "", status: "pending", due_date: "", assigned_to: "" });
const filterStatus = ref("");
const editMode = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(5);
const users = ref([]);

const API_URL = import.meta.env.VITE_API_BASE_URL + "/tasks";
const USERS_URL = import.meta.env.VITE_API_BASE_URL + "/users"; 

// Fetch Users
const fetchUsers = () => {
  $.ajax({
    url: USERS_URL,
    type: "GET",
    headers: { Authorization: `Bearer ${authStore.token}` },
    success: (data) => {
      users.value = data; 
    },
    error: (err) => console.error("Error fetching users:", err),
  });
};

// Fetch Tasks
const fetchTasks = () => {
  let url = `${API_URL}?page=${currentPage.value}&per_page=${perPage.value}`;
  if (filterStatus.value) url += `&status=${filterStatus.value}`;

  $.ajax({
    url,
    type: "GET",
    headers: { Authorization: `Bearer ${authStore.token}` },
    success: (data) => {
      tasks.value = data.tasks; 
      totalPages.value = data.total_pages; 
    },
    error: (err) => console.error("Error fetching tasks:", err),
  });
};

// Submit Task (Create / Update)
const submitTask = () => (editMode.value ? updateTask() : createTask());

// Create Task
const createTask = () => {
  $.ajax({
    url: API_URL,
    type: "POST",
    headers: { Authorization: `Bearer ${authStore.token}` },
    data: task.value,
    success: () => {
      fetchTasks();
      resetForm();
    },
    error: (err) => console.error("Error creating task:", err),
  });
};

// Edit Task
const editTask = (t) => {
  task.value = { ...t };
  editMode.value = true;
};

// Update Task
const updateTask = () => {
  $.ajax({
    url: `${API_URL}/${task.value.task_id}`,
    type: "PUT",
    headers: { Authorization: `Bearer ${authStore.token}` },
    data: task.value,
    success: () => {
      fetchTasks();
      resetForm();
    },
    error: (err) => console.error("Error updating task:", err),
  });
};

// Delete Task
const deleteTask = (id) => {
  if (confirm("Are you sure?")) {
    $.ajax({
      url: `${API_URL}/${id}`,
      type: "DELETE",
      headers: { Authorization: `Bearer ${authStore.token}` },
      success: () => fetchTasks(),
      error: (err) => console.error("Error deleting task:", err),
    });
  }
};

// Reset Form
const resetForm = () => {
  task.value = { id: "", title: "", description: "", status: "pending", due_date: "", assigned_to: "" };
  editMode.value = false;
};

// Pagination
const goToPage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchTasks();
  }
};

// Fetch tasks and users on component mount
onMounted(() => {
  fetchTasks();
  fetchUsers();
});
</script>

<template>
  <div class="dashboard-container">

    <h2>Welcome, {{ authStore.user?.name || "User " }}</h2>
    <p>You are now logged in.</p>
    <h3>Task Manager</h3>

    <!-- Task Form -->
    <div class="task-form">
      <h4>{{ editMode ? "Edit Task" : "Create Task" }}</h4>
      <form @submit.prevent="submitTask">
        <div class="form-row">
          <input type="text" v-model="task.title" placeholder="Title" required class="form-control" />
          <textarea v-model="task.description" placeholder="Description" class="form-control"></textarea>
          <select v-model="task.assigned_to" class="form-control" required>
            <option value="">Select User</option>
            <option v-for="user in users" :key="user.user_id" :value="user.user_id">{{ user.name }}</option>
          </select>
          <input type="date" v-model="task.due_date" class="form-control" required />
          <select v-model="task.status" class="form-control">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit" class="btn btn-primary">{{ editMode ? "Update" : "Create" }}</button>
          <button v-if="editMode" @click="resetForm" class="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Filter by Status -->
    <div class="mb-3">
      <label for="statusFilter">Filter by Status:</label>
      <select v-model="filterStatus" class="form-select" @change="fetchTasks">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>


    <!-- Task List -->
    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Assigned To</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tasks" :key="t.id">
          <td>{{ t.title }}</td>
          <td>{{ t.description }}</td>
          <td>{{ t.assigned_to }}</td>
          <td>{{ t.due_date }}</td>
          <td>{{ t.status }}</td>
          <td>
            <button @click="editTask(t)" class="btn btn-warning">Edit</button>
            <button @click="deleteTask(t.task_id)" class="btn btn-danger">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <nav>
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" @click="goToPage(currentPage - 1)">Previous</a>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
          <a class="page-link" @click="goToPage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" @click="goToPage(currentPage + 1)">Next</a>
        </li>
      </ul>
    </nav>

    <hr />
    <br>
    <br>
    <button @click="handleLogout">Logout</button>

  </div>
</template>

<style scoped>
.dashboard-container {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background: #181818;
  color: white;
  border-radius: 8px;
  margin: auto;
}

button {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 14px;
}

button:hover {
  background: #e63939;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-control {
  flex: 1;
  min-width: 150px;
  padding: 10px;
  border: 1px solid #444;
  background: #222;
  color: white;
  border-radius: 5px;
}


.form-control, 
.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #444;
  background: #222;
  color: white;
  border-radius: 5px;
}

.table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  background: #222;
  border-radius: 8px;
  overflow: hidden;
}

.table th,
.table td {
  padding: 12px;
  border-bottom: 1px solid #444;
  text-align: center;
}

.table th {
  background: #333;
  font-weight: bold;
}

.table tbody tr:hover {
  background: #292929;
}

.pagination {
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 10px 0;
}

.pagination .page-item {
  margin: 0 5px;
}

.pagination .page-link {
  padding: 8px 12px;
  background: #ff4d4d;
  color: white;
  border-radius: 5px;
  text-decoration: none;
}

.pagination .page-link:hover {
  background: #e63939;
}

/* Task Form */
.task-form {
  background: #181818;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
</style>
