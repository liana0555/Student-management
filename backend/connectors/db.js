const mongoose = require("mongoose");
class dbConnector {
  async Connector(dbUrl) {
    try {
      mongoose.connect(dbUrl);
      console.log("db connected successfully");
    } catch (error) {
      throw new Error("db connected failed");
    }
  }
}

module.exports = dbConnector;
