const { defineConfig } = require("cypress");
const { spawn } = require("child_process");
let server;
let baseUrl;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      on("task", {
        startServer() {
          return new Promise((resolve, reject) => {
            if (server) {
              console.log("Server already running at:", baseUrl);
              resolve(baseUrl);
              return;
            }
            server = spawn("node", ["-r", "nyc", "index-test.js"]);
            server.stdout.on("data", (data) => {
              console.log("Server stdout:", data.toString());
              const match = data.toString().match(/Demo project at:\s*(http:\/\/.+)/);
              if (match && match[1]) {
                baseUrl = match[1].trim();
                console.log("Resolved Base URL:", baseUrl);
                resolve(baseUrl);
              }
            });
            server.stderr.on("data", (data) => {
              console.error("Server stderr:", data.toString());
              reject(new Error(`Server startup error: ${data.toString()}`));
            });
            server.on("close", (code) => {
              console.log(`Server process exited with code: ${code}`);
              if (code !== 0) {
                reject(new Error(`Server exited with code ${code}`));
              }
            });
          });
        },
        stopServer() {
          if (server) {
            server.kill();
            server = null; // Clear server reference after stopping
            console.log("Server stopped.");
          }
          return null;
        },
      });

      return config; // Ensure the config object is returned
    },
  },
});
