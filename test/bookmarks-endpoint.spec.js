const knex = require('knex');
const app = require('../src/app.js');
const testBookmarks = require('./bookmarks.fixtures.js');

describe('Bookmarks Endpoint', () => {
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

  describe('GET /api/bookmarks', () => {
    
    context('Given bookmarks table has data', () => {
      
      beforeEach('Insert test bookmarks into the db', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      });

      it('responds with 200 and list of all bookmarks in db', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set(headers)    
          .expect(200,testBookmarks)
      });
    });

    context('Given bookmarks table has no data', () => {

      it('responds with status 200 and empty array', () => {
        return supertest(app)
          .get('/api/bookmarks')
          .set(headers)
          .expect(200,[])
      });
    });
  });

  describe('GET /api/bookmarks/:id', () => {
    
    context('Given article with corresponding id exists in database', () => {

      beforeEach('Insert test bookmarks into the db', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      });

      it('responds with 200 and the article with the given id', () => {
        const articleId = 1;
        return supertest(app)
          .get(`/api/bookmarks/${articleId}`)
          .set(headers)
          .expect(200,testBookmarks[articleId - 1])
      })
    });
    
    context('Given article with corresponding id does not exist in database', () => {
      
      it('responds with 404 and error message', () => {
        const articleId = 0;
        return supertest(app)
          .get(`/api/bookmarks/${articleId}`)
          .set(headers)
          .expect(404, { error: "Bookmark not found" } )
      });
    });

    context(`Given an XSS attack article`, () => {
      const maliciousArticle = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'http://www.hello.com',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: 5
      }
      
      beforeEach('insert malicious article', () => {
        return db
          .into('bookmarks')
          .insert([ maliciousArticle ])
      })
      
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/bookmarks/${maliciousArticle.id}`)
          .set(headers)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      })
    })
  });
  
  describe('POST /api/bookmarks', () => {
    
    it('Adds bookmark to the db, responds with 201 and new bookmark', () => {
      const newBookmark = {
        title: "New Bookmark Test",
        description: "Really cool bookmark",
        url: "http://bookmarktest.com",
        rating: 1
      }

      return supertest(app)
        .post('/api/bookmarks')
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
            .get(`/api/bookmarks/${postResponse.body.id}`)
            .set(headers)
            .expect(postResponse.body)
        ))
    });

    const requiredFields = ["title", "url", "rating"];

    requiredFields.forEach( field => {
      const newBookmark = {
        title: "My new bookmark title",
        description: "Really cool bookmark",
        url: "facebook.com",
        rating: 4
      }

      it(`responds with 400 and error message when ${field} is missing`, () => {
        delete newBookmark[field];

        return supertest(app)
          .post('/api/bookmarks')
          .send(newBookmark)
          .set(headers)
          .expect(400, {
            error: "POST failed"
          })
      });
    });

    it(`responds with 400 and error message when rating is not between 1 and 5`, () => {
      const newBookmark = {
        title: "My new bookmark title",
        description: "Really cool bookmark",
        url: "facebook.com",
        rating: 44
      }

      return supertest(app)
        .post('/api/bookmarks')
        .send(newBookmark)
        .set(headers)
        .expect(400, {
          error: "POST failed"
        })
    });
  });
  
  describe('DELETE /api/bookmarks/:id', () => {
    
    context('Given bookmark exists in db', () => {

      beforeEach('Insert test bookmarks into the db', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      });

      it('Deletes bookmark from the db, responds with 204 and deleted bookmark', () => {
        const bookmarkId = 1;
        const expectedBookmarks = testBookmarks.filter( bookmark => bookmark.id !== bookmarkId);

        return supertest(app)
          .delete(`/api/bookmarks/${bookmarkId}`)
          .set(headers)
          .expect(204)
          .then( res => (
            supertest(app)
              .get('/api/bookmarks')
              .set(headers)
              .expect(expectedBookmarks)
          ))
      });
    })
    
    context('Given article does not exists in db', () => {

      it('Responds with 404 and "Bookmark not found"', () => {
        const bookmarkId = 0;
        return supertest(app)
          .delete(`/api/bookmarks/${bookmarkId}`)
          .set(headers)
          .expect(404, { error: "Bookmark not found" })
      });
    })
  });

  describe.only('PATCH /api/bookmarks/:id', () => {
    context('Given bookmark not found', () => {
      it('responds with 404', () => {
        const bookmarkId = 0;
        const newData = {
          title: 'New Title Yo!'
        }
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set(headers)
          .send(newData)
          .expect(404, { error: "Bookmark not found" })
      });
    });

    context('Given article exists in database', () => {
      beforeEach('insert articles', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
        })

      it('responds with 204 and updates the bookmark data', () => {
        const bookmarkId = 1;
        const newData = {
          title: "New Title",
          url: "http://newurl.com"
        };
        const expectedBookmark = {
          ...testBookmarks[bookmarkId - 1],
          ...newData
        }
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set(headers)
          .send(newData)
          .expect(204)
      });

      it('responds with 400 when no required fields are supplied', () => {
        const bookmarkId = 1;
        const newData = {
          hey: "hey there"
        }
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set(headers)
          .send(newData)
          .expect(400, { error: "PATCH failed" })
      });
    });
  });
  
});
