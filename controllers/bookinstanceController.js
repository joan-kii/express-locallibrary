const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const mongoose = require('mongoose');
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
      if (err) {return next(err);};
      res.render('bookinstance_list', {title: 'Book Intance List', bookinstance_list: list_bookinstances});
    });
};

// Display detail page for specific BookInstance
exports.bookinstance_detail = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.id);
  BookInstance.findById(id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if (err) {return next(err);}
      if (bookinstance == null) {
        let err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      res.render('bookinstance_detail', {title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance});
    })
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {
  Book.find({}, 'title')
      .exec(function(err, books) {
        if (err) {return next(err);}
        res.render('bookinstance_form', {title: 'Create Book Instance', book_list: books});
      });
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = [
  body('book', 'Book must be specified').trim().isLength({min: 1}).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({min: 1}).escape(),
  body('status').escape(),
  body('due_back', 'Invalid Date').optional({checkFalsy: true}).isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back_formatted,
      }
    );
    if (!errors.isEmpty()) {
      Book.find({}, 'title')
          .exec(function(err, books) {
            if (err) {return next(err);}
            res.render('bookinstance_form', {title: 'Create Book Instance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance});
      });
      return;
    } else {
      bookinstance.save(function(err) {
        if (err) {return next(err);}
        res.redirect(bookinstance.url);
      })
    }
  }
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    bookinstance: function(callback) {
      BookInstance.findById(id).exec(callback)
    }
  }, function(err, results) {
    if (err) {return next(err);}
    if (results.bookinstance === null) {
      res.redirect('/catalog/bookinstances');
    }
    res.render('bookinstance_delete', {title: 'Delete Book Instance', bookinstance: results.bookinstance});
  })
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.authorid);
  async.parallel({
    bookinstance: function(callback) {
      BookInstance.findById(id).exec(callback)
    }
  }, function(err, results) {
    if (err) {return next(err);}
    BookInstance.findByIdAndRemove(id, function deleteBookinstance(err) {
      if (err) {return next(err);}
      res.redirect('/catalog/bookinstances');
    })
  });
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res, next) {

  let id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    bookinstance: function(callback) {
      BookInstance.findById(id).exec(callback);
    },
    list_books: function(callback) {
      Book.find({}, 'title').exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    if (results.bookinstance == null) {
      const err = new Error('Book Instance no found');
      err.status = 404;
      return next(err);
    }
    res.render('bookinstance_form', {title: 'Update Book Instance', book_list: results.list_books, bookinstance: results.bookinstance});
   });
};

// Handle BookInstance update on POST
exports.bookinstance_update_post = [

  body('book', 'Book must be specified').trim().isLength({min: 1}).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({min: 1}).escape(),
  body('status').escape(),
  body('due_back', 'Invalid Date').optional({checkFalsy: true}).isISO8601().toDate(),
  (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    const errors = validationResult(req);
    const bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back_formatted,
        _id: id 
      }
    );
    if (!errors.isEmpty()) {
      res.render('bookinstance_form', {title: 'Update Book Instance', bookinstance: bookinstance, errors: errors.array()});
      return;
    } else {
      BookInstance.findByIdAndUpdate(id, bookinstance, {}, function(err, thebookinstance) {
        if (err) {return next(err);}
        res.redirect(thebookinstance.url);
      });
    }
  }
];
 