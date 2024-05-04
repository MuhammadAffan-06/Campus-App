import './App.css';
import Login from './components/login';
import Registration from './components/registration';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} ></Route>
        <Route path='/registration' element={<Registration />} ></Route>
      </Routes>
    </BrowserRouter>

  );
}

export default App;
