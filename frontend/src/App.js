import './App.css';
import Login from './components/login';
import Registration from './components/registration';
import Dashboard from '../src/components/dashboard';
import { Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert("Problem") // Redirect to login if not authenticated
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} ></Route>
        <Route path='/registration' element={<Registration />} ></Route>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard /> {/* Protected route for Dashboard */}
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
