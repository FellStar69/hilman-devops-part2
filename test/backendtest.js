const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const { app, server } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

let baseUrl;

describe('Leave Application API', () => {
  // Set up server before tests start and tear it down after tests complete
  before(async () => {
    const { address, port } = await server.address();
    baseUrl = `http://${address == '::' ? 'localhost' : address}:${port}`;
  });

  after(() => {
    return new Promise((resolve) => {
      server.close(() => resolve());
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

      chai
        .request(baseUrl)
        .post('/leave/apply-leave')
        .send(applicationData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Leave application submitted successfully.');
          done();
        });
    });

    it('should return 400 for invalid studentID or classID', (done) => {
      const invalidData = {
        studentID: 9999, // Invalid studentID
        classID: 101,
        leaveDate: '2024-12-10',
        reason: 'Sick',
      };

      chai
        .request(baseUrl)
        .post('/leave/apply-leave')
        .send(invalidData)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Invalid studentID or classID');
          done();
        });
    });
  });

  describe('/POST /update-application-status', () => {
    it('should update the leave application status', (done) => {
      const applicationID = 1; // Valid applicationID
      const newStatus = 'Approved';

      chai
        .request(baseUrl)
        .post('/leave/update-application-status')
        .send({ applicationID, status: newStatus })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Application approved successfully.');
          done();
        });
    });

    it('should return 404 for non-existent applicationID', (done) => {
      const invalidApplicationID = 9999; // Non-existent application ID
      const newStatus = 'Approved';

      chai
        .request(baseUrl)
        .post('/leave/update-application-status')
        .send({ applicationID: invalidApplicationID, status: newStatus })
        .end((err, res) => {
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
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0); // Assuming there are leave applications
          done();
        });
    });
  });
});
