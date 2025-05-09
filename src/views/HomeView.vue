<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import $ from "jquery";

const authStore = useAuthStore();
const router = useRouter();

const showModal = ref(false);

const tasks = ref([]);
const task = ref({ id: "", title: "", description: "", status: "todo", due_date: "", user_id: "" , order: "", priority: "low"});
const filterStatus = ref("");
const filterTitle = ref("");
const filterAssignedTo = ref("");
const editMode = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = ref(5);
const users = ref([]);
const sortTitle = ref("");
const sortCreatedDate = ref("");

const API_URL = import.meta.env.VITE_API_BASE_URL + "/tasks";
const USERS_URL = import.meta.env.VITE_API_BASE_URL + "/users";

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) router.push("/login");
};

const fetchUsers = () => {
  $.ajax({
    url: USERS_URL,
    type: "GET",
    headers: { Authorization: `Bearer ${authStore.token}` },
    success: (data) => users.value = data,
    error: (err) => console.error("Error fetching users:", err),
  });
};

const fetchTasks = () => {
  let url = `${API_URL}?page=${currentPage.value}&per_page=${perPage.value}`;
  if (filterStatus.value) url += `&status=${filterStatus.value}`;
  if (filterTitle.value) url += `&title=${encodeURIComponent(filterTitle.value)}`;
  if (filterAssignedTo.value) url += `&user_id=${filterAssignedTo.value}`;
  if (sortTitle.value) url += `&sort_title=${sortTitle.value}`;
  if (sortCreatedDate.value) url += `&sort_created_date=${sortCreatedDate.value}`;

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

const submitTask = () => (editMode.value ? updateTask() : createTask());

const createTask = () => {
  $.ajax({
    url: API_URL,
    type: "POST",
    headers: { Authorization: `Bearer ${authStore.token}` },
    data: task.value,
    success: () => {
      fetchTasks();
      resetForm();
      showModal.value = false;
    },
    error: (err) => console.error("Error creating task:", err),
  });
};

const editTask = (t) => {
  task.value = { ...t };
  editMode.value = true;
  showModal.value = true;
};

const updateTask = () => {
  $.ajax({
    url: `${API_URL}/${task.value.task_id}`,
    type: "PUT",
    headers: { Authorization: `Bearer ${authStore.token}` },
    data: task.value,
    success: () => {
      fetchTasks();
      resetForm();
      showModal.value = false;
    },
    error: (err) => console.error("Error updating task:", err),
  });
};

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

const resetForm = () => {
  task.value = { id: "", title: "", description: "", status: "todo", due_date: "", user_id: "", order: "", priority: "low" };
  editMode.value = false;
};

const goToPage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchTasks();
  }
};

const toggleTaskVisibility = (task) => {
  const newVisibility = task.visible === 1 ? 0 : 1;

  $.ajax({
    url: `${API_URL}/${task.task_id}/toggle`,
    type: "PUT",
    headers: { Authorization: `Bearer ${authStore.token}` },
    data: { visible: newVisibility },
    success: (updatedTask) => {
      task.visible = updatedTask.visible; 
    },
    error: (err) => console.error("Error toggling visibility:", err),
  });
};

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

    <div class="button-container">
      <button @click="showModal = true" class="btn btn-success">Create New Task</button>
    </div>


<div v-if="showModal" class="modal-overlay">
  <div class="modal-content">
    <h4>{{ editMode ? "Edit Task" : "Create Task" }}</h4>
    <form @submit.prevent="submitTask">
      <div class="form-row">
        <div class="form-group col-12">
          <label for="taskTitle">Title</label>
          <input id="taskTitle" type="text" v-model="task.title" placeholder="Title" required class="form-control" />
        </div>

        <div class="form-group col-12">
          <label for="taskDescription">Description</label>
          <textarea id="taskDescription" v-model="task.description" placeholder="Description" class="form-control"></textarea>
        </div>

        <div class="form-row col-12">
          <div class="form-group col-6">
            <label for="taskUser">Assign User</label>
            <select id="taskUser" v-model="task.user_id" class="form-control" required>
              <option value="">Select User</option>
              <option v-for="user in users" :key="user.user_id" :value="user.user_id">{{ user.name }}</option>
            </select>
          </div>

          <div class="form-group col-6">
            <label for="taskDueDate">Due Date</label>
            <input id="taskDueDate" type="date" v-model="task.due_date" class="form-control" required />
          </div>

          <div class="form-group col-6">
            <label for="taskStatus">Status</label>
            <select id="taskStatus" v-model="task.status" class="form-control">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div class="form-group col-6">
            <label for="taskPriority">Priority</label>
            <select id="taskPriority" v-model="task.priority" class="form-control">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div class="form-group col-12">
          <label for="taskOrder">Order</label>
          <input id="taskOrder" type="text" v-model="task.order" class="form-control" placeholder="Order" required />
        </div>
      </div>

      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">{{ editMode ? "Update" : "Create" }}</button>
        <button type="button" @click="showModal = false; resetForm()" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  </div>
</div>


  <div class="form-row">
  <input type="text" v-model="filterTitle" placeholder="Search by Title" class="form-control" @input="fetchTasks" />

  <select v-model="filterStatus" class="form-control" @change="fetchTasks">
    <option value="">All Statuses</option>
    <option value="todo">To Do</option>
    <option value="in_progress">In Progress</option>
    <option value="done">Done</option>
  </select>

  <select v-model="filterAssignedTo" class="form-control" @change="fetchTasks">
    <option value="">All Users</option>
    <option v-for="user in users" :key="user.user_id" :value="user.user_id">{{ user.name }}</option>
  </select>

  <select v-model="sortTitle" class="form-control" @change="fetchTasks">
      <option value="">Sort by Title</option>
      <option value="asc">Title (A → Z)</option>
      <option value="desc">Title (Z → A)</option>
    </select>

    <select v-model="sortCreatedDate" class="form-control" @change="fetchTasks">
      <option value="">Sort by Created Date</option>
      <option value="asc">Oldest First</option>
      <option value="desc">Newest First</option>
    </select>
</div>

    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Assigned To</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Order</th>
          <th>Created Date</th>
          <th>Visible</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tasks" :key="t.task_id">
          <td>{{ t.title }}</td>
          <td>{{ t.description }}</td>
          <td>{{ t.name }}</td>
          <td>{{ t.due_date }}</td>
          <td>{{ t.status }}</td>
          <td>{{ t.priority }}</td>
          <td>{{ t.order }}</td>
          <td>{{ t.created_at }}</td>
          <td>
            <input
              type="checkbox"
              :checked="t.visible === 1"
              @change="toggleTaskVisibility(t)"
            />
          </td>
          <td>
            <button @click="editTask(t)" class="btn btn-warning">Edit</button>
            <button @click="deleteTask(t.task_id)" class="btn btn-danger">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <br>

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
    <br>
    <hr />
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

.button-container {
  width: 100%;
  display: flex;
  justify-content: flex-end; 
  margin-bottom: 20px;
}


.pagination .page-link:hover {
  background: #e63939;
}

.task-form {
  background: #181818;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #222;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  color: white;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
</style>
