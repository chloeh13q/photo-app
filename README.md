# Photo App

This photo app was developed as a class project in CS142 at Stanford. It uses the MERN stack.

Instructions for running the photo app:
1. Clone this repository in its entirety.
2. Use the command `npm install` to fetch all the relevant node modules.
  - Any software packages I use in the project is either listed in the package.json or present as a subdirectory (not node_modules/) of the project directory.
3. [Start mongod](https://docs.mongodb.com/manual/administration/install-community/) (from a fresh state). Create the db and seed the database by typing `node loadDatabase.js`.
  - The loadDatabase.js script works to load a clean instance of MongoDB with the appropriate schemas and objects for the photo app to run.
4. The command `node webServer.js` starts your web server and connects to a MongoDB instance on the localhost at the standard port address.  The URL http://localhost:3000/photo-share.html should start the app.

- submission.txt includes details about the features of this photo app, as well as a short YouTube video tour of the photo app.
