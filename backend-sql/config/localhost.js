const os = require('os');

module.exports = {

  env: 'localhost',

  // database: {
  //   username: 'postgres',
  //   dialect: 'postgres',
  //   password: 'postgres',
  //   database: 'library-dev-db',
  //   host: 'localhost',
  //   logging: console.log,
  //   operatorsAliases: false,
  // },

  // database: {
  //   username: 'root',
  //   dialect: 'mysql',
  //   password: 'root',
  //   database: 'library-dev-db',
  //   host: 'localhost',
  //   logging: console.log,
  //   operatorsAliases: false,
  //   dialectOptions: {
  //     supportBigNumbers: true,
  //     bigNumberStrings: false
  //   }
  // },
  database: {
    username: 'root',
    dialect: 'mysql',
    password: 'root',
    database: 'library-dev-db',
    host: 'localhost',
    logging: console.log,
    // operatorsAliases: false,
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: false
    }
  },

  email: {
    comment: 'See https://nodemailer.com',
    from: '<insert your email here>',
    host: null,
    auth: {
      user: null,
      pass: null,
    },
  },

  graphiql: true,

  clientUrl: 'http://localhost8080',

  defaultUser: '<insert your email here>',

  uploadDir: os.tmpdir(),

  authJwtSecret: 'a40a8850-24b2-4023-85ce-1765d10c849b-758df0c2-b112-4851-960d-1b7163d3ccd6',

  AUTH_JWT_EXPIRES_IN: "7 days"
};