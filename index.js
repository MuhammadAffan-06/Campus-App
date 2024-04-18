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
    res.send("Testing the environment");
})
//API for the create a new admin
app.post('/createadmin', async(req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(401).json({ message: "Credentials required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    connection.query("INSERT INTO admin (name,email,password) VALUES (? , ?, ?)", [name, email, hashedPassword], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json("Error creating admin");
        }
        if (results.email === email) {
            return res.status(401).json({ message: "Email already exists" });
        }
        return res.status(200).json({ message: "Admin created successfully" });
    })
})


//API for the admin,company and student to login.
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json("Credentials required");
    } 45
    if (!validator.isEmail(email)) {
        return res.status(401).json("Email format is not valid");
    }
    // Query the databases to check for the email and password
    connection.query("SELECT * FROM admin WHERE email=? UNION ALL SELECT * FROM company WHERE email=?", [email, email], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ message: "Error Fetching data from databases" });
        }
        else {
            const user = results[0];
            const validPassword = bcrypt.compare(user.password, password);
            if (!validPassword) {
                return res.status(401).json({ message: "Invalid password" });
            }
            return res.status(200).json({ message: `${user.name} logged in successfully` });
        }
    })


});

// //API for admin to get the records of company registered
// app.get('/admin/companyregistration', async (req, res) => {
//     connection.query("SELECT DISTINCT name,email FROM company", (error, results) => {
//         try {
//             if (results.length === 0) {
//                 return res.status(404).json({ message: "There is no data in the database" });
//             }
//             res.status(200).json(results);
//         }
//         catch {

//             res.status(401).json({ message: "Error fetching the data", error })
//         }

//     })
// })
// //API to block a user based on his email


// //API for a company to register a account which waits for the admin approval first

// app.post('/company/registration', async (req, res) => {
//     const { name, email, password } = req.body;

//     if (!email || !name || !password) {
//         return res.status(401).json({ message: 'Please provide a valid email and password' });
//     }

//     if (!validator.isEmail(email)) {
//         return res.status(401).json({ message: 'The email format is incorrect' });
//     }
//     connection.query("SELECT * FROM company WHERE email=?", (email), (error, results) => {
//         try {
//             if (results.length > 0) {
//                 return res.status(401).json({ message: "Email already registered" });
//             }

//         } catch (error) {
//             console.log(error);
//         }
//     })
//     connection.query("SELECT * FROM temporary_company WHERE email=?", [email], async (error, results) => {
//         if (error) {
//             console.error('Error checking email existence:', error);
//             return res.status(500).json({ error: "Failed to create an account" });
//         }


//         try {
//             // Hashing the password
//             const hashedPassword = await bcrypt.hash(password, 10);
//             if (results.length > 0) {
//                 console.error("Email already exists");
//                 return res.status(401).json({ error: "Email already in use" });
//             }
//             // Insert data into the database
//             connection.query("INSERT INTO temporary_company (name, email, password) VALUES (? , ? , ?)", [name, email, hashedPassword], (error, results) => {
//                 if (error) {
//                     console.error('Error making the account for company:', error);
//                     return res.status(500).json({ error: "Error making the account for company" });
//                 }
//                 return res.status(200).json({ message: "Account Created ! Waiting for the admin approval" });
//             });
//         } catch (error) {
//             console.error('Error hashing password:', error);
//             res.status(500).json({ error: "Internal server error" });
//         }
//     });
// });
// //Admin API to approve the company registration
// app.post('/admin/companyregistration/approval', (req, res) => {
//     const { email } = req.body;
//     connection.query("SELECT * FROM temporary_company WHERE email=?", [email], (error, results) => {
//         if (error) {
//             res.status(401).json({ message: "Error fetching the data from company" });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: "There is no company available to approve with this username" })
//         }
//         const companyData = results[0];

//         connection.query("INSERT INTO company (name,email,password) VALUES (?,?,?)", [companyData.name, companyData.email, companyData.password], (error, results) => {
//             try {
//                 if (error) {
//                     return res.status(401).json({ message: "Failed to enter data to main table" });
//                 }
//                 if (companyData.email > 0) {
//                     return res.status(401).json({ message: "Email already exist in main table" });
//                 }
//                 res.status(200).json({ message: "Successfully created a company" });

//             } catch (error) {
//                 res.status(404).json({ message: "Error creating company" });
//             }

//         })
//         console.log(companyData.email);
//         connection.query("DELETE FROM temporary_company WHERE email =?", [companyData.email], (error, results) => {
//             try {
//                 res.status(200);
//             } catch (error) {
//                 res.status(401).json({ message: "Error deleting temporary company" });
//             }
//         })
//     })
// })
// //API to login the company account
// app.post('/company/login', async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         res.status(401).json({ message: "Invalid email or password." });
//         console.error("Invalid email or password")
//     }
//     connection.query("SELECT * FROM company WHERE email =?", [email], async (error, results) => {
//         if (error) {
//             res.status(500).json({ message: "Error fetching data from database" });
//         }
//         else {
//             if (results.length === 0) {
//                 res.status(404).json({ message: "There is no company with that email address" });
//             }
//             const company = results[0];
//             try {
//                 const matchPassword = await bcrypt.compare(password, company.password);

//                 if (matchPassword) {
//                     res.status(200).json({ message: "Login successful" });
//                 }
//                 else {
//                     res.status(401).json({ message: "Invalid password! Login Failed" });
//                 }
//             } catch (error) {
//                 console.error(error);
//             }
//         }
//     })

// })
// //API for the company to post a job
