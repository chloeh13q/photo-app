"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");
const cs142password = require('./cs142password.js');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var Activity = require('./schema/activity.js');

var express = require('express');
var app = express();

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /test/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, doneCallback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                doneCallback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
            }
        });
    } else {
        // If we don't understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    var query = User.find({});
    query.select('_id first_name last_name').exec(function (err, res) {
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (res.length === 0) {
            response.status(400).send('No user found.');
            return;
        }
        response.end(JSON.stringify(res));
    })
});

/*
 * URL /user/info - Return the information for all the User object
 */
app.get('/user/info', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    var userQuery = User.find({});
        userQuery.select('_id first_name last_name').exec(function (err, res) {
            if (err) {
                console.error('Error loading user model in /user/info', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (res.length === 0) {
                response.status(500).send('No user found.');
                return;
            }
            var users = [];
            var usersWithCommentCounts = [];
            async.each(res, function (user, userCallback) {
                var userCopy = JSON.parse(JSON.stringify(user));
                Photo.find({user_id: user._id}, function (photoErr, userPhotos) {
                    if (photoErr) {
                        console.error('Error loading photo model in /user/info', err);
                        response.status(500).send(JSON.stringify(err));
                        return;
                    }
                    userCopy.num_photos = userPhotos.length;
                    users.push(userCopy);
                    userCallback();
                })
            }, function (err) {
                if (err) {
                    console.error('Error loading user model in /user/info', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                var photoQuery = Photo.find({});
                photoQuery.select('comments').exec(function (err, userComments) {
                    var commentsList = userComments.map(({ comments }) => comments).flat();
                    var commentCounts = commentsList.map(({ user_id }) => user_id).reduce(function (freq, id) {
                        if (typeof freq[id] === 'undefined') {
                          freq[id] = 1;
                        } else {
                          freq[id] += 1;
                        }
                        return freq;
                      }, {});
                    async.each(users, function (user, commentCallback) {
                        user.num_comments = commentCounts[user._id];
                        usersWithCommentCounts.push(user);
                        commentCallback();
                    }, function (commentErr) {
                        if (commentErr) {
                            console.error('Error loading comments in /user/info', err);
                            response.status(500).send(JSON.stringify(err));
                            return;
                        }
                        usersWithCommentCounts = usersWithCommentCounts.sort(
                            (a, b) => (a._id < b._id) ? -1 : 1
                        );
                        response.end(JSON.stringify(usersWithCommentCounts));
                    })
                })
                
            })
            
        })
})

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    var id = request.params.id;
    var query = User.findOne({_id: id});
    query.select('_id first_name last_name location description occupation').exec(
        function (err, user) {
            if (err) {
                console.error('Unable to fetch user model for user id ' + id + ':', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (!user) {
                console.log('User with _id:' + id + ' not found.');
                response.status(400).send('Not found');
                return;
            }
            response.end(JSON.stringify(user));
        }
    )
});

/*
 * URL /photosOfUser/info - Return the information for all User Photos objects
 */
app.get('/photosOfUser/info', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    var query = Photo.find({});
    query.select('_id user_id').sort({ date_time: -1 }).exec(function (err, res) {
        if (err) {
            console.error('Error loading photo model in /photosOfUser/info', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        var photoList = JSON.parse(JSON.stringify(res)).reduce(function (list, photo) {
            if (typeof list[photo.user_id] === 'undefined') {
              list[photo.user_id] = [photo._id];
            } else {
              list[photo.user_id].push(photo._id);
            }
            return list;
          }, {});
        response.end(JSON.stringify(photoList));
    })
})

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    var id = request.params.id;
    var photoQuery = Photo.find({user_id: id});
    photoQuery.select('_id user_id comments file_name date_time likes').exec(function (err, res) {
        if (err) {
            console.error('Unable to fetch user model for user id ' + id + ':', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // if (res.length === 0) {
        //     console.log('Photos for user with _id:' + id + ' not found.');
        //     response.status(400).send('Not found');
        //     return;
        // }
        var resCopy = JSON.parse(JSON.stringify(res));
        var photos = [];
        async.each(resCopy, function (photo, doneCallback) {
            var comments = [];
            async.each(photo.comments, function (comment, callback) {
                var userQuery = User.findOne({_id: comment.user_id});
                userQuery.select('_id first_name last_name').exec(
                    function (err, user) {
                        if (err) {
                            console.error('Unable to fetch user model for user id ' + comment.user_id + ':', err);
                            response.status(500).send(JSON.stringify(err));
                            return;
                        }
                        if (!user) {
                            console.log('User with _id:' + comment.user_id + ' not found.');
                            response.status(500).send('Not found');
                            return;
                        }
                        comment.user = user;
                        comment = (({ comment, date_time, _id, user }) => ({ comment, date_time, _id, user }))(comment);
                        comments.push(JSON.parse(JSON.stringify(comment)));
                        callback(err);
                    }
                )
            }, function (commentErr) {
                if (commentErr) {
                    console.error('Error loading comment in /photosOfUser/:id:', commentErr);
                    response.status(500).send(JSON.stringify(commentErr));
                    return;
                }
                comments = comments.sort((a, b) => (a.date_time < b.date_time) ? 1 : -1);
                photo.comments = comments;
                photos.push(JSON.parse(JSON.stringify(photo)));
                doneCallback(commentErr);
            })
        }, function (photoErr) {
            if (photoErr) {
                console.error('Error loading photo model in /photosOfUser/:id:', photoErr);
                response.status(500).send(JSON.stringify(photoErr));
                return;
            }
            photos = photos.sort((a, b) => (a.date_time < b.date_time) ? 1 : -1);
            response.end(JSON.stringify(photos));
        })
    })
});

/*
 * URL /commentsOfUser/:id - Return the Comments for User (id)
 */
app.get('/commentsOfUser/:id', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    var id = request.params.id;
    var query = Photo.find({});
    query.select('_id user_id file_name comments').exec(
        function (err, res) {
            if (err) {
                console.error('Error loading photo model in /commentsOfUser/:id:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            var comments = [];
            async.each(res, function (photo, doneCallback) {
                var commentList = JSON.parse(JSON.stringify(photo.comments));
                async.each(commentList, function (comment, callback) {
                    if (comment.user_id === id) {
                        comment.photo_file_name = photo.file_name;
                        comment.photo_user_id = photo.user_id;
                        comment.photo_id = photo._id;
                        comments.push(comment);
                    }
                    callback();
                }, function (commentErr) {
                    if (commentErr) {
                        console.error('Error loading comment in /commentsOfUser/:id:', commentErr);
                        response.status(400).send(JSON.stringify(commentErr));
                        return;
                    }
                    doneCallback();
                })
            }, function (photoErr) {
                if (photoErr) {
                    console.error('Error loading photo model in /commentsOfUser/:id:', photoErr);
                    response.status(500).send(JSON.stringify(photoErr));
                    return;
                }
                comments = comments.sort((a, b) => (a.date_time < b.date_time) ? 1 : -1);
                response.end(JSON.stringify(comments));
            })
        }
    )
})

app.get('/activities', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    var query = Activity.find({}).sort({ date_time: -1 }).limit(10);
    query.select('_id activity date_time user_id photo_id comment').exec(
        function (err, activities) {
            if (err) {
                console.error('Server error in /activities');
                response.status(500).send(JSON.stringify(err));
                return;
            }
            var activitiesCopy = JSON.parse(JSON.stringify(activities));
            async.each(activitiesCopy, function (activity, callback) {
                var userQuery = User.findOne({_id: activity.user_id});
                userQuery.select('first_name last_name').exec(
                    function (userQueryErr, user) {
                        if (userQueryErr) {
                            console.error('Server error in /activities');
                            response.status(500).send(JSON.stringify(err));
                            return;
                        }
                        activity.first_name = user.first_name;
                        activity.last_name = user.last_name;
                        // delete activity.user_id;
                        if (activity.photo_id !== null) {
                            var photoQuery = Photo.findOne({_id: activity.photo_id});
                            photoQuery.select('file_name user_id').exec(
                                function (photoQueryErr, photo) {
                                    if (photoQueryErr) {
                                        console.error('Server error in /activities');
                                        response.status(500).send(JSON.stringify(err));
                                        return;
                                    }
                                    activity.file_name = photo.file_name;
                                    activity.photo_user_id = photo.user_id;
                                    callback();
                                }
                            )
                        } else {
                            callback();
                        }
                    }
                )
            }, function (activityErr) {
                if (activityErr) {
                    console.error('Server error in /activities');
                    response.status(500).send(JSON.stringify(activityErr));
                    return;
                }
                response.end(JSON.stringify(activitiesCopy));
            })
        }
    )

})

app.post('/admin/login', function (request, response) {
    var query = User.findOne({login_name: request.body.login_name});
    query.select('_id password_digest salt first_name login_name').exec(
        function (err, user) {
            if (err) {
                console.error('Server error in /admin/login');
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (!user) {
                response.status(400).send('Invalid username or password.');
                return;
            }
            if (!cs142password.doesPasswordMatch(user.password_digest, user.salt, request.body.password)) {
                response.status(400).send('Invalid username or password.');
                return;
            }
            Activity.create({
                activity: 'new login',
                date_time: Date.now(),
                user_id: user._id,
            }, function (createErr, newActivity) {
                if (createErr) {
                    response.status(500).send(JSON.stringify(createErr));
                    return;
                }
                newActivity.save();
                console.log('Adding activity: ' + newActivity.activity + ' from user ID ' + newActivity.user_id);
                request.session.is_loggedin = true;
                request.session.user_id = user._id;
                request.session.login_name = user.login_name;
                request.session.first_name = user.first_name;
                response.end(JSON.stringify(user));
            });
        }
    )
})

app.get('/admin/status', function (request, response) {
    if (!request.session.is_loggedin) {
        response.end(JSON.stringify({
            is_loggedin: false,
            first_name: undefined
        }))
    } else {
        response.end(JSON.stringify({
            is_loggedin: request.session.is_loggedin,
            user_id: request.session.user_id,
            first_name: request.session.first_name
        }));
    }
})

app.post('/admin/logout', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(400).send('Bad request. Not logged in.')
        return;
    }
    Activity.create({
        activity: 'new logout',
        date_time: Date.now(),
        user_id: request.session.user_id,
    }, function (createErr, newActivity) {
        if (createErr) {
            response.status(500).send(JSON.stringify(createErr));
            return;
        }
        newActivity.save();
        console.log('Adding activity: ' + newActivity.activity + ' from user ID ' + newActivity.user_id);
        request.session.destroy(function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            response.end();
        })
    });
})

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    // Reject empty comments with status 400
    if (request.body.comment.length === 0) {
        response.status(400).send('Comment is empty.')
        return;
    }
    var photo_id = request.params.photo_id;
    Photo.findOne({_id: photo_id}, function (err, photo) {
        if (err || !photo) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        var time = Date.now();
        photo.comments.push({
            comment: request.body.comment,
            user_id: request.session.user_id,
            date_time: time,
        });
        var commentIds = photo.comments.map(({ _id }) => _id);
        Activity.create({
            activity: 'new comment',
            date_time: time,
            user_id: request.session.user_id,
            photo_id: photo_id,
            comment_id: commentIds[commentIds.length - 1],  // need comment id in order to delete the activity
            comment: request.body.comment,
        }, function (createErr, newActivity) {
            if (createErr) {
                response.status(500).send(JSON.stringify(createErr));
                return;
            }
            photo.save(function (savePhotoErr) {
                if (savePhotoErr) {
                    response.status(500).send(JSON.stringify(savePhotoErr));
                    return;
                }
                newActivity.save(function (saveActivityErr) {
                    if (saveActivityErr) {
                        response.status(500).send(JSON.stringify(saveActivityErr));
                        return;
                    }
                    console.log('Adding activity: ' + newActivity.activity + ' from user ID ' + newActivity.user_id);
                    response.end();
                });
            })
        });
    })

})

app.post('/photos/new', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    processFormBody(request, response, function (err) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        // Reject with status 400 if there is no file in the POST request
        if (!request.file) {
            response.status(400).send('No file found in POST request.')
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
        
        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
          if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
          }
          var time = Date.now();
          Photo.create({ 
              file_name: filename,
              user_id: request.session.user_id,
              date_time: time,
              comments: []
          }, function (createPhotoErr, newPhoto) {
              if (createPhotoErr) {
                response.status(400).send(JSON.stringify(createPhotoErr));
                return;
              }
              console.log('Adding photo: ' + filename + ' of user ID ' + request.session.user_id);
              Activity.create({
                activity: 'new photo',
                date_time: time,
                user_id: request.session.user_id,
                photo_id: newPhoto._id,
              }, function (createActivityErr, newActivity) {
                if (createActivityErr) {
                    response.status(500).send(JSON.stringify(createActivityErr));
                    return;
                }
                newPhoto.save();
                newActivity.save();
                console.log('Adding activity: ' + newActivity.activity + ' from user ID ' + newActivity.user_id);
                response.end();
            });
          })
        });
    });
})

app.post('/user', function (request, response) {
    User.findOne({login_name: request.body.login_name}, function (err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user !== null) {
            response.status(400).send('Username already exists.');
            return;
        }
        var passwordEntry = cs142password.makePasswordEntry(request.body.password);
        User.create({
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            location: request.body.location,
            description: request.body.description,
            occupation: request.body.occupation,
            login_name: request.body.login_name,
            password_digest: passwordEntry.hash,
            salt: passwordEntry.salt
        }, function (createErr, newUser) {
            if (createErr) {
                response.status(400).send(JSON.stringify(createErr));
                return;
            }
            Activity.create({
                activity: 'new user',
                date_time: Date.now(),
                user_id: newUser._id,
            }, function (createActivityErr, newActivity) {
                if (createActivityErr) {
                    response.status(400).send(JSON.stringify(createActivityErr));
                    return;
                }
                newUser.save();
                newActivity.save();
                console.log('Adding user: ' + newUser.first_name + ' ' + newUser.last_name + ' with ID ' + newUser._id);
                console.log('Adding activity: ' + newActivity.activity + ' from user ID ' + newActivity.user_id);
                response.end();
            })
        })
    })
})

app.post('/like', function (request, response) {
    Photo.findOne({_id: request.body.photo_id}, function (err, photo) {
        if (err || !photo) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // User tries to like a photo he/she has already liked
        var index = photo.likes.indexOf(request.session.user_id);
        if (index > -1) {
            response.status(400).send(JSON.stringify('Action not allowed.'));
            return;
        }
        photo.likes.push(request.session.user_id);
        photo.save(function (savePhotoErr) {
            if (savePhotoErr) {
                response.status(500).send(JSON.stringify(savePhotoErr));
                return;
            }
            Activity.create({
                activity: 'new like',
                date_time: Date.now(),
                user_id: request.session.user_id,
                photo_id: photo._id
            }, function (createActivityErr, newActivity) {
                if (createActivityErr) {
                    response.status(400).send(JSON.stringify(createActivityErr));
                    return;
                }
                newActivity.save(function (saveActivityErr) {
                    if (saveActivityErr) {
                        response.status(500).send(JSON.stringify(saveActivityErr));
                        return;
                    }
                    response.send();
                })
            })
        })
    })
})

app.delete('/like', function (request, response) {
    Photo.findOne({_id: request.body.photo_id}, function (err, photo) {
        if (err || !photo) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // User tries to unlike a photo he/she has not liked
        var index = photo.likes.indexOf(request.session.user_id);
        if (index === -1) {
            response.status(400).send(JSON.stringify('Action not allowed.'));
            return;
        }
        photo.likes.splice(index, 1);
        photo.save(function (savePhotoErr) {
            if (savePhotoErr) {
                response.status(500).send(JSON.stringify(savePhotoErr));
                return;
            }
            Activity.deleteMany({
                activity: 'new like', 
                photo_id: request.body.photo_id,
                user_id: request.session.user_id
            }, function (deleteActivityErr) {
                if (deleteActivityErr) {
                    response.status(500).send(JSON.stringify(deleteActivityErr));
                    return;
                }
                response.send();
            })
        })
    })
})

app.delete('/comment', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    Photo.findOne({_id: request.body.photo_id}, function (err, photo) {
        if (err || !photo) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        var indexOfComment = photo.comments.map(function(comment) { return comment._id }).indexOf(request.body.comment_id);
        // Comment not found
        if (indexOfComment === '-1') {
            response.status(400).send(JSON.stringify("Error: comment doesn't exist."));
            return;
        }
        // User tries to delete a comment he/she does not own
        if (request.session.user_id !== photo.comments[indexOfComment].user_id.toString()) {
            response.status(401).send('Access denied.')
            return;
        }
        photo.comments.splice(indexOfComment, 1);
        photo.save(function (savePhotoErr) {
            if (savePhotoErr) {
                response.status(500).send(JSON.stringify(savePhotoErr));
                return;
            }
            Activity.deleteMany({comment_id: request.body.comment_id}, function (deleteActivityErr) {
                if (deleteActivityErr) {
                    response.status(500).send(JSON.stringify(deleteActivityErr));
                    return;
                }
                response.end();
            });
        })
    })
})

app.delete('/photo', function (request, response) {
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    Photo.findOne({_id: request.body.photo_id}, function (err, photo) {
        if (err || !photo) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // User tries to delete a photo he/she does not own
        if (request.session.user_id !== photo.user_id.toString()) {
            response.status(401).send('Access denied.')
            return;
        }
        photo.remove(function (removePhotoErr) {
            if (removePhotoErr) {
                response.status(500).send(JSON.stringify(removePhotoErr));
                return;
            }
            fs.unlink('./images/' + photo.file_name, (unlinkPhotoErr) => {
                if (unlinkPhotoErr) {
                    response.status(500).send(JSON.stringify(unlinkPhotoErr));
                    return;
                }
                Activity.deleteMany({photo_id: request.body.photo_id}, function (deleteActivityErr) {
                    if (deleteActivityErr) {
                        response.status(500).send(JSON.stringify(deleteActivityErr));
                        return;
                    }
                    response.end();
                });
            })
        })
    })
})

app.delete('/user', function (request, response) {
    console.log(request.session)
    if (!request.session.is_loggedin) {
        response.status(401).send('Not logged in.')
        return;
    }
    User.findOne({_id: request.session.user_id}, function (userQueryErr, user) {
        if (userQueryErr || !user) {
            response.status(400).send(JSON.stringify(userQueryErr));
            return;
        }
        user.remove(function (removeUserErr) {
            if (removeUserErr) {
                response.status(500).send(JSON.stringify(removeUserErr));
                return;
            }
            Photo.find({user_id: request.session.user_id}, function (photoQueryErr, photos) {
                if (photoQueryErr) {
                    console.error('Server error when deleting user');
                    response.status(500).send(JSON.stringify(photoQueryErr));
                    return;
                }
                async.each(photos, function (photo, callback) {
                    photo.remove(function (removePhotoErr) {
                        if (removePhotoErr) {
                            response.status(500).send(JSON.stringify(removePhotoErr));
                            return;
                        }
                        fs.unlink('./images/' + photo.file_name, (unlinkPhotoErr) => {
                            if (unlinkPhotoErr) {
                                response.status(500).send(JSON.stringify(unlinkPhotoErr));
                                return;
                            }
                            callback();
                        })
                    })
                }, function (photoErr) {
                    if (photoErr) {
                        console.error('Server error when deleting user');
                        response.status(500).send(JSON.stringify(photoErr));
                        return;
                    }
                    var commentQuery = Photo.find({});
                    commentQuery.select('comments').exec(function (commentQueryErr, photosWithComments) {
                        if (commentQueryErr) {
                            response.status(500).send(JSON.stringify(commentQueryErr));
                            return;
                        }
                        async.each(photosWithComments, function (photoWithComments, photosCallback) {
                            var commentsCopy = [];
                            async.each(photoWithComments.comments, function (comment, commentCallback) {
                                if (comment.user_id.toString() !== request.session.user_id) {
                                    commentsCopy.push(comment);
                                }
                                commentCallback();
                            }, function (commentErr) {
                                if (commentErr) {
                                    response.status(500).send(JSON.stringify(commentErr));
                                    return;
                                }
                                photoWithComments.comments = commentsCopy;
                                photoWithComments.save();
                                photosCallback();
                            })
                        }, function (photosWithCommentsErr) {
                            if (photosWithCommentsErr) {
                                response.status(500).send(JSON.stringify(photosWithCommentsErr));
                                return;
                            }
                            var likeQuery = Photo.find({});
                            likeQuery.select('likes').exec(function (likeQueryErr, photosWithLikes) {
                                async.each(photosWithLikes, function (photoWithLikes, likesCallback) {
                                    var index = photoWithLikes.likes.indexOf(request.session.user_id);
                                    if (index > -1) {
                                        photoWithLikes.likes.splice(index, 1);
                                    }
                                    photoWithLikes.save();
                                    likesCallback();
                                }, function (likesErr) {
                                    if (likesErr) {
                                        response.status(500).send(JSON.stringify(likesErr));
                                        return;
                                    }
                                    Activity.deleteMany({user_id: request.session.user_id}, function (deleteActivityErr) {
                                        if (deleteActivityErr) {
                                            response.status(500).send(JSON.stringify(deleteActivityErr));
                                            return;
                                        }
                                        request.session.destroy(function (destroySessionErr) {
                                            if (destroySessionErr) {
                                                response.status(500).send(JSON.stringify(destroySessionErr));
                                                return;
                                            }
                                            response.end();
                                        })
                                        response.end();
                                    })
                                })
                            })

                        })
                    })
                })
            })
        })
    })
})


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


