// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';  // Import Navigate only once
import Login from './pages/Login';
import Register from './pages/Register';
import NoteApp from './pages/NoteApp';

// Define ProtectedRoute directly in App.tsx for now
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/notes" 
          element={
            <ProtectedRoute>
              <NoteApp />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/notes" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
