import React from 'react';
import ReactDOM from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from'./context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <DndProvider backend={HTML5Backend}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </DndProvider>
);