# Task Manager

A web-based task management application built with a Kanban-style interface to help teams collaborate efficiently. Users can create, update, delete, and move tasks across Todo, In Progress, and Done columns with real-time updates. The app supports user assignment, activity tracking, and conflict resolution to ensure a smooth workflow. Designed for responsiveness across desktop, tablet, and mobile devices.

---

## 🔧 Tech Stack

### Frontend:
- **React** – Component-based UI development  
- **React DnD** – Drag-and-drop functionality  
- **Axios** – HTTP client for API requests  
- **Socket.io-client** – Real-time updates via WebSocket  
- **CSS** – Custom styling with media queries  
- **Tailwind CSS** *(optional)* – Utility-first CSS framework  

### Backend:
- **Node.js / Express** – REST API and WebSocket server  
- **MongoDB** – Database for tasks, users, activity logs  
- **JWT** – Authentication via JSON Web Tokens  

### Development Tools:
- **Vite** – Fast frontend bundler  
- **Git** – Version control  

---

## 🚀 Setup and Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Git
- MongoDB URI

---

### 🔧 Clone and Setup (Single Repo for Backend + Frontend)

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Murali3824/Task_Manager.git
   cd Task_Manager
   ```

---

### 🔁 Backend Setup

1. **Navigate to Backend Folder:**
   ```bash
   cd server
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in `server/`:
   ```
   PORT=5000 
   MONGO_URI=<your-mongo-db-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```

4. **Run the Backend Server:**
   ```bash
   npm start
   ```

---

### 💻 Frontend Setup

1. **Navigate to Frontend Folder:**
   ```bash
   cd client
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in `client/`:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Run the Frontend Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Both Locally

1. Start the **backend** (`npm run dev` in `/server` — runs on port `5000`).
2. Start the **frontend** (`npm run dev` in `/client` — runs on port `3000`).
3. Login with a valid user to access the Task Manager.

---

## ✨ Features

- **Task Management:** Create, update, delete, and drag tasks between columns (Todo, In Progress, Done)  
- **Real-Time Updates:** Instantly reflect task changes across clients using WebSocket  
- **User Assignment:** Assign tasks to specific users  
- **Priority Levels:** Set priority as Low, Medium, or High  
- **Activity Log:** View detailed task history with timestamps and user actions  
- **Conflict Handling:** Resolve task update conflicts using merge or overwrite options  
- **Responsive Design:** Seamlessly adapts to desktop, tablet, and mobile screens  

---

## 📘 Usage Guide

- **Login:** Authenticate to access the app (redirects to login if unauthenticated)  
- **Add a Task:** Enter title, description, priority, and assign a user  
- **Move Tasks:** Drag-and-drop tasks across columns  
- **Edit Tasks:** Click on "Edit" to modify task details  
- **Activity Log:** Scroll to view a chronological list of task-related actions  
- **Logout:** Use the logout button in the header to end your session  

---

## 🤖 Smart Assign Logic

- **Dropdown Assignment:** On task creation or edit, select a user from the dropdown (fetched from `/api/auth/users`)  
- **Backend Integration:** `assignedUser` is sent via API (POST/PUT)  
- **Display:** Task card shows assigned user’s name or “Unassigned” if null  

**Benefit:** Clear ownership of tasks, enabling better accountability.

---

## 🔄 Conflict Handling Logic

- **Detection:** When a task update conflicts with the server version, a `409 Conflict` is triggered  
- **Resolution:**
  - **Merge:** Combine client and server data  
  - **Overwrite:** Apply client-side changes  
- **API Call:** Conflict resolution is sent via `POST /api/tasks/:taskId/resolve`  

**Benefit:** Prevents data loss and supports safe concurrent editing.

---

## 🌐 Deployment Links

- **Live App:** [https://taskmanager-app-re7c.onrender.com/](https://taskmanager-app-re7c.onrender.com)  
- **Demo Video:** [https://drive.google.com/file/d/16-vSgzXq4edKXt-OqzKUIsTuJS0RvH_D/view?usp=drive_link](https://drive.google.com/file/d/16-vSgzXq4edKXt-OqzKUIsTuJS0RvH_D/view?usp=drive_link)  

---

## 📂 License

This project is licensed for educational and demonstration purposes. Modify and adapt as needed.
