const express = require('express');
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger.js');
const BookmarksService = require('./bookmarks-service.js');

bookmarkRouter
  .route('/bookmarks')
  .get( (req,res,next) => {
    const knexInstance = req.app.get('db');
    
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => res.json(bookmarks))
      .catch(next)
  })
  .post( bodyParser, (req,res,next) => {
    const { title, url, rating, description = '' } = req.body;
    const knexInstance = req.app.get('db');
    
    if (!title) {
      logger.error(`POST to ${req.path} failed: Title missing`)
      return res.status(400).json({error: "POST failed"})
    }
    if (!url) {
      logger.error(`POST to ${req.path} failed: url missing`)
      return res.status(400).json({error: "POST failed"})
    }
    if (!rating) {
      logger.error(`POST to ${req.path} failed: rating missing`)
      return res.status(400).json({error: "POST failed"})
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
  .route('/bookmarks/:id')
  .get( (req,res) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db');

    BookmarksService.getById(knexInstance,id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark not found at ${req.path}`);
          return res.status(404).json({error: "Bookmark not found"});
        }
        res.json(200,bookmark);
      })
  })
  .delete( (req,res) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db');
    
    BookmarksService.deleteBookmark(knexInstance,id)
      .then(bookmark => {
        if(!bookmark){
          logger.error(`Bookmark not found at ${req.path}`);
          return res.status(404).json({error: "Bookmark not found"});
        }
        res.status(200).json({success: `Bookmark ${id} Deleted`});
      })
    
  });

module.exports = bookmarkRouter;
