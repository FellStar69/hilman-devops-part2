const { describe, it } = require("mocha");
const { expect } = require("chai");
const { app, server } = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
const fs = require("fs");

chai.use(chaiHttp);

let baseUrl;
let newStatus;

describe("Attendance API", () => {
  before(async () => {
    const { address, port } = await server.address();
    baseUrl = `http://${address == "::" ? "localhost" : address}:${port}`;
  });

  after(() => {
    return new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  let attendanceID = 1;

  // PUT /api/edit-attendance/:attendanceID
  describe("PUT /api/edit-attendance/:attendanceID", () => {
    it("should update an existing attendance record with a valid attendanceID and status", (done) => {
      const attendanceID = 1; // A valid attendanceID from db.json (ensure this exists in the database)

      chai
        .request(baseUrl)
        .put(`/api/edit-attendance/${attendanceID}`)
        .send({
          status: newStatus, // The new status
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal(
            "Attendance status modified successfully!"
          );
          expect(res.body.attendanceRecord).to.have.property(
            "attendanceID",
            attendanceID
          );
          expect(res.body.attendanceRecord.status).to.equal(newStatus); // Check if the status was updated
          done();
        });
    });
    it("should return 400 if no status is provided", (done) => {
      const attendanceID = 1; // Valid attendanceID

      chai
        .request(baseUrl)
        .put(`/api/edit-attendance/${attendanceID}`)
        .send({}) // Empty request body (no status)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Status is required"); // Ensure error message
          done();
        });
    });
    it("should return 404 if the attendance record is not found", (done) => {
      const invalidAttendanceID = 9999; // Non-existent attendanceID

      chai
        .request(baseUrl)
        .put(`/api/edit-attendance/${invalidAttendanceID}`)
        .send({
          status: newStatus,
        })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.error).to.equal("Attendance record not found"); // Ensure error message
          done();
        });
    });
    it("should return 500 if there is a file read/write error", (done) => {
      const attendanceID = 1; // Valid attendanceID

      // Mock fs.readFileSync to throw an error
      const originalReadFileSync = fs.readFileSync;
      fs.readFileSync = () => {
        throw new Error("File read error");
      };

      chai
        .request(baseUrl)
        .put(`/api/edit-attendance/${attendanceID}`)
        .send({ status: newStatus })
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body.error).to.equal("Failed to read or write database");

          // Restore the original fs.readFileSync after the test
          fs.readFileSync = originalReadFileSync;
          done();
        });
    });
    it("should return 400 if the attendanceID is not a valid number", (done) => {
      attendanceID = 9999;

      chai
        .request(baseUrl)
        .put(`/api/edit-attendance/${attendanceID}`)
        .send({
          status: newStatus,
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal("Invalid attendanceID"); // Ensure error message
          done();
        });
    });
  });
});
