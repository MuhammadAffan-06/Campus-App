const express = require('express');
const router = express.Router();
const connection = require('../dbConnection/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { verifyToken } = require('../middlewares/middleware')

// Function to create a new admin
const createAdmin = async (req, res) => {
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

        connection.query("INSERT INTO admin (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error creating admin" });
            }

            return res.status(200).json({ message: "Admin created successfully" });
        });
    });
};

// Function to approve admin and block/unblock
const approveAdmin = async (req, res) => {
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
};

// Function to get data about companies
const getCompaniesData = async (req, res) => {
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
};

// Function to get data about students
const getStudentsData = async (req, res) => {
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
};

// Function to fetch job posted data
const getJobsPostedData = async (req, res) => {
    connection.query("SELECT * FROM  company_job_post", (error, results) => {
        if (error) {
            res.status(401).json("Error fetching data");
        }
        return res.status(200).json(results);
    })
};

module.exports =
{
    createAdmin,
    approveAdmin,
    getCompaniesData,
    getStudentsData,
    getJobsPostedData
};