module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_TOKEN: process.env.API_TOKEN || 'abcd12345',
  DB_URL: process.env.DB_URL || 'postgresql://dunder-mifflin@localhost/bookmarks',
  TEST_DB_URL: process.env.DB_URL || 'postgresql://dunder-mifflin@localhost/bookmarks-test'
}