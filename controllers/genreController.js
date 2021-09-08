const Genre = require('../models/genre');
const Book = require('../models/book');

const async = require('async');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// Display list of all Genres
exports.genre_list = function(req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_genres) {
      if (err) {return next(err);}
      res.render('genre_list', {title: 'Genre List', genre_list: list_genres});
    })
};

// Display detail page for specific Genre
exports.genre_detail = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    genre: function(callback) {
      Genre.findById(id)
        .exec(callback);
    },
    genre_books: function(callback) {
      Book.find({'genre': id})
        .exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    if (results.genre == null) {
      let err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
  });
};

// Display Genre create form on GET
exports.genre_create_get = function(req, res) {
  res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST
exports.genre_create_post = [
  body('name', 'Genre name required').trim().isLength({min: 1}).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({name: req.body.name});
    if (!errors.isEmpty()) {
      res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()});
      return;
    } else {
      Genre.findOne({name: req.body.name})
      .exec(function(err, genre_found) {
        if (err) {return next(err);}
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save(function(err) {
            if (err) {return next(err);}
            res.redirect(genre.url);
          })
        }
      });
    }
  }
];

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    genre: function(callback) {
      Genre.findById(id).exec(callback)
    },
    list_books: function(callback) {
      Book.find({'genre': id}).exec(callback)
    },
  }, function(err, results) {
    if (err) {return next(err);}
    if (results.genre === null) {
      res.redirect('/catalog/genres');
    }
    res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, list_books: results.list_books});
  })
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.authorid);
  async.parallel({
    genre: function(callback) {
      Genre.findById(id).exec(callback)
    },
    list_books: function(callback) {
      Book.find({'genre': id}).exec(callback)
    }
  }, function(err, results) {
    if (err) {return next(err);}
    if (results.list_books.length > 0) {
      res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, list_books: results.list_books});
      return;
    } else {
      Genre.findByIdAndRemove(id, function deleteGenre(err) {
        if (err) {return next(err);}
        res.redirect('/catalog/genres');
      })
    }
  });
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    genre: function(callback) {
      Genre.findById(id).exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    if (results.genre == null) {
      const err = new Error('Genre no found');
      err.status = 404;
      return next(err);
    }
    res.render('genre_form', {title: 'Update Genre', genre: results.genre});
   });
};

// Handle Genre update on POST
exports.genre_update_post = [

  body('name', 'Name must not be empty.').trim().isLength({min: 1}).escape(),
  (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    const errors = validationResult(req);
    const genre = new Genre(
      {
        name: req.body.name,
        _id: id
      }
    );
    if (!errors.isEmpty()) {
      res.render('genre_form', {title: 'Update Genre', book: books, errors: errors.array()});
      return;
    } else {
      Genre.findByIdAndUpdate(id, genre, {}, function(err, thegenre) {
        if (err) {return next(err);}
        res.redirect(thegenre.url);
      });
    }
  }
];
 