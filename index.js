const express = require('express');  //Creating an Express.js Server
const app = express(); //Initializing an Express.js Server
const dotenv = require('dotenv').config(); //Kept port private with dotenv file
const validator = require('validator'); //To check email format
const mysql = require('mysql'); //Connecting to mysql server
const bcrypt = require('bcrypt'); //To hash password
const jwt = require('jsonwebtoken');
const connection = require('./dbConnection/dbConnection'); //Connecting to MySQL
const port = process.env.PORT || 5000; //Defined a port for the server

app.use(express.json()); //JSON Middleware
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`); //Listening with a port
})

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];

        // Implement JWT verification logic here (replace with your library)
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
            if (error) {
                console.error(error);
                return res.status(403).json({ message: "Invalid or expired token" });
            }

            // Attach decoded user information to the request object
            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ message: "Authorization token missing" });
    }
}




app.get('/', (req, res) => {
    res.send("Testing the environment");
})
//API for the create a new admin
app.post('/createadmin', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(401).json({ message: "Credentials required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    connection.query("SELECT * FROM admin", (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Error querying database" });
        }

        if (results.length > 0) {
            const admin = results[0];
            if (admin.email == email) {
                return res.status(403).json({ message: "Email already in use" });
            }
        }

        connection.query("INSERT INTO admin (name, email, password, category) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, false], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error creating admin" });
            }

            return res.status(200).json({ message: "Admin created successfully" });
        });
    });
});

//API for the admin approval and block/unblock
app.put('/admin/approve', verifyToken, async (req, res) => {
    const { email, approved, block, userType } = req.body;

    if (!email || !userType || (userType !== 'company' && userType !== 'student')) {
        return res.status(400).json({ message: "Invalid user type or missing email" });
    }

    try {
        let updatedTable;
        if (userType === 'company') {
            updatedTable = 'company';
        } else {
            updatedTable = 'student';
        }

        const updateQuery = `UPDATE ${updatedTable} SET block=?, approved=? WHERE email=?`;
        await connection.query(updateQuery, [block, approved, email]);

        let statusMessage = `${email}`;
        if (approved) {
            statusMessage += ' approved';
        }
        if (block) {
            statusMessage += ' and blocked';
        } else {
            statusMessage += ' unblocked';
        }

        return res.status(200).json({ message: statusMessage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating user status" });
    }
});
//API for admin to get the data about companies
app.get('/admin/companies', verifyToken, (req, res) => {
    connection.query("SELECT name,email,approved,block FROM company", (error, results) => {
        if (error) {
            return res.status(401).json("Error fetching the data from database");
        }
        if (results.length === 0) {
            return res.status(404).json("No Data Found in the Database");
        }
        else {

            return res.status(200).json(results);
        }
    })
})

//API for admin to get the data about students
app.get('/admin/students', verifyToken, (req, res) => {
    connection.query("SELECT name,email,approved,block,category FROM student", (error, results) => {
        if (error) {
            console.error(error);
            return res.status(401).json({ message: "Error fetching the data" })
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No results found from database" });
        }
        else {
            return res.status(200).json(results);
        }
    })
})
//API for the admin to fetch job posted data
app.get('/admin/jobsposted', verifyToken, (req, res) => {

    connection.query("SELECT * FROM  company_job_post", (error, results) => {
        if (error) {
            res.status(401).json("Error fetching data");
        }
        return res.status(200).json(results);
    })
})

//API for the admin,company and student to login.

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(401).json({ message: "Email and password are required" });
    }
    connection.query("SELECT * FROM admin WHERE email=? UNION ALL SELECT * FROM company WHERE email=? UNION ALL SELECT * FROM student WHERE email=?", [email, email, email], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Error Fetching data from databases" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const user = results[0];
        if (user.approved == false) {
            return res.status(403).json({ message: "This id is not approved yet" });
        }
        bcrypt.compare(password, user.password, (error, validPassword) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error comparing passwords" });
            }

            if (!validPassword) {
                return res.status(401).json({ message: "Invalid password" });
            }
            const expiresInOneDay = 60 * 60 * 24;
            const token = jwt.sign({ email: user.email, category: user.category }, process.env.JWT_SECRET_KEY, { expiresIn: expiresInOneDay});
            const data = {
                name: user.name,
                email: user.email,
                category: user.category,
                token: token,
            };
            res.status(200).json(data);
        });
    });

});
//API for registering companies and students both
app.post('/registration', async (req, res) => {
    const { name, email, password, type, category } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Credentials Required" });
    }
    if (!validator.isEmail(email)) {
        return res.status(401).json({ message: "Email format is not valid" });
    }

    try {
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);

        const escapedEmail = connection.escape(email);

        // Checking for duplicate Email
        let checkEmailQuery;
        if (type === 'student') {
            checkEmailQuery = `SELECT * FROM student WHERE email = ${escapedEmail}`;
        } else if (type === 'company') {
            checkEmailQuery = `SELECT * FROM company WHERE email = ${escapedEmail}`;
        } else {
            return res.status(400).json({ message: "Invalid registration type" });
        }

        await connection.query(checkEmailQuery, async (error, results) => {
            if (error) {
                console.error(error);
                await connection.rollback();
                return res.status(500).json({ message: "Error during registration" });
            }

            if (results.length > 0) {
                await connection.rollback();
                return res.status(400).json({ message: "Email already exists in the database" });
            }

            let insertQuery;
            let insertValues;

            if (type === 'student') {
                if (!category) {
                    return res.status(400).json({ message: "Category not Found" });
                }
                insertQuery = "INSERT INTO student (name, email, password, category, approved, block) VALUES (?,?,?,?,?,?)";
                insertValues = [name, email, hashedPassword, category, false, true];
            } else if (type === 'company') {
                insertQuery = "INSERT INTO company (name, email, password, category, approved, block) VALUES (?,?,?,?,?,?)";
                insertValues = [name, email, hashedPassword, false, false, false];
            } else {
                return res.status(400).json({ message: "Invalid registration type" });
            }

            await connection.query(insertQuery, insertValues);

            await connection.commit();

            return res.status(201).json({ message: "Registration successful. Awaiting admin approval and Initially Unblocked." });
        });
    } catch (error) {
        console.error(error);
        await connection.rollback();
        return res.status(500).json({ message: "Error during registration" });
    }
});

//API for the companies to post a job
app.post('/company/jobpost', verifyToken, (req, res) => {
    const { jobtitle, address, education, experience } = req.body;
    if (!jobtitle || !address || !education || !experience) {
        return res.status(404).json({ message: "Fill out all th fields carefully!" });
    }
    connection.query("SELECT * FROM company WHERE email=?", [req.user.email], (error, results) => {
        if (error) {
            return res.status(401).json({ message: "Error fetching company data" });
        }
        const companyData = results[0];
        console.log(companyData.email);
        if (companyData.block == true) {
            return res.status(402).json({ message: "You are blocked can't post a new job" });
        }
        if (req.user.email !== undefined) {

            connection.query(
                "INSERT INTO company_job_post (email, jobtitle, address, education, experience) VALUES (?, ?, ?, ?, ?)",
                [req.user.email, jobtitle, address, education, experience],
                (error, results) => {
                    if (error) {
                        console.error(error);
                        return res.status(401).json({ message: "Error inserting job post" });
                    }
                    return res.status(200).json({ message: "Job post successfully" });
                }
            );
        } else {
            res.status(400).json({ message: "Invalid user information in token" });
        }
    })

});

//API for the students to apply for the job

app.post('/students/apply', verifyToken, (req, res) => {
    const studentExperience = req.user.category;
    connection.query("SELECT * FROM student WHERE email=? ", [req.user.email], (error, results) => {
        const studentData = results[0];
        console.log(studentData.block);
        if (error) {
            return res.status(401).json({ message: "Error" });
        }
        if (studentData.block == true) {
            return res.status(401).json({ message: "You are Blocked by the admin ! Can not apply for the job" });
        }

        connection.query("SELECT * FROM company_job_post WHERE experience=? ", [studentExperience], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error Fetching data from database" })
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No job post found with the specified experience" });
            }
            const data = results[0];
            if (studentExperience == data.experience) {
                let currentApplications = data.applications || [];
                if (!currentApplications) {
                    // If null or undefined, initialize as an empty array
                    currentApplications = [];
                }
                else if (typeof currentApplications === 'string') {
                    // Parse the applications string into an array
                    try {
                        currentApplications = JSON.parse(currentApplications);
                    } catch (parseError) {
                        console.error(parseError);
                        return res.status(500).json({ message: "Error parsing applications data" });
                    }
                }
                // Append the new application object to the array
                const newApplication = {
                    Name: req.user.name,
                    Email: req.user.email
                };
                currentApplications.push(newApplication);

                // Update the applications column in the database
                connection.query(
                    "UPDATE company_job_post SET applications = ? WHERE experience = ?",
                    [JSON.stringify(currentApplications), data.experience],
                    (updateError, updateResults) => {
                        if (updateError) {
                            console.error(updateError);
                            return res.status(500).json({ message: "Error updating data in the database" });
                        }
                        return res.status(200).json({ message: "Successfully updated data in the database" });
                    }
                );
            }
            else {
                return res.status(401).json({ message: "You can not apply for this job" });
            }
        })

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
