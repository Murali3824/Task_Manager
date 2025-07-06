import { useState, useContext } from 'react';
import { useDrag } from 'react-dnd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './TaskCard.css';

const TaskCard = ({ task, users }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState(task);
  const { token } = useContext(AuthContext);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task._id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleSmartAssign = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/${task._id}/smart-assign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditTask(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`,
        { ...editTask, version: task.version },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 409) {
        const choice = prompt(
          `Conflict detected! Choose an option:\n1. Merge (combine changes)\n2. Overwrite (use your changes)\nEnter "merge" or "overwrite":`
        );
        if (choice) {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/tasks/${task._id}/resolve`,
            {
              action: choice,
              mergeData: choice === 'merge' ? { ...err.response.data.currentTask, ...editTask } : editTask,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        alert(err.response?.data?.message || 'Failed to update task');
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <>
      <div ref={drag} className={`task-card ${isDragging ? 'dragging' : ''}`}>
        <h4>{task.title}</h4>
        <p>{task.priority}</p>
        <p>{task.assignedUser ? task.assignedUser.username : 'Unassigned'}</p>
        <div className="task-actions">
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={handleSmartAssign}>Smart Assign</button>
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        </div>
      </div>
      {isEditing && (
        <div className="edit-form-container active">
          <div className="edit-form-backdrop" onClick={() => setIsEditing(false)} />
          <div className="edit-form">
            <div className="form-header">
              <h4>Edit Task</h4>
              <button className="close-btn" onClick={() => setIsEditing(false)}>×</button>
            </div>
            <div className="form-group">
              <input
                type="text"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                autoFocus
              />
              <label>Task Title</label>
            </div>
            <div className="form-group">
              <textarea
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              />
              <label>Description</label>
            </div>
            <div className="form-group">
              <select
                value={editTask.priority}
                onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <label>Priority</label>
            </div>
            <div className="form-group">
              <select
                value={editTask.assignedUser?._id || ''}
                onChange={(e) => {
                  const selectedUser = users.find((u) => u._id === e.target.value) || null;
                  setEditTask({ ...editTask, assignedUser: selectedUser });
                }}
              >
                <option value="">Unassigned</option>
                {users.length > 0 ? (
                  users.map((user) => (
                    <option key={user._id} value={user._id}>{user.username}</option>
                  ))
                ) : (
                  <option disabled>No users available</option>
                )}
              </select>
              <label>Assigned To</label>
            </div>
            <div className="form-actions">
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;