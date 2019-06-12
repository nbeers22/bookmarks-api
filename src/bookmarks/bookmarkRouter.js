const express = require('express');
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('../logger.js');
const bookmarks = require('../store.js');

bookmarkRouter
  .route('/bookmarks')
  .get( (req,res) => {
    res.json(bookmarks);
  })
  .post( bodyParser, (req,res) => {
    const { title, url, rating, desc = '' } = req.body;
    
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
    
    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
      rating,
      desc
    };
    bookmarks.push(bookmark);

    res.status(201).json(bookmark);
    
  });

bookmarkRouter
  .route('/bookmarks/:id')
  .get( (req,res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find( bookmark => (
      bookmark.id === +id
    ));
    // if bookmark isn't found
    if (!bookmark) {
      logger.error(`Bookmark not found at ${req.path}`);
      return res.status(404).json({error: "Bookmark not found"});
    }
    res.status(200).json(bookmark);
  })
  .delete( (req,res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex( bookmark => (
      bookmark.id === +id
    ));
    // if bookmark isn't found
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark not found at ${req.path}`);
      return res.status(404).json({error: "Bookmark not found"});
    }
    bookmarks.splice(bookmarkIndex,1);
    res.status(200).json({success: `Bookmark ${id} Deleted`});
  });

module.exports = bookmarkRouter;
