const express = require('express');
const router = express.Router();
const connection = require('../dbConnection/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { verifyToken } = require('../middlewares/middleware')


// Function for admin, company, and student login
const login = async (req, res) => {
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
            const token = jwt.sign({ email: user.email, category: user.category }, process.env.JWT_SECRET_KEY, { expiresIn: expiresInOneDay });
            const data = {
                name: user.name,
                email: user.email,
                category: user.category,
                token: token,
            };
            res.status(200).json(data);
        });
    });
};

// Function for registering companies and students
const registration = async (req, res) => {
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
                insertQuery = "INSERT INTO student (name, email, password,category,approved, block) VALUES (?,?,?,?,?,?)";
                insertValues = [name, email, hashedPassword, category, false, true];
            } else if (type === 'company') {
                insertQuery = "INSERT INTO company (name, email, password, approved, block) VALUES (?,?,?,?,?)";
                insertValues = [name, email, hashedPassword, false, false];
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
};


module.exports = {
    login,
    registration
};
