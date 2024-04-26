const express = require('express');
const router = express.Router();
const connection = require('../dbConnection/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { verifyToken } = require('../middlewares/middleware')

const applyForJob = async (req, res) => {
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
};
;
module.exports=
{
    applyForJob
};