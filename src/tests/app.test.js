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
        it('should return different post for each call', (done) => {
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

    describe('/anObjectIdOfAPost', () => {
        it('should return an object id as plain text', (done) => {
            request(app)
                .get('/anObjectIdOfAPost')
                .end((err, res) => {
                    // Every Mongo document have a 24 chars _id
                    expect(res.text).to.have.lengthOf(24);
                    done();
                });
        });
        
    });

    describe('/getPostObjectBasedOnId', () => {
        it('should return a mongo document', (done) => {
            request(app)
                .get('/anObjectIdOfAPost')
                .end((err, res) => {
                    const objectId = res.text;
                    request(app)
                        .get('/getPostObjectBasedOnId')
                        .set('accept', 'json')
                        .send({id: objectId})
                        .end((error, response) => {
                            if(error) {
                                return done(error);
                            }
                            expect(response.body._id).to.have.lengthOf(24);
                            done();
                        });
                });
        });
    });

    describe('/submitEnglish', () => {
        it('should update MongoDb', (done) => {
            request(app)
                .get('/anObjectIdOfAPost')
                .timeout(10000)
                .end((err0, res0) => {
                    const objectId = res0.text;
                    console.log(objectId);
                    const dic = {}
                    dic[objectId] = 'newSemanticValue'
                    request(app)
                        .post('/submitEnglish')
                        .timeout(10000)
                        .send(dic)
                        .set('accept', 'json')
                        .end((err2, res2) => {
                            if(err2) { return done(err2);}
                            request(app)
                            .get('/getPostObjectBasedOnId')
                            .set('accept', 'json')
                            .send({id: objectId})
                            .end((err3, res3) => {
                                expect(res3).to.eq('newSemanticValue');
                                done();
                            });
                        });

                });
        });
    });
});