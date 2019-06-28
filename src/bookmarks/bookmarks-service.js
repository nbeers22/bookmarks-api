const BookmarksService = {
  getAllBookmarks(knex){
    return knex
      .select('*')
      .from('blogful_articles')
  },
  insertArticle(knex,article){
    return knex
      .insert(article)
      .into('blogful_articles')
      .returning('*')
      .then(rows => rows[0])
  },
  getById(knex,articleId){
    return knex
      .select('*')
      .from('blogful_articles')
      .where('id', articleId)
      .first()
  },
  deleteArticle(knex,id){
    return knex('blogful_articles')
      .where({ id })
      .delete()
  },
  updateArticle(knex, id, newArticleFields) {
    return knex('blogful_articles')
      .where({ id })
      .update(newArticleFields)
  },
};

module.exports = BookmarksService;