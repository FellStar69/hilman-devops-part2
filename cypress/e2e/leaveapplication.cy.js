describe('Leave Application Frontend', () => {
  let baseUrl;
  const mockData = {
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
    leaveApplications: [
      {
        studentID: 1,
        name: "Alice Johnson",
        classID: 101,
        leaveDate: "2024-12-10",
        reason: "Medical reasons",
        status: "Pending",
      },
      {
        studentID: 2,
        name: "Bob Smith",
        classID: 102,
        leaveDate: "2024-12-11",
        reason: "Family emergency",
        status: "Approved",
      },
    ],
  };

  before(() => {
    cy.task("startServer").then((url) => {
      baseUrl = url + "/leave.html"; 
      cy.visit(baseUrl);
    });
  });

  after(() => {
    cy.task('stopServer');
  });

  describe('Leave Application Form', () => {
    beforeEach(() => {
      cy.intercept('GET', '/leave/api/data', {
        statusCode: 200,
        body: mockData,
      }).as('getData');
      cy.visit(baseUrl);
      cy.wait('@getData');
    });

    it('should populate class dropdown with available classes', () => {
      cy.get('#classID')
        .should('exist')
        .find('option')
        .should('have.length', mockData.classes.length + 1); // +1 for placeholder
    });

    it('should display student information when a student is selected', () => {
      cy.get('#classID').select('101');
      cy.get('#studentID').select('1'); // Alice Johnson
      cy.get('#studentInfo').should('contain.text', 'Name: Alice Johnson');
    });

    it('should successfully submit a leave application and display an alert', () => {
      // Intercept the POST request to mock a successful server response
      cy.intercept('POST', '/leave/apply-leave', {
        statusCode: 200,
        body: { message: 'Leave application submitted successfully!' },
      }).as('applyLeave');

      // Stub window.alert
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });

      // Fill in the form
      cy.get('#classID').select('101'); // Select class
      cy.get('#studentID').select('1'); // Select student
      cy.get('#leaveDate').type('2024-12-10'); // Enter leave date
      cy.get('#reason').type('Medical reasons'); // Enter reason

      // Submit the form
      cy.get('button[onclick="submitLeaveApplication()"]').click();

      // Wait for the intercepted request
      cy.wait('@applyLeave');

      // Assert that the alert was called with the success message
      cy.get('@alertStub').should('have.been.calledWith', 'Leave application submitted successfully!');
    });
    
  });

  describe('Leave Application Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/leave/get-leave-applications', {
        statusCode: 200,
        body: mockData.leaveApplications,
      }).as('getLeaveApplications');
      cy.visit(baseUrl);
      cy.wait('@getLeaveApplications');
    });

    it('should update the leave application status to Disapproved', () => {
      // Intercept the POST request for updating the status
      cy.intercept('POST', '/leave/update-application-status', (req) => {
        // Verify the request payload
        expect(req.body).to.deep.equal({
          applicationID: 1,
          status: 'Disapproved',
        });
        req.reply({
          statusCode: 200,
          body: { message: 'Application disapproved successfully.' },
        });
      }).as('updateStatus');

      // Intercept the GET request to fetch leave applications
      cy.intercept('GET', '/leave/get-leave-applications', {
        statusCode: 200,
        body: [
          {
            applicationID: 1,
            studentID: 1,
            classID: 101,
            leaveDate: '2024-12-10',
            reason: 'Medical appointment',
            status: 'Pending', // Initial status is 'Pending'
          },
        ],
      }).as('getLeaveApplications');

      // Visit the page and wait for the applications to load
      cy.visit(baseUrl);
      cy.wait('@getLeaveApplications');

      // Find the application with ID 1 and click the "Disapprove" button
      cy.contains('Application ID: 1') // Locate the application
        .parent() // Get the parent container
        .contains('Disapprove') // Find the Disapprove button
        .click();

      // Wait for the POST request to be made
      cy.wait('@updateStatus').then((interception) => {
        // Verify the server's response
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.message).to.equal(
          'Application disapproved successfully.'
        );
      });

      // Verify the success alert message
      cy.on('window:alert', (str) => {
        expect(str).to.equal('Application disapproved successfully.');
      });
    });
  });
  describe('Update Application Status', () => {
  beforeEach(() => {
    // Intercept the GET request for fetching leave applications
    cy.intercept('GET', '/leave/get-leave-applications', {
      statusCode: 200,
      body: [
        {
          applicationID: 1,
          studentID: 1,
          classID: 101,
          leaveDate: '2024-11-10',
          reason: 'Medical reasons',
          status: 'Pending',
        },
      ],
    }).as('getLeaveApplications');

    // Visit the page before each test
    cy.visit('http://localhost:5050/leave.html');
    cy.wait('@getLeaveApplications');
  });

  it('should update the application status to Approved', () => {
    // Intercept the POST request for updating the status
    cy.intercept('POST', '/leave/update-application-status', (req) => {
      // Assert that the correct payload is sent
      expect(req.body).to.deep.equal({
        applicationID: 1,
        status: 'Approved',
      });

      req.reply({
        statusCode: 200,
        body: { message: 'Application approved successfully.' },
      });
    }).as('updateStatus');

    // Find the application and click the Approve button
    cy.contains('Application ID: 1')
      .parent()
      .contains('Approve')
      .click();

    // Wait for the POST request to be made
    cy.wait('@updateStatus');

    // Assert that the success alert is displayed
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Application approved successfully.');
    });
  });

  it('should update the application status to Disapproved', () => {
    // Intercept the POST request for updating the status
    cy.intercept('POST', '/leave/update-application-status', (req) => {
      // Assert that the correct payload is sent
      expect(req.body).to.deep.equal({
        applicationID: 1,
        status: 'Disapproved',
      });

      req.reply({
        statusCode: 200,
        body: { message: 'Application disapproved successfully.' },
      });
    }).as('updateStatus');

    // Find the application and click the Disapprove button
    cy.contains('Application ID: 1')
      .parent()
      .contains('Disapprove')
      .click();

    // Wait for the POST request to be made
    cy.wait('@updateStatus');

    // Assert that the success alert is displayed
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Application disapproved successfully.');
    });
  });
  });
});
