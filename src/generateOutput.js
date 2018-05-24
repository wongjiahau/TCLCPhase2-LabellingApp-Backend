const Database = require('./database').Database;
const database = new Database();
database.generateOutput("english");
database.generateOutput("chinese");