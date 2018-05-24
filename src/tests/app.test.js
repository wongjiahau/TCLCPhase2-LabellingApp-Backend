const createApp = require('../createApp');
var request = require('supertest');
const expect = require('chai').expect;

describe('app', () => {
  let app;

  before((done) => {
    const useSampleData = true;
    app = createApp(3333, useSampleData);
    done();
  });

  afterEach((done) => {
    const agent = request(app);
    agent.get("/resetUpdates")
    .expect(200, (err, res) => {
      if(!err) {
        done();
      }
    })
  });

  describe('/hello', () => {
    it('should send back hello world', (done) => {
      request(app).get('/hello').expect(200, (err, res) => {
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

      request(app).get('/getPostsEnglish').expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.posts).to.have.lengthOf(10);
          firstIdOfFirstBadgeOfPosts = res.body.posts[0]._id;
          request(app).get('/getPostsEnglish').expect(200, (err, res) => {
            expect(res.body.posts).to.have.lengthOf(10);
            secondIdOfFirstBadgeOfPosts = res.body.posts[0]._id;
            expect(firstIdOfFirstBadgeOfPosts).to.not.eq(secondIdOfFirstBadgeOfPosts);
            done();
          });
        });
    });
  });

  describe('/getPostsChinese', () => {
    it('should return different post for each call', (done) => {
      var firstIdOfFirstBadgeOfPosts;
      var secondIdOfFirstBadgeOfPosts;

      request(app).get('/getPostsChinese').expect(200, (err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.posts).to.have.lengthOf(6);
          firstIdOfFirstBadgeOfPosts = res.body.posts[0]._id;
          request(app).get('/getPostsChinese').expect(200, (err, res) => {
            expect(res.body.posts).to.have.lengthOf(8);
            secondIdOfFirstBadgeOfPosts = res.body.posts[0]._id;
            expect(firstIdOfFirstBadgeOfPosts).to.not.eq(secondIdOfFirstBadgeOfPosts);
            done();
          });
        });
    });
  });

  describe('/someObjectIds', () => {
    it('should return five object ids as json', (done) => {
      request(app).get('/someUids').end((err, res) => {
          expect(res.body).to.have.lengthOf(5);
          expect(res.body).to.deep.eq([ 
            '591ec867dd3d3af48e7eaaa7199c532a6bd648d8',
            '31c5aa4f2967b9b85fd149bd06cecc6577ef1891',
            'b653552da28a5a2ebefc3737984a3650001259e8',
            'fed7206f718bf28a90995bd2ab4e60a51685275b',
            'bd74e5d967291dcd9cf55792fb3e7990b2110583' 
          ]);
          done();
        });
    });

  });

  describe('/getPostObjectBasedOnUid', () => {
    it('should return a post object', (done) => {
      request(app).get('/someUids').end((err, res) => {
          const _ids = res.body;
          request(app).get('/getPostObjectBasedOnUid').set('accept', 'json').send({id: _ids[0]}).end((error, response) => {
            if (error) {
              return done(error);
            }
            expect(response.body).to.deep.eq({ 
              date: '20170723',
              value: 'mahathir\'s cronies vs najib\'s cronies',
              origin: 'scrape-results/blog/rockybru_20170801_160034.csv',
              source: 'blog',
              related_to: [ 'najib', 'mahathir' ],
              semantic_value: 'unassigned',
              belongs_to: 'p0',
              _id: '591ec867dd3d3af48e7eaaa7199c532a6bd648d8' 
            });
            done();
          });
        });
    });
  });

  describe('/submitEnglish', () => {
    it('should update MongoDb', (done) => {
      request(app)
        .get('/someUids')
        .timeout(10000)
        .end((err0, res0) => {
          const objectId1 = res0.body[0];
          const objectId2 = res0.body[1];
          const objectId3 = res0.body[2];
          const objectId4 = res0.body[3];
          const objectId5 = res0.body[4];
          const updates = {};
          updates[objectId1] = 'newSemanticValue';
          updates[objectId2] = 'anotherSemanticValue';
          const submitData = {
            updates: updates,
            merges: [
              {
                absorber: objectId3,
                absorbees: [objectId4, objectId5]
              }
            ],
            malayPosts: [objectId1, objectId2]
          };
          request(app)
            .post('/submitEnglish')
            .timeout(10000)
            .send(submitData)
            .set('accept', 'json')
            .end((err2, res2) => {
              if (err2) {
                return done(err2);
              }
              request(app)
                .get('/getPostObjectBasedOnUid')
                .set('accept', 'json')
                .send({id: objectId1})
                .end((err3, res3) => {
                  if (err3) {
                    return done(err3);
                  }
                  expect(res3.body.semantic_value).to.eq('newSemanticValue');
                  expect(res3.body.isMalay).to.eq(true);
                  expect(res3.body.labelled_on).to.be.greaterThan(0);
                  request(app)
                    .get('/getPostObjectBasedOnUid')
                    .set('accept', 'json')
                    .send({id: objectId2})
                    .end((err4, res4) => {
                      if (err4) {
                        return done(err4);
                      }
                      expect(res4.body.semantic_value).to.eq('anotherSemanticValue');
                      expect(res4.body.isMalay).to.eq(true);
                      done();
                    });
                });
            });

        });
    });
  });

  describe.skip('/fetchAdminDataEnglish', () => {
    it('case 1', (done) => {
      const expected = [
        {
          _id: {
            source: 'blog',
            semantic_value: 'unassigned'
          },
          total: 80
        }, {
          _id: {
            source: 'blog',
            semantic_value: 'pending'
          },
          total: 18
        }, {
          _id: {
            source: 'blog',
            semantic_value: 'anotherSemanticValue'
          },
          total: 1
        }, {
          _id: {
            source: 'blog',
            semantic_value: 'newSemanticValue'
          },
          total: 1
        }
      ];
      request(app)
        .get('/fetchAdminDataEnglish')
        .expect(200, expected, done);
    });

  });

  describe.skip('/fetchAdminDataChinese', () => {
    it('case 1', (done) => {
      const expected = [
        {
          _id: {
            source: 'jbtalks',
            semantic_value: 'unassigned'
          },
          total: 100
        }
      ];
      request(app)
        .get('/fetchAdminDataChinese')
        .expect(200, expected, done);
    });
  });

  describe.skip('/fetchNumberOfPostLabelledToday', () => {
    it('case 1', (done) => {
      const expected = '2';
      request(app)
        .get('/fetchNumberOfPostLabelledToday')
        .expect(200, expected, done);
    });

  });
});