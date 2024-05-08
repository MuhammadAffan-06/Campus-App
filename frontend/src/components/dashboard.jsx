import React, { useState, useEffect } from 'react';
import Registration from './registration';
import Admin from './admin';
import Company from './company';
import Student from './student';
const Dashboard = () => {
    const [category, setCategory] = useState('');

    useEffect(() => {
        const storedCategory = sessionStorage.getItem('category');
        if (storedCategory) {
            setCategory(storedCategory);
        } else {
            // Handle case where no category is found (e.g., redirect to login)
        }
    }, []); // Empty dependency array to run only once on component mount

    if (!category) {
        return <p>Loading...</p>; // Or redirect to login
    }

    // Render content based on category
    if (category === 'junior') {
        return (
            <div>
                <h1>Student Dashboard</h1>
                {/* Student specific content */}
                <Student />

            </div>
        );
    } else if (category === 'company') {
        return (
            <div>
                <h1>Company Dashboard</h1>
                {/* Company specific content */}
                <Company />
            </div>
        );
    } else if (category === 'admin') {
        return (
            <div>
                <Admin />
            </div>
        );
    } else {
        return <p>Invalid category</p>; // Handle unexpected category
    }
};

export default Dashboard;