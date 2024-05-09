import "../styles/registration.css";
import Button from '@mui/material/Button';
import { Link, Navigate } from "react-router-dom";



import React, { useState } from 'react'; // Import useState hook

const Registration = () => {
    const [selectedProfession, setSelectedProfession] = useState('student');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleProfessionChange = (event) => {
        setSelectedProfession(event.target.value);
        setShowCategoryDropdown(event.target.value === 'student');
        setSelectedCategory('');
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !selectedProfession) {
            console.log("Please fill out the form correctly");
        }
        const body = {
            name,
            email,
            password,
            type: selectedProfession,
        };

        // Include category only if student is selected and a category is chosen
        if (selectedProfession === 'student' && selectedCategory) {
            body.category = selectedCategory;
        }

        try {
            const response = await fetch('http://localhost:5001/auth/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            // Handle response (e.g., navigate to success page)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="registrationHeader">
            <h1>Registration</h1>
            <h2>Already have an account?</h2>
            <Link to={"/"}>
                <Button variant="contained" className="loginButton">Login Here</Button>
            </Link>
            <form id="registrationForm" onSubmit={handleSubmit}>
                <div className="registrationInputFields">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        placeholder="demo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        id="name"
                        required />
                </div>
                <div className="registrationInputFields">
                    <label htmlFor="email">Email:</label>
                    <input
                        required
                        type="text"
                        placeholder="demo@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email" />
                </div>
                <div className="registrationInputFields">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        placeholder="*******"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                </div>
                <div>
                    <p>What's your profession?</p>
                    <div>
                        <input
                            type="radio"
                            value="student"
                            name="profession"
                            id="student"
                            checked={selectedProfession === 'student'}
                            onChange={handleProfessionChange}
                            required
                        />
                        <label htmlFor="student">Student</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            value="company"
                            name="profession"
                            id="company"
                            checked={selectedProfession === 'company'}
                            onChange={handleProfessionChange}
                            required
                        />
                        <label htmlFor="company">Company</label>
                    </div>
                    {selectedProfession === 'student' && showCategoryDropdown && (
                        <select value={selectedCategory} onChange={handleCategoryChange}
                            required className="categoryDropdown">
                            <option value="">Select Category</option>
                            <option value="fresher">Fresher</option>
                            <option value="junior">Junior</option>
                            <option value="senior">Senior</option>
                        </select>
                    )}
                </div>
                <Button variant="text" type="submit">Signup</Button>
            </form>
        </div>
    );
};

export default Registration;
