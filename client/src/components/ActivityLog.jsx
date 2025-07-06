import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ActivityLog.css';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const { token, socket } = useContext(AuthContext);

  useEffect(() => {
    fetchLogs();
    socket.on('taskUpdate', fetchLogs);
    return () => socket.off('taskUpdate');
  }, [socket]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch activity logs');
    }
  };

  const getActionStyle = (action) => {
    const styles = {
      create: { color: '#22c55e', label: 'Created' },
      update: { color: '#3b82f6', label: 'Updated' },
      delete: { color: '#ef4444', label: 'Deleted' },
      assign: { color: '#f59e0b', label: 'Assigned' },
    };
    return styles[action] || { color: '#64748b', label: action };
  };

  return (
    <div className="activity-container">
      <h3>Activity Log</h3>
      {error && <div className="error-message">{error}</div>}
      {logs.length === 0 ? (
        <div className="no-activity">No activity recorded</div>
      ) : (
        <ul className="activity-list">
          {logs.map((log) => {
            const { color, label } = getActionStyle(log.action);
            return (
              <li key={log._id} className="activity-item">
                <div className="activity-line">
                  <span className="action-dot" style={{ backgroundColor: color }} />
                  <span className="action-label">{label}</span>
                  <span className="log-time">{new Date(log.timestamp).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}</span>
                </div>
                <div className="activity-line">
                  <span className="log-user">{log.userId?.username || 'Unknown'}</span>
                  <span className="log-task">Task: {log.taskId?.title || 'Unknown'}</span>
                </div>
                <div className="activity-line">
                  <span className="log-desc">{log.details}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ActivityLog;