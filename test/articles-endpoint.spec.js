const knex = require('knex');
const app = require('../src/app.js');
const testBookmarks = require('./bookmarks.fixtures.js');

describe.only('Bookmarks Endpoint', () => {
  let db;
  const headers = {
    Authorization: 'Bearer abcd12345'
  }

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => (
    db.destroy()
  ));

  before('clean the table', () => (
    db('bookmarks').truncate()
  ));

  afterEach('Remove test bookmarks from database', () => (
    db('bookmarks').truncate()
  ));

  describe('GET /bookmarks', () => {
    
    context('Given bookmarks table has data', () => {
      
      beforeEach('Insert test bookmarks into the db', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      });

      it('responds with 200 and list of all bookmarks in db', () => {
        return supertest(app)
          .get('/bookmarks')
          .set(headers)    
          .expect(200,testBookmarks)
      });
    });
  });
  
});
