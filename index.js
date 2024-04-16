const express = require('express');  //Creating an Express.js Server
const app = express(); //Initializing an Express.js Server
const dotenv = require('dotenv').config(); //Kept port private with dotenv file
const validator = require('validator');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const connection = require('./dbConnection/dbConnection'); //Connecting to MySQL
const port = process.env.PORT || 5000; //Defined a port for the server

app.use(express.json()); //JSON Middleware
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`); //Listening with a port
})

app.get('/', (req, res) => {
    res.send("API working");
})


//API for the admin to login and see the details of students and company.
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;

    // Query the database to retrieve admin record by email
    connection.query('SELECT * FROM admin WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            // Check if an admin record with the provided email exists
            if (results.length === 0) {
                res.status(401).json({ error: 'Invalid email or password' });
            } else {
                const admin = results[0];
                // Compare the provided password with the stored password
                if (password === admin.password) {
                    // Passwords match, send success response
                    res.status(200).json({ message: 'Login successful' });
                } else {
                    // Passwords don't match, send error response
                    res.status(401).json({ error: 'Invalid email or password' });
                }
            }
        }
    });
});

//API for a company to register a account

app.post('/companies/registration', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !name || !password) {
        return res.status(401).json({ message: 'Please provide a valid email and password' });
    }

    if (!validator.isEmail(email)) {
        return res.status(401).json({ message: 'The email format is incorrect' });
    }
    connection.query("SELECT * FROM company WHERE email=?", [email], async (error, results) => {
        if (error) {
            console.error('Error checking email existence:', error);
            return res.status(500).json({ error: "Failed to create an account" });
        }

        if (results.length > 0) {
            console.error("Email already exists");
            return res.status(401).json({ error: "Email already in use" });
        }

        try {
            // Hashing the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert data into the database
            connection.query("INSERT INTO company (name, email, password) VALUES (? , ? , ?)", [name, email, hashedPassword], (error, results) => {
                if (error) {
                    console.error('Error making the account for company:', error);
                    return res.status(500).json({ error: "Error making the account for company" });
                }
                res.status(200).json({ message: "Created an account for company" });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
});
//API to login the company account

app.post('/companies/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(401).json({ message: "Invalid email or password." });
        console.error("Invalid email or password")
    }
    connection.query("SELECT * FROM company WHERE email =?", [email], async (error, results) => {
        if (error) {
            res.status(500).json({ message: "Error fetching data from database" });
        }
        else {
            if (results.length === 0) {
                res.status(404).json({ message: "There is no company with that email address" });
            }
            const company = results[0];
            try {
                const matchPassword = await bcrypt.compare(password, company.password);

                if (matchPassword) {
                    res.status(200).json({ message: "Login successful" });
                }
                else {
                    res.status(401).json({ message: "Invalid password! Login Failed" });
                }
            } catch (error) {
                console.error(error);
            }
        }
    })

})
//API for the company to post a job