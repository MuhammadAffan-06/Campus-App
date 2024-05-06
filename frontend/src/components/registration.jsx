import "../styles/registration.css";
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";



import React, { useState } from 'react'; // Import useState hook

const Registration = () => {
    const [selectedProfession, setSelectedProfession] = useState('student');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const handleProfessionChange = (event) => {
        setSelectedProfession(event.target.value);
        setShowCategoryDropdown(event.target.value === 'student');
        setSelectedCategory('');
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Submit form data (replace with your actual form submission logic)
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
                    <input type="text" placeholder="demo"
                        id="name"
                        required />
                </div>
                <div className="registrationInputFields">
                    <label htmlFor="email">Email:</label>
                    <input required type="text" placeholder="demo@gmail.com" id="email" />
                </div>
                <div className="registrationInputFields">
                    <label htmlFor="password">Password:</label>
                    <input type="password" placeholder="*******" id="password"
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
