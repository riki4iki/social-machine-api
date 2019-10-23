require("dotenv").config();

module.exports = {
  development: {
    username: process.env.pg_username,
    password: process.env.pg_password,
    database: process.env.pg_database_dev,
    host: "127.0.0.1",
    dialect: "postgres",
    logging: null
  },
  test: {
    username: process.env.pg_username,
    password: process.env.pg_password,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  },
  production: {
    username: "qodjdgsaqugecw",
    password:
      "d8e93c4a8dcbe50b5627d9b0601a0b064056c24d005539093441a3f87043cae8",
    database: "d1l6kaj75iv1l4",
    host: "ec2-54-204-39-43.compute-1.amazonaws.com",
    dialect: "postgres",
    operatorsAliases: false
  }
};
