const createApp = require('../createApp');
var request = require('supertest');
const expect = require('chai').expect;
describe('app', () => {
    var app;
    before((done) => {
        const exec = require('child_process').exec;
        exec('mongoimport --db tclc --collection test --drop --file ~/english.json --jsonArray', (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return
            }
            console.log(stdout);
            console.log(stderr);
        })
        app = createApp(3333, 'test');
        done();
    });

    it('example on chaining', (done) => {
        const agent = request(app);
        agent.get('/hello')
            .expect(200, (err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body).to.deep.eq({message: "Hello World!"});
            });
        agent.get('/hello')
            .expect(200, (err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body).to.deep.eq({message: "Hello World!"});
                done();
            });
    });

    describe('/hello', () => {
        it('should send back hello world',  (done) => {
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

    describe('/getPostsEnglish', () => {
        it('should return different post for each call', () => {
            var firstIdOfFirstBadgeOfPosts;
            var secondIdOfFirstBadgeOfPosts;
            
            request(app)
                .get('/getPostsEnglish')
                .expect(200, (err, res) => {
                    if (err) { return done(err); }
                    expect(res.body).to.have.lengthOf(10);
                    firstIdOfFirstBadgeOfPosts = res.body[0]._id;
                });
            request(app)
                .get('/getPostsEnglish')
                .expect(200, (err, res) => {
                    expect(res.body).to.have.lengthOf(10);
                    secondIdOfFirstBadgeOfPosts = res.body[0]._id;
                    expect(firstIdOfFirstBadgeOfPosts).to.not.eq(secondIdOfFirstBadgeOfPosts);
                    done();
                });
        });
    });

    describe('/submitEnglish', () => {
        it('should update MongoDb', (done) => {
            request(app)
                .get('/anObjectIdOfAPost')
                .end((err0, res0) => {
                    const objectId = res0;
                    request(app)
                        .post('/submitEnglish')
                        .send({objectId: 'newSemanticValue'})
                        .set('accept', 'json')
                        .end((err2, res2) => {
                            if(err2) { return done(err2);}
                            request(app)
                            .get('/getPostObjectBasedOnId')
                            .send({id: objectId})
                            .end((err3, res3) => {
                                expect(res3).to.eq('newSemanticValue');
                            });
                        });

                });
        });
    });
});