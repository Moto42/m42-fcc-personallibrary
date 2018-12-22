/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const bookSchema = require('../schema/bookSchema');
const mongoose = require('mongoose');
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
mongoose.connect(MONGODB_CONNECTION_STRING);

const  Book = mongoose.model('Book', bookSchema);

//m42 midddleware
  
function checkForTitle(req,res,next){
  if(!req.body.title) res.status(400).send('no title given');
  else next();
}

function getAllBooks(req, res, next){
  Book.find({},function(err,books){
    if(err) res.status(500).send('error retrieving books from database');
    req.books = books;
    next()
  });
}

function getBookById(req, res, next){
      var bookid = req.params.id;
      Book.findOne({_id:bookid},function(err,book){
        if(!book) res.status(400).send('no book exists');
        else if(err) res.status(500).send('error retrieving book from database');
        else {
            req.book = book;
            next();
        };
        
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    }

function postCommentToBook(req, res, next){
  var bookid = req.params.id;
  var comment = req.body.comment;
  Book.findById(bookid, function(err, book){
    if(!book) res.status(400).send('no book exists');
    else if(err) res.status(500).send('database error');
    else {
      book.comments = [...book.comments, comment];
      book.save(function(err,bookSaved){
        if(err) res.status(500).send('error saving updated book to database');
        else{
          req.book = bookSaved;
          next();
        }
      })
    }
  });
}

module.exports = function (app) {

  app.route('/api/books')
  
    .get(getAllBooks,function (req, res){
    var books;
      if(req.books.length === 0) books = [];
      else {
        books = req.books.map( (book) => {
          return {
            _id: book._id,
            title: book.title,
            commentcount: book.comments.length
          } 
        } )
      }
      res.json(books)
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(checkForTitle,function (req, res){
      var title = req.body.title;
      const newBook = Book({title:title})
      newBook.save(function(err,bookSaved){
        if(err) res.status.send('error saving book to database');
        else {
          res.send(bookSaved)
        }
      });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      Book.deleteMany({},function(err){
        if(err) res.status(500).send('complete delete unsuccessful');
        else res.send('complete delete successful')
      });
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(getBookById,function (req, res){
        res.json(req.book);  
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(postCommentToBook,function(req, res){
      // .post(getBookById,postCommentToBook,function(req, res){
      res.json(req.book);
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      Book.deleteOne({_id:bookid},function(err){
        if(err) res.status(400).send('delete unsuccessful');
        else res.send('delete successful');
      })
      //if successful response will be 'delete successful'
    });
  
};
