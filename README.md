# task-management-web

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Compile and Minify for Production
 - update the .env
   ex. VITE_API_BASE_URL=http://127.0.0.1:8000/api


# Scenario: 
You are tasked with developing a basic Task Management application. Users should be able to create, assign, update, and view tasks. 
Requirements: 
## (Laravel & Database) 
  1. Database Design (MySQL): 
   -  Design a database schema with the necessary tables for tasks, users, and any other relevant entities. Include relevant fields like task title, description, due date, status (e.g., pending, in progress, completed), assigned user, created by user, timestamps. 
   -  Provide the SQL script to create the database and tables. 
  2. Laravel API: 
   - Develop a RESTful API using Laravel. The API should handle the following functionalities: 
       - Create Task: Accept task details (title, description, due date, assigned user ID, etc.) and store them in the database. 
       -  List Tasks: Retrieve a list of tasks, optionally filtered by status or assigned user. Implement pagination for large datasets. 
       - User Authentication (Basic): Implement a simple authentication mechanism (e.g., using API tokens) to protect the API endpoints. No need for complex user management. 
   - Adhere to RESTful API conventions and use appropriate HTTP methods and status codes. 
   - Implement proper error handling and validation for all API requests. 
   - Write unit tests for the API endpoints. 

## (HTML, JS, jQuery, VUE) 
  1. Frontend Interface: 
    - Develop a user interface using HTML, JavaScript, jQuery, and a Vue engine (e.g., Blade in Laravel, or a separate JS framework like Vue.js - candidate's choice). 
    - The interface should allow users to: 
       ■View a list of tasks (fetched from the API). 
       ■ Create new tasks (using a form that submits data to the API). 
       ■ Edit existing tasks. 
       ■ Delete tasks. 
       ■ Filter tasks by status.
    - Focus on a clean and user-friendly design. No need for complex styling, but basic usability is essential. 
  2. API Integration: 
    - Use JavaScript/jQuery to make AJAX requests to the Laravel API to perform CRUD operations on tasks. 
 
 ##Deliverables: 
   - Git Repository:
     - Backend Repo - https://github.com/ZerrudOrtiz/task-management-application
     - Frontend Repo -  https://github.com/ZerrudOrtiz/task-management-application-web
   - SQL Script for Database Schema:
     - Configure database credentials in .env
   - Run: sail artisan migrate
     -Unit Tests for the API:
     - Run: sail artisan test
