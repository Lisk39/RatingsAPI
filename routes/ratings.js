var express = require('express');
var router = express.Router();

var dbAPI = require('../DBAPI/db.js');

var rateMethods = require('../APILibrary/ratingsAPI');

var client = dbAPI.client;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Hello Ratings');
});

/* POST add data from scraper */
router.post('/adddata', async function(req, res, next) {
  
  const data = req.body;
  
  
   
   try{
     await rateMethods.addDataScrapRat(client, data);
     res.send(data);
  
   }
   catch(err){
     res.status(400).json({message: err.message});
   }
   
 });

 /* POST find rating item*/
router.post('/findRate', async function(req, res, next) {
  
  const data = req.body;
 
  
   
   try{
     await rateMethods.getDataRatings(client, data);
     res.send(data);
  
   }
   catch(err){
     res.status(400).json({message: err.message});
   }
   
 });
 /* PATCH item Liked */
/* Jsons user and item need to be collected in to an array in one json which is passed to this API*/
router.patch('/itemliked', async function(req, res, next) {
  
  const user = req.body[0];
  const item = req.body[1];

   
   try{
    
    let userupdated = await rateMethods.likeItem(client, user , item);
     res.json(userupdated);
   }
   catch(err){
     res.status(400).json({message: err.message});
   }
   
 });
/* PATCH item DisLiked */
/* Jsons user and item need to be collected in to an array in one json which is passed to this API*/
router.patch('/itemdisliked', async function(req, res, next) {

  const user = req.body[0];
  const item = req.body[1];

  
  
  
   try{
     let userupdated = await rateMethods.dislikeItem(client, user , item);
    res.json(userupdated);
   }
   catch(err){
     res.status(400).json({message: err.message});
   }
   
 });
module.exports = router;
