// Fetch and populate classID dropdown
async function populateClassDropdown() {
    const response = await fetch('/leave/api/data'); // Fetch data from the backend
    const data = await response.json();

    const classDropdown = document.getElementById('classID');
    classDropdown.innerHTML = '<option value="">Select a Class</option>'; // Reset dropdown

    // Populate class dropdown with available classes
    data.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.classID;
        option.textContent = `${cls.classID} - ${cls.subject}`;
        classDropdown.appendChild(option);
    });

    // Store student and enrollment data globally for use in other functions
    window.studentData = data.students;
    window.enrollmentData = data.enrollment;
}

// Update studentID dropdown based on selected classID
function updateStudentDropdown() {
    const classID = document.getElementById('classID').value;
    const studentDropdown = document.getElementById('studentID');
    studentDropdown.innerHTML = '<option value="">Select a Student</option>'; // Reset dropdown

    // Filter students based on enrollment data
    const enrolledStudents = window.enrollmentData
        .filter(enrollment => enrollment.enrolledClassID == classID)
        .map(enrollment => enrollment.enrolledStudentID);

    // Populate student dropdown with students enrolled in the selected class
    window.studentData
        .filter(student => enrolledStudents.includes(student.studentID))
        .forEach(student => {
            const option = document.createElement('option');
            option.value = student.studentID;
            option.textContent = `${student.studentID} - ${student.name}`;
            studentDropdown.appendChild(option);
        });
}

// Display student information based on selected studentID
function displayStudentInfo() {
    const studentID = document.getElementById('studentID').value;
    const studentInfo = document.getElementById('studentInfo');
    studentInfo.innerHTML = ''; // Reset info

    // Find the student
    const student = window.studentData.find(stu => stu.studentID == studentID);

    // Use short-circuit evaluation to display student information if found
    studentInfo.innerHTML = student ? `
        <p>Name: ${student.name}</p>
        <p>Student ID: ${student.studentID}</p>
    ` : '<p>Student not found</p>';
}

async function submitLeaveApplication() {
    const form = document.getElementById('leaveForm');
    const formData = {
        classID: form.classID.value,
        studentID: form.studentID.value,
        leaveDate: form.leaveDate.value,
        reason: form.reason.value
    };

    const response = await fetch('/leave/apply-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    const result = await response.json();
    alert(result.message);
    fetchLeaveApplications();
}

async function fetchLeaveApplications() {
    const response = await fetch('/leave/get-leave-applications');
    const applications = await response.json();
    const container = document.getElementById('leaveApplications');
    container.innerHTML = '';

    applications.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.innerHTML = `
            <p>Application ID: ${app.applicationID}</p>
            <p>Student ID: ${app.studentID}</p>
            <p>Class ID: ${app.classID}</p>
            <p>Leave Date: ${app.leaveDate}</p>
            <p>Reason: ${app.reason}</p>
            <p>Status: ${app.status}</p>
            <button onclick="updateApplicationStatus(${app.applicationID}, 'Approved')">Approve</button>
            <button onclick="updateApplicationStatus(${app.applicationID}, 'Disapproved')">Disapprove</button>
            <button onclick = "updateApplicationStatus(${app.applicationID}, 'Pending')" > Pending</button>`
        container.appendChild(appDiv);
    });
}

async function updateApplicationStatus(applicationID, status) {
    const response = await fetch('/leave/update-application-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationID, status })
    });
    const result = await response.json();
    alert(result.message);
    fetchLeaveApplications();
}

// Fetch the applications when the page loads
fetchLeaveApplications();
document.addEventListener('DOMContentLoaded', () => {
    populateClassDropdown();
});