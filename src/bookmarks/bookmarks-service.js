const BookmarksService = {
  getAllBookmarks(knex){
    return knex
      .select('*')
      .from('bookmarks')
  },
  insertBookmark(knex,bookmark){
    return knex
      .insert(bookmark)
      .into('bookmarks')
      .returning('*')
      .then(rows => rows[0])
  },
  getById(knex,bookmarkId){
    return knex
      .select('*')
      .from('bookmarks')
      .where('id', bookmarkId)
      .first()
  },
  deleteBookmark(knex,id){
    return knex('bookmarks')
      .where({ id })
      .delete()
  },
  updateBookmark(knex, id, newBookmarkFields) {
    return knex('bookmarks')
      .where({ id })
      .update(newBookmarkFields)
  },
};

module.exports = BookmarksService;