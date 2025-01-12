const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const { app, server } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

let baseUrl;

describe('Leave Application API', () => {
<<<<<<< HEAD
  // Set up server before tests start and tear it down after tests complete
  before(async () => {
    const { address, port } = await server.address();
    baseUrl = `http://${address == '::' ? 'localhost' : address}:${port}`;
=======
  before(async () => {
    const { address, port } = await server.address();
    baseUrl = `http://${address === '::' ? 'localhost' : address}:${port}`;
    console.log("Base URL for tests:", baseUrl);
>>>>>>> test-frontend
  });

  after(() => {
    return new Promise((resolve) => {
<<<<<<< HEAD
      server.close(() => resolve());
=======
      server.close(() => {
        console.log("Server closed after tests");
        resolve();
      });
>>>>>>> test-frontend
    });
  });

  describe('/POST /apply-leave', () => {
    it('should submit a leave application with valid data', (done) => {
      const applicationData = {
        studentID: 1,
        classID: 101,
        leaveDate: '2024-12-10',
        reason: 'Sick',
      };

<<<<<<< HEAD
=======
      console.log("Sending POST request to /apply-leave with data:", applicationData);

>>>>>>> test-frontend
      chai
        .request(baseUrl)
        .post('/leave/apply-leave')
        .send(applicationData)
        .end((err, res) => {
<<<<<<< HEAD
=======
          console.log("Response received:", res.body);
>>>>>>> test-frontend
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Leave application submitted successfully.');
          done();
        });
    });

    it('should return 400 for invalid studentID or classID', (done) => {
      const invalidData = {
<<<<<<< HEAD
        studentID: 9999, // Invalid studentID
=======
        studentID: 9999,
>>>>>>> test-frontend
        classID: 101,
        leaveDate: '2024-12-10',
        reason: 'Sick',
      };

      chai
        .request(baseUrl)
        .post('/leave/apply-leave')
        .send(invalidData)
        .end((err, res) => {
<<<<<<< HEAD
=======
          console.log("Response received for invalid data:", res.body);
>>>>>>> test-frontend
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Invalid studentID or classID');
          done();
        });
    });
  });

  describe('/POST /update-application-status', () => {
    it('should update the leave application status', (done) => {
<<<<<<< HEAD
      const applicationID = 1; // Valid applicationID
      const newStatus = 'Approved';

=======
      const applicationID = 1;
      const newStatus = 'Approved';

      console.log("Sending POST request to /update-application-status with data:", { applicationID, status: newStatus });

>>>>>>> test-frontend
      chai
        .request(baseUrl)
        .post('/leave/update-application-status')
        .send({ applicationID, status: newStatus })
        .end((err, res) => {
<<<<<<< HEAD
=======
          console.log("Response received:", res.body);
>>>>>>> test-frontend
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Application approved successfully.');
          done();
        });
    });

    it('should return 404 for non-existent applicationID', (done) => {
<<<<<<< HEAD
      const invalidApplicationID = 9999; // Non-existent application ID
=======
      const invalidApplicationID = 9999;
>>>>>>> test-frontend
      const newStatus = 'Approved';

      chai
        .request(baseUrl)
        .post('/leave/update-application-status')
        .send({ applicationID: invalidApplicationID, status: newStatus })
        .end((err, res) => {
<<<<<<< HEAD
=======
          console.log("Response received for invalid applicationID:", res.body);
>>>>>>> test-frontend
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('Application not found.');
          done();
        });
    });
  });

  describe('/GET /get-leave-applications', () => {
    it('should fetch all leave applications', (done) => {
      chai
        .request(baseUrl)
        .get('/leave/get-leave-applications')
        .end((err, res) => {
<<<<<<< HEAD
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0); // Assuming there are leave applications
=======
          console.log("Response received for all leave applications:", res.body);
          expect(res).to.have.status(200); // Assuming the status code is 200 for success
          expect(res.body).to.be.an('array');
>>>>>>> test-frontend
          done();
        });
    });
  });
});
