import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NoteApp from './pages/NoteApp';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
 const token = localStorage.getItem('token');
 return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notes" element={<ProtectedRoute><NoteApp /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/notes" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
