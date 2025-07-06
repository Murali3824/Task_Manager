import { useState, useEffect, useContext } from 'react';
import { useDrop } from 'react-dnd';
import axios from 'axios';
import TaskCard from './TaskCard';
import { AuthContext } from '../context/AuthContext';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', assignedUser: null });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { token, socket } = useContext(AuthContext);

  useEffect(() => {
    console.log('Fetching tasks and users...');
    fetchTasks();
    fetchUsers();
    socket.on('taskUpdate', handleTaskUpdate);
    return () => socket.off('taskUpdate');
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Tasks fetched:', response.data);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Users fetched:', response.data);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]); // Fallback to empty array
      setError(err.response?.data?.message || 'Failed to fetch users');
    }
  };

  const handleTaskUpdate = (data) => {
    console.log('Received taskUpdate:', data);
    if (data.action === 'create') {
      setTasks((prev) => [...prev, data.task]);
    } else if (data.action === 'update') {
      setTasks((prev) =>
        prev.map((task) => (task._id === data.task._id ? data.task : task))
      );
    } else if (data.action === 'delete') {
      setTasks((prev) => prev.filter((task) => task._id !== data.taskId));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTask({ title: '', description: '', priority: 'Medium', assignedUser: null });
      fetchTasks(); // Fetch tasks to ensure the new task data is updated
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`,
        { ...task, status: newStatus, version: task.version },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log('Task moved successfully:', response.data);
    } catch (err) {
      if (err.response?.status === 409) {
        handleConflict(err.response.data, taskId);
      } else {
        alert(err.response?.data?.message || 'Failed to move task');
      }
    }
  };

  const handleConflict = async (conflictData, taskId) => {
    const choice = prompt(
      `Conflict detected! Choose an option:\n1. Merge (combine changes)\n2. Overwrite (use your changes)\nEnter "merge" or "overwrite":`
    );
    if (!choice) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/resolve`,
        {
          action: choice,
          mergeData: choice === 'merge' ? { ...conflictData.currentTask, ...conflictData.clientTask } : conflictData.clientTask,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve conflict');
    }
  };

  const columns = ['Todo', 'In Progress', 'Done'];

  const Column = ({ status }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'task',
      drop: (item) => moveTask(item.id, status),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    return (
      <div ref={drop} className={`column ${isOver ? 'highlight' : ''}`}>
        <h3>{status}</h3>
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <TaskCard key={task._id} task={task} users={users} />
          ))}
      </div>
    );
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="kanban-container">
      <form onSubmit={handleCreateTask} className="task-form">
        <div className="form-group">
          <input
            type="text"
            placeholder=" "
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <label>Task Title</label>
        </div>
        <div className="form-group">
          <textarea
            placeholder=" "
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <label>Description</label>
        </div>
        <div className="form-group">
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <label>Priority</label>
        </div>
        <div className="form-group">
          <select
            value={newTask.assignedUser || ''}
            onChange={(e) => setNewTask({ ...newTask, assignedUser: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>{user.username}</option>
            ))}
          </select>
          <label>Assigned To</label>
        </div>
        <button type="submit">Add Task</button>
      </form>
      <div className="columns">
        {columns.map((status) => (
          <Column key={status} status={status} />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;