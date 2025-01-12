const express = require('express');
const fs = require('fs');
const path = require('path');

// Create a router to handle leave application routes
const router = express.Router();

// Path to locate db.json in the root project's data folder
const dataPath = path.join(__dirname, '..', 'data', 'db.json');

// Load the data from db.json initially
let data;
try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(jsonData);
    console.log("Loaded data:", data); // Log to confirm loading
} catch (err) {
    console.error("Error reading data file:", err);
    data = { students: [], classes: [], enrollment: [], attendance: [], leaveApplications: [] };
}

// Initialize leaveApplications
let leaveApplications = data.leaveApplications || [];

// Route to serve db.json data
router.get('/api/data', (req, res) => {
    // Use dataPath directly here
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading data file:", err);
            res.status(500).send("Error reading data file");
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Route to apply for leave
router.post('/apply-leave', (req, res) => {
    const { studentID, classID, leaveDate, reason } = req.body;

    // Validate studentID and classID
    const studentExists = data.students.some(student => student.studentID === parseInt(studentID));
    const classExists = data.classes.some(cls => cls.classID === parseInt(classID));

    if (!studentExists || !classExists) {
        return res.status(400).json({ message: "Invalid studentID or classID" });
    }

    const applicationID = leaveApplications.length + 1;
    const newApplication = { applicationID, studentID, classID, leaveDate, reason, status: "Pending" };
    leaveApplications.push(newApplication);

    // Update data and save to file
    data.leaveApplications = leaveApplications;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

    res.json({ message: "Leave application submitted successfully." });
});

// Route to get all leave applications
router.get('/get-leave-applications', (req, res) => {
    res.json(leaveApplications);
});

// Route to update the application status
router.post('/update-application-status', (req, res) => {
    const { applicationID, status } = req.body;
    const application = leaveApplications.find(app => app.applicationID === parseInt(applicationID));

    if (application) {
        application.status = status;

        // Update data and save to file
        data.leaveApplications = leaveApplications;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

        res.json({ message: `Application ${status.toLowerCase()} successfully.` });
    } else {
        res.status(404).json({ message: "Application not found." });
    }
});

module.exports = router;
