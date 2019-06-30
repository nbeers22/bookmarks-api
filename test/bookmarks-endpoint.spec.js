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

    context('Given bookmarks table has no data', () => {

      it('responds with status 200 and empty array', () => {
        return supertest(app)
          .get('/bookmarks')
          .set(headers)
          .expect(200,[])
      });
    });
  });

  describe('GET /bookmarks/:id', () => {
    
    context('Given article with corresponding id exists in database', () => {

      beforeEach('Insert test bookmarks into the db', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      });

      it('responds with 200 and the article with the given id', () => {
        const articleId = 1;
        return supertest(app)
          .get(`/bookmarks/${articleId}`)
          .set(headers)
          .expect(200,testBookmarks[articleId - 1])
      })
    });
    
    context('Given article with corresponding id does not exist in database', () => {
      
      it('responds with 404 and error message', () => {
        const articleId = 0;
        return supertest(app)
          .get(`/bookmarks/${articleId}`)
          .set(headers)
          .expect(404, { error: "Bookmark not found" } )
      });
    });
  });
  
  describe.only('POST /articles', () => {
    
    it('Adds bookmark to the db, responds with 201 and new bookmark', () => {
      const newBookmark = {
        title: "New Bookmark Test",
        description: "Really cool bookmark",
        url: "http://bookmarktest.com",
        rating: 1
      }

      return supertest(app)
        .post('/bookmarks')
        .set(headers)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body).to.have.property("id")
        })
        .then( postResponse => (
          supertest(app)
            .get(`/bookmarks/${postResponse.body.id}`)
            .set(headers)
            .expect(postResponse.body)
        ))
    });

    it('responds with 400 and error msg if title is not present', () => {
      const newBookmark = {
        description: "Really cool bookmark",
        url: "http://bookmarktest.com",
        rating: 1
      }

      return supertest(app)
        .post('/bookmarks')
        .set(headers)
        .send(newBookmark)
        .expect(400, {error: "POST failed"})
    });
    
    it('responds with 400 and error msg if url is not present', () => {
      const newBookmark = {
        title: "My new bookmark title",
        description: "Really cool bookmark",
        rating: 1
      }

      return supertest(app)
        .post('/bookmarks')
        .set(headers)
        .send(newBookmark)
        .expect(400, {error: "POST failed"})
    });
    
    it('responds with 400 and error msg if rating is not present', () => {
      const newBookmark = {
        title: "My new bookmark title",
        description: "Really cool bookmark",
        url: "facebook.com"
      }

      return supertest(app)
        .post('/bookmarks')
        .set(headers)
        .send(newBookmark)
        .expect(400, {error: "POST failed"})
    });
  });
  
  describe('DELETE /articles/:id', () => {
    
    context('Given article exists in db', () => {

      beforeEach('Insert test bookmarks into the db', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      });

      it('Deletes bookmark from the db, responds with 200 and deleted bookmark', () => {
        const articleId = 1;
        return supertest(app)
          .delete(`/bookmarks/${articleId}`)
          .set(headers)
          .expect(200, )
      });
    })
    
    context('Given article does not exists in db', () => {

      it('Responds with 404 and "Bookmark not found"', () => {
        const articleId = 0;
        return supertest(app)
          .delete(`/bookmarks/${articleId}`)
          .set(headers)
          .expect(404, { error: "Bookmark not found" })
      });
    })
  });
});
