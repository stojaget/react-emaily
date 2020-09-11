// mora odrediti koje credentialse vratiti
if (process.env.NODE_ENV === "production") {
  module.exports = require("./prod");
} else {
  // uzmi iz dev.js
  module.exports = require("./dev");
}
