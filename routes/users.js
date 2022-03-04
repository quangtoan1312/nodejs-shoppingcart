var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

// Get Users model
var User = require('../models/user');

// GET register
router.get('/register', function(req, res) {
    res.render('register', {
        title: 'Đăng kí'
    });
});

// POST register
router.post('/register', function(req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Tên không được để trống!').notEmpty();
    req.checkBody('email', 'Email không được để trống!').isEmail();
    req.checkBody('username', 'Tên đăng nhập không được để trống!').notEmpty();
    req.checkBody('password', 'Mật khẩu không được để trống!').notEmpty();
    req.checkBody('password2', 'Mật khẩu không trùng khớp!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Đăng kí'
        });
    } else {
        User.findOne({ username: username }, function(err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Tên đăng nhập đã tồn tại!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'Đăng kí thành công!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }

});

/*
 * GET login
 */
router.get('/login', function(req, res) {

    if (res.locals.user) res.redirect('/');

    res.render('login', {
        title: 'Đăng nhập'
    });

});

/*
 * POST login
 */
router.post('/login', function(req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});

/*
 * GET logout
 */
router.get('/logout', function(req, res) {

    req.logout();

    req.flash('success', 'Đăng xuất thành công!');
    res.redirect('/users/login');

});

// Exports
module.exports = router;