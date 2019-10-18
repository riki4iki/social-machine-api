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
    username: "eigokohstwhawk",
    password:
      "be22e2957c0c472aec0deba95a5fad43194063f5ac59b090c238804554229b23",
    database: "dcesa9argvpk4d",
    host: "ec2-107-20-198-176.compute-1.amazonaws.com",
    dialect: "postgres",
    operatorsAliases: false
  }
};
