var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var admin = require("firebase-admin");
var models = require('../models');

/**
 * Renders the sign-in page.
 */
router.get('/', function(req, res) {
    res.render('signIn', { title: 'Sign In' });
});

/**
 * Redirects from the sign-in page to the create profile page if user isInitial or to respective role page.
 */
router.post('/', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
        console.log(firebase.auth());
        firebase.auth().currentUser.getToken(true).then(function (idToken) {
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    var uid = decodedToken.uid;
                    models.User.findOne({
                        where: { firebase_id: uid }
                    }).then(function (user) {
                        console.log(user);
                        if (user && user.isInitial == true) { // if user w/ correct pass exists
                            res.redirect('/createProfile');
                        } else if (!user) { // user doesn't exist
                            res.redirect('/signIn');
                        } else {
                            // if worker
                            if (user.role == 1) { // worker
                                res.redirect('/workerPortal');
                            } else if (user.role == 2) { // customer
                                res.redirect('/customerPortal');
                            } else if (user.role == 3) { // security
                                console.log('securityPeron');
                            } else {
                                console.log("error!");
                            }
                        }
                    });
                }).catch(function (error) {
                // Handle error
            });
        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
        });
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        res.render('signIn', {title: 'Sign In'});
    });
});

module.exports = router;
