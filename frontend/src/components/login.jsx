import '../styles/login.css';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { Link } from "react-router-dom";
import { useState } from 'react';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            console.log("Fields are not valid");
        }
        try {
            const response = await fetch('http://localhost:5001/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
            if (!response.ok) {
                throw new Error("Login failed");
            }
        } catch (error) {
            setError("Invalid login credentials", error);
        }
    }
    return (
        <header className='loginHeader'>
            <h1>Welcome to Campus ABC</h1>
            <h3>Don't have an account? Create one</h3>
            <Link to={"/registration"}>
                <Button variant="text" color="primary">
                    Register Here
                </Button>
            </Link>
            <form onSubmit={handleSubmit} id='loginForm'>
                <fieldset>
                    <legend>Login</legend>
                    <div className='loginInputFields'>
                        <label htmlFor="email">Email:</label>
                        <input
                            required
                            type="email"
                            placeholder='demo@gmail.com'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}>
                        </input>
                    </div>
                    <div className='loginInputFields'>
                        <label htmlFor="password">Password:</label>
                        <input
                            id='password'
                            type="password"
                            placeholder='*******'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button variant="contained" endIcon={<SendIcon />} type='submit'>
                        Login
                    </Button>
                </fieldset>
            </form>
        </header>
    );
}

export default Login;