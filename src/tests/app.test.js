const createApp = require('../createApp');
var request = require('supertest');
const {expect} = require('chai');
describe('app', () => {
    var app;
    before((done) => {
        const {exec} = require('child_process');
        exec('mongoimport --db tclc --collection test --drop --file ~/english.json --jsonArray', (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return
            }
            console.log(stdout);
            console.log(stderr);
        })
        app = createApp('test');
        done();
    });

    it('should send back hello world on /hello',  (done) => {
        request(app)
            .get('/hello')
            .expect(200, (err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body).to.deep.eq({message: "Hello World!"});
                done();
            });
    });

});