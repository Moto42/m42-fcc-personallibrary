/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
    // this.skip();
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title:'testing title'
          })
          .end(function(err,res){
            assert.isNull(err,)
            assert.equal(res.status,200,'response status should be 200');
            assert.equal(res.body.title, 'testing title', 'response should include the title of the book added');
            assert.property(res.body,'_id');
            
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send()
          .end(function(err,res){
            assert.equal(res.status, 400);
            assert.equal(res.text,'no title given');
            
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .send()
          .end(function(err, res){
            assert.equal(res.status,200);
            assert.isArray(res.body);
            if(Array.isArray(res.body)){
              res.body.forEach(function(book){
                assert.property(book,'_id')
                assert.property(book,'title')
                assert.property(book,'commentcount')
              });
            }
            done();
          });
      });      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
        
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/notInDb')
          .send()
          .end(function(err, res){
            assert.equal(res.status,400);
            assert.equal(res.text, 'no book exists')
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)//GETing a valid id from the server first
          .get('/api/books')
          .send()
          .end(function(err,res){
            if(err) assert.fail('error GETing valid _id from server');
            else if(!Array.isArray(res.body)) assert.fail('Test aborted, res.body from GET /api/books was not an array.');
            else if(!res.body.length > 0) assert.fail('Test aborted, res.body from GET /api/books containes no books');
            else if(!res.body[0]._id) assert.fail(`Test aborted, res.body[0]._id is falsey. return value was ${res.body[0]._id}`);
            else{
              const theID = res.body[0]._id;
              chai.request(server)
                .get(`/api/books/${theID}`)
                .send()
                .end(function(err,res){
                  assert.equal(res.body._id, theID,'_id of returned document did not match _id requested');
                  assert.property(res.body,'title', 'returned object did not have a title' );
                  assert.property(res.body, 'comments', 'returned object did not have a comments property');
                  assert.isArray(res.body.comments, 'returned object\'s comments property was no an Array');
                  done();
                });
            }
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        // this.skip();
        chai.request(server)//GETing a valid id from the server first
          .get('/api/books')
          .send()
          .end(function(err,res){
            if(err) assert.fail('error GETing valid _id from server');
            else if(!Array.isArray(res.body)) assert.fail('Test aborted, res.body from GET /api/books was not an array.');
            else if(!res.body.length > 0) assert.fail('Test aborted, res.body from GET /api/books containes no books');
            else if(!res.body[0]._id) assert.fail(`Test aborted, res.body[0]._id is falsey. return value was ${res.body[0]._id}`);
            else{
              const theID = res.body[0]._id;
              const commentCount = res.body[0].commentcount;
              chai.request(server)
                .post(`/api/books/${theID}`)
                .send({
                  comment:"test comment",
                })
                .end(function(err,res){
                  assert.equal(res.body._id, theID,'_id of returned document did not match _id requested');
                  assert.property(res.body,'title', 'returned object did not have a title' );
                  assert.property(res.body, 'comments', 'returned object did not have a comments property');
                  assert.isArray(res.body.comments, 'returned object\'s comments property was no an Array');
                  assert.equal(res.body.comments.length, commentCount+1);
                  done();
                });
            }
          });
      });
      
    });
    
    suite('DELETE /api/books/[id]',function(){
      
      test('Test DELETE /api/books/[id] with invalid id',function(done){
        // this.skip();
        chai.request(server)
          .delete(`/api/books/invalidId`)
          .send()
          .end(function(err,res){
            assert.equal(res.status, 400);
            assert.equal(res.text, 'delete unsuccessful');

            done();
          });
      });
      
      test('Test DELETE /api/books/[id] with a valid id',function(done){
        // this.skip();
        chai.request(server)
          .post('/api/books')
          .send({
            title:'DELETE Testing',
          })
          .end(function(err,res){
            if(err) assert.fail(`error from server;${JSON.stringify(err, null, 3)}`)
            else{
              assert.equal(res.body.title,'DELETE Testing', 'test aborted. sacrificial title did not match title created');
              assert.property(res.body, '_id','test aborted, sacrificial object did not have an _id... somehow');
              const theId = res.body._id;
              chai.request(server)
                .delete(`/api/books/${theId}`)
                .send()
                .end(function(err, res){
                  assert.equal(res.text,'delete successful', `res.text was not 'delete successful' actual value was ${res.text}`)
                  done();
                });
            }
          })
      });      
           
    });
    
  });

});
