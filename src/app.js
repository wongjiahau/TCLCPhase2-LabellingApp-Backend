const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/login', (req, res) => {
    const userId = req.body.userId;
    const pass = req.body.pass;
    res.setHeader('Content-Type', 'application/json');
    const userIdIsCorrect = userId === 'some hashed userId';
    const passwordIsCorrect = pass === 'some hashed password';
    res.send(JSON.stringify({isAuthenticated: userIdIsCorrect && passwordIsCorrect}));
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));