const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const { app, server } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

let baseUrl;

describe('Leave Application API', () => {
  before(async () => {
    const { address, port } = await server.address();
    baseUrl = `http://${address === '::' ? 'localhost' : address}:${port}`;
    console.log("Base URL for tests:", baseUrl);
  });

  after(() => {
    return new Promise((resolve) => {
      server.close(() => {
        console.log("Server closed after tests");
        resolve();
      });
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

      console.log("Sending POST request to /apply-leave with data:", applicationData);

      chai
        .request(baseUrl)
        .post('/leave/apply-leave')
        .send(applicationData)
        .end((err, res) => {
          console.log("Response received:", res.body);
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Leave application submitted successfully.');
          done();
        });
    });

    it('should return 400 for invalid studentID or classID', (done) => {
      const invalidData = {
        studentID: 9999,
        classID: 101,
        leaveDate: '2024-12-10',
        reason: 'Sick',
      };

      chai
        .request(baseUrl)
        .post('/leave/apply-leave')
        .send(invalidData)
        .end((err, res) => {
          console.log("Response received for invalid data:", res.body);
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Invalid studentID or classID');
          done();
        });
    });
  });

  describe('/POST /update-application-status', () => {
    it('should update the leave application status', (done) => {
      const applicationID = 1;
      const newStatus = 'Approved';

      console.log("Sending POST request to /update-application-status with data:", { applicationID, status: newStatus });

      chai
        .request(baseUrl)
        .post('/leave/update-application-status')
        .send({ applicationID, status: newStatus })
        .end((err, res) => {
          console.log("Response received:", res.body);
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Application approved successfully.');
          done();
        });
    });

    it('should return 404 for non-existent applicationID', (done) => {
      const invalidApplicationID = 9999;
      const newStatus = 'Approved';

      chai
        .request(baseUrl)
        .post('/leave/update-application-status')
        .send({ applicationID: invalidApplicationID, status: newStatus })
        .end((err, res) => {
          console.log("Response received for invalid applicationID:", res.body);
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
          console.log("Response received for all leave applications:", res.body);
          expect(res).to.have.status(200); // Assuming the status code is 200 for success
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });
});
