const createApp = require("./createApp");

const useSampleData = false; // Remember to change this to false during deployment
const port = 80; // Remember to change this to port 80 during deployment
console.log(new Date().toISOString());
createApp(port, useSampleData);
