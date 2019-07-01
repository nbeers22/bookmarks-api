const express = require('express');
const xss = require('xss');
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger.js');
const BookmarksService = require('./bookmarks-service.js');

bookmarkRouter
  .route('/api/bookmarks')
  .get( (req,res,next) => {
    const knexInstance = req.app.get('db');
    
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => res.json(bookmarks))
      .catch(next)
  })
  .post( bodyParser, (req,res,next) => {
    const { title, url, rating, description = '' } = req.body;
    const knexInstance = req.app.get('db');
    const newBookmark = { title, url, rating, description };
    
    for (const [key, value] of Object.entries(newBookmark)) {
      if(value == null){
        logger.error(`POST to ${req.path} failed: ${key} missing`)
        return res.status(400).json({
          error: "POST failed"
        })
      }
    }

    if(rating < 1 || rating > 5){
      logger.error(`POST to ${req.path} failed: rating must be between 1 and 5`);
      return res.status(400).json({
        error: "POST failed"
      })
    }
    
    const bookmark = {
      title,
      url,
      rating,
      description
    };
    BookmarksService.insertBookmark(knexInstance,bookmark)
      .then(bookmark => (
        res.status(201).json(bookmark)
      ));
  });

bookmarkRouter
  .route('/api/bookmarks/:id')
  .all( (req,res,next) => {
    req.knex = req.app.get('db');
    req.id = req.params.id;
    next();
  })
  .get( (req,res,next) => {
    BookmarksService.getById(req.knex,req.id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark not found at ${req.path}`);
          return res.status(404).json({error: "Bookmark not found"});
        }
        res.status(200).json({
          id: bookmark.id,
          title: xss(bookmark.title),
          description: xss(bookmark.description),
          url: bookmark.url,
          rating: bookmark.rating
        });
      })
      .catch(next)
  })
  .delete( (req,res,next) => {
    BookmarksService.deleteBookmark(req.knex,req.id)
      .then(bookmark => {
        if(!bookmark){
          logger.error(`Bookmark not found at ${req.path}`);
          return res.status(404).json({error: "Bookmark not found"});
        }
        res.status(204).end()
      })
      .catch(next)
  })
  .patch( (req,res,next) => {
    // Finish this
    BookmarksService.updateBookmark(req.knex,req.id)
      .then( bookmark => {
        if(!bookmark){
          logger.error(`Bookmark not found at ${req.path}`);
          return res.status(404).json({error: "Bookmark not found"});
        }
      })
  });

module.exports = bookmarkRouter;
