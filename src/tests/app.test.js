const createApp = require('../createApp');
var request = require('supertest');
const expect = require('chai').expect;

describe('app', () => {
    var app;
    before((done) => {
        const exec = require('child_process').exec;
        exec(`mongoimport --db test --collection english --drop --file ~/english_sample.json --jsonArray;
              mongoimport --db test --collection chinese --drop --file ~/chinese_sample.json --jsonArray;`, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                return;
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

    describe('/someObjectIds', () => {
        it('should return five object ids as json', (done) => {
            request(app)
                .get('/someObjectIds')
                .end((err, res) => {
                    console.log(res.body);
                    expect(res.body).to.have.lengthOf(5);
                    done();
                });
        });
        
    });

    describe('/getPostObjectBasedOnId', () => {
        it('should return a mongo document', (done) => {
            request(app)
                .get('/someObjectIds')
                .end((err, res) => {
                    const objectIds = res.body;
                    request(app)
                        .get('/getPostObjectBasedOnId')
                        .set('accept', 'json')
                        .send({id: objectIds[0]})
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
                .get('/someObjectIds')
                .timeout(10000)
                .end((err0, res0) => {
                    const objectId1 = res0.body[0];
                    const objectId2 = res0.body[1];
                    const dic = {}
                    dic[objectId1] = 'newSemanticValue';
                    dic[objectId2] = 'anotherSemanticValue';
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
                            .send({id: objectId1})
                            .end((err3, res3) => {
                                if(err3) {
                                    return done(err3);
                                }
                                expect(res3.body.semantic_value).to.eq('newSemanticValue');
                                expect(res3.body.labelled_on).to.be.greaterThan(0);
                                request(app)
                                .get('/getPostObjectBasedOnId')
                                .set('accept', 'json')
                                .send({id: objectId2})
                                .end((err4, res4) => {
                                    if(err4) {
                                        return done(err4);
                                    }
                                    expect(res4.body.semantic_value).to.eq('anotherSemanticValue');
                                    done();
                                });
                            });
                        });

                });
        });
    });

    describe('/fetchAdminDataEnglish', () => {
        it('case 1', () => {
            request(app)
            .get('/fetchAdminDataEnglish')
            .end((err, res) => {
                expect(res.body).to.deep.eq([ 
                    { _id: { source: 'blog', semantic_value: 'unassigned' }, total: 80 },
                    { _id: { source: 'blog', semantic_value: 'pending' }, total: 18 },
                    { _id: { source: 'blog', semantic_value: 'anotherSemanticValue' }, total: 1 },
                    { _id: { source: 'blog', semantic_value: 'newSemanticValue' }, total: 1 } 
                ]);
            });
        });
        
    });

    describe('/fetchAdminDataChinese', () => {
        it('case 1', () => {
            request(app)
            .get('/fetchAdminDataChinese')
            .end((err, res) => {
                expect(res.body).to.deep.eq([ 
                    { _id: { source: 'jbtalks', semantic_value: 'unassigned' }, total: 100 } 
                ]);
            });
        });
    });

    describe('/fetchNumberOfPostLabelledToday', () => {
        it('case 1', () => {
            request(app)
            .get('/fetchNumberOfPostLabelledToday')
            .end((err, res) => {
                console.log("yo");
                console.log(res.body);
                console.log("bye");
                expect(false).to.eq(true);
                expect(res.body).to.deep.eq(5);
                console.log("bye");
            });
        });
        
    });
});