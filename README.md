# Bookmarks API

This is an API to interact with a database of bookmarks

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine SSH: 
`git clone git@github.com:nbeers22/bookmarks-api.git name_of_your_directory`
or HTTPS: 
`git clone https://github.com/nbeers22/bookmarks-api.git name_of_your_directory`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm i`
6. Edit the contents of the `package.json` to use YOUR-PROJECT-NAME instead of `"name": "bookmarks-api",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Create a Postgres Database `createdb -U your_user_name your_db_name`

Run all the migrations `npm run migrate`

Run a specific migration `npm run migrate -- 1`

Postgres seed database `psql -U your_user_name -d your_db_name -f ./seeds/seed.bookmarks.sql`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run predeploy` which will run an npm audit and then `npm run deploy` which will push to this remote's master branch.