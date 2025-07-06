import { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (user && currentPage !== 'home') {
    setCurrentPage('home');
  }

  return (
    <div className="app-container">
      {currentPage === 'login' && <Login setCurrentPage={setCurrentPage} />}
      {currentPage === 'register' && <Register setCurrentPage={setCurrentPage} />}
      {currentPage === 'home' && user && <Home setCurrentPage={setCurrentPage} />}
    </div>
  );
}

export default App;