const express = require('express');
const router = express.Router();
const connection = require('../dbConnection/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { verifyToken } = require('../middlewares/middleware')


const postJob = async (req, res) => {
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
}
module.exports={
    postJob
};