const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;
const dbPath = path.join(__dirname, "utils/db.json");

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./instrumented"));


// Import leave application routes from leaveapp.js
const leaveAppRoutes = require("./public/leaveapp");
app.use("/leave", leaveAppRoutes);

// Serve search.js from the util directory
app.get("/util/search.js", (req, res) => {
  res.sendFile(path.join(__dirname, "util", "search.js"));
});

// Serve db.json from the data directory
app.get("/data/db.json", (req, res) => {
  res.sendFile(dbPath);
});

// Import and use the create student route
const createStudentRoute = require("./util/createStudent");
app.use("/", createStudentRoute);

// Default route to serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/instrumented/", "leave.html"));
});

// Endpoint to get attendance for a specific lesson
app.get("/api/attendance/:lessonID", (req, res) => {
  const lessonID = parseInt(req.params.lessonID, 10);
  const date = req.query.date;
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

  // Filter attendance records by lessonID
  const attendanceRecords = db.attendance.filter(
    (record) => record.lessonID === lessonID && record.date === date
  );

  // Map attendance records to include student names
  const attendanceWithNames = attendanceRecords.map((record) => {
    const student = db.students.find((s) => s.studentID === record.studentID);
    return {
      ...record,
      name: student ? student.name : "Unknown", // Add the student's name or "Unknown" if not found
    };
  });

  res.json(attendanceWithNames);
});

// Endpoint to update attendance status
app.put("/api/attendance/:attendanceID", (req, res) => {
  const attendanceID = parseInt(req.params.attendanceID, 10);
  const newStatus = req.body.status;

  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  const attendanceRecord = db.attendance.find(
    (record) => record.attendanceID === attendanceID
  );

  if (attendanceRecord) {
    attendanceRecord.status = newStatus;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
    res.json(attendanceRecord);
  } else {
    res.status(404).json({ error: "Attendance record not found" });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(
    `Student Management System is running at http://localhost:${PORT}`
  );
});

module.exports = { app, server };
