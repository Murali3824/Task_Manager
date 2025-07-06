import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import ActivityLog from '../components/ActivityLog';
import './Home.css';

const Home = ({ setCurrentPage }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    setCurrentPage('login');
    return null;
  }

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1>Task Manager</h1>
        <div className="user-section">
          <span className="user-name">Welcome, {user.username}</span>
          <button onClick={() => { logout(); setCurrentPage('login'); }}>Logout</button>
        </div>
      </header>
      <main className="home-main">
        <KanbanBoard />
        <ActivityLog />
      </main>
    </div>
  );
};

export default Home;