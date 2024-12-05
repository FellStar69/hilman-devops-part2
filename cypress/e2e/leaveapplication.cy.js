describe('Leave Application Frontend', () => {
  let baseUrl;

  // Start the server and get the base URL
  before(() => {
    cy.task('startServer').then((url) => {
      baseUrl = url; // Store the base URL
      cy.visit(baseUrl); // Visit the base URL for the frontend
    });
  });

  // Stop the server after the tests are done
  after(() => {
    cy.task('stopServer');
  });

  // Test suite for Leave Application Form
  describe('Leave Application Form', () => {
    before(() => {
      cy.visit(baseUrl);
      cy.intercept('GET', '/leave/api/data', {
        statusCode: 200,
        body: {
          students: [
            { studentID: 1, name: "Alice Johnson" },
            { studentID: 2, name: "Bob Smith" },
            { studentID: 3, name: "Charlie Brown" },
            { studentID: 4, name: "David Lee" },
          ],
          classes: [
            { classID: 101, subject: "Math", date: "7-11-2024", tutor: "Mr Ryan Justin" },
            { classID: 102, subject: "Science", date: "7-11-2024", tutor: "Mr Yutao Qi" },
            { classID: 103, subject: "English", date: "7-11-2024", tutor: "Mr Lim Tan" },
          ],
          enrollment: [
            { enrolledClassID: 101, enrolledStudentID: 1 },
            { enrolledClassID: 102, enrolledStudentID: 2 },
            { enrolledClassID: 103, enrolledStudentID: 3 },
            { enrolledClassID: 101, enrolledStudentID: 4 },
          ],
        },
      }).as('getData'); // Mock API call for data
      cy.wait('@getData');
    });

    it('should populate class dropdown with available classes', () => {
      cy.get('#classID').should('have.length.greaterThan', 1); // Ensure the class dropdown has options
    });

    it('should populate student dropdown based on selected class', () => {
      cy.get('#classID').select('101'); // Choose a class from the dropdown
      cy.get('#studentID').should('have.length.greaterThan', 1); // Ensure the student dropdown is populated based on class
    });

    it('should display student information when a student is selected', () => {
      cy.get('#classID').select('101');
      cy.get('#studentID').select('1'); // Select a student
      cy.get('#studentInfo').should('contain.text', 'Name: Alice Johnson'); // Ensure student info is displayed
    });

    it('should submit leave application successfully', () => {
      cy.get('#classID').select('101');
      cy.get('#studentID').select('1');
      cy.get('#leaveDate').type('2024-12-10');
      cy.get('#reason').type('Medical reasons');
      cy.intercept('POST', '/leave/apply-leave', {
        statusCode: 200,
        body: { message: 'Leave application submitted successfully!' },
      }).as('applyLeave');
      cy.get('#leaveForm').submit();
      cy.wait('@applyLeave');
      cy.get('body').should('contain', 'Leave application submitted successfully!');
    });
  });

  // Test suite for Leave Application Management
  describe('Leave Application Management', () => {
    it('should view all leave applications', () => {
      cy.visit(baseUrl);
      cy.intercept('GET', '/leave/get-leave-applications', {
        statusCode: 200,
        body: [
          {
            applicationID: 1,
            studentID: 1,
            classID: 101,
            leaveDate: "2024-11-10",
            reason: "Medical appointment",
            status: "Pending",
          },
          {
            applicationID: 2,
            studentID: 2,
            classID: 102,
            leaveDate: "2024-11-12",
            reason: "Family event",
            status: "Pending",
          },
          {
            applicationID: 3,
            studentID: 2,
            classID: 101,
            leaveDate: "2024-11-05",
            reason: "sdfsdfsdfsdf",
            status: "Pending",
          },
          {
            applicationID: 4,
            studentID: 1,
            classID: 101,
            leaveDate: "2024-11-11",
            reason: "Medical Issues",
            status: "Approved",
          },
        ],
      }).as('getApplications');

      cy.wait('@getApplications');

      // Ensure all leave applications are displayed
      cy.get('#leaveApplications').within(() => {
        cy.contains('Application ID: 1').should('exist');
        cy.contains('Application ID: 2').should('exist');
        cy.contains('Application ID: 3').should('exist');
        cy.contains('Application ID: 4').should('exist');
      });
    });

    it('should approve a leave application', () => {
      cy.intercept('POST', '/leave/update-application-status', {
        statusCode: 200,
        body: { message: 'Application status updated to Approved!' },
      }).as('approveLeave');
      cy.get('button').contains('Approve').first().click(); // Click the first approve button
      cy.wait('@approveLeave');
      cy.get('body').should('contain', 'Application status updated to Approved!');
    });

    it('should disapprove a leave application', () => {
      cy.intercept('POST', '/leave/update-application-status', {
        statusCode: 200,
        body: { message: 'Application status updated to Disapproved!' },
      }).as('disapproveLeave');
      cy.get('button').contains('Disapprove').first().click(); // Click the first disapprove button
      cy.wait('@disapproveLeave');
      cy.get('body').should('contain', 'Application status updated to Disapproved!');
    });
  });
});
