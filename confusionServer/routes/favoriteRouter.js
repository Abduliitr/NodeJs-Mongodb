const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors =  require('./cors');

const Favorites = require('./../models/favorite');

const FavoriteRouter = express.Router();

FavoriteRouter.use(bodyParser.json());

FavoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next)=>{
    Favorites.find({})
    .populate('user')
    .populate('dishes')
    .then((favorites)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err)=> next(err))
    .catch((err)=>{
        next(err);
    });
})
.post(cors.corsWithOptions , authenticate.verifyUser,  (req, res, next)=>{
    req.body.user = req.user._id;

    Favorites.findOne({user : req.user})
    .then((favorite) => {
        if(favorite===null){
            Favorites.create(req.body)
            .then((favorite)=>{
                console.log('favorite Created ', favorite);
                // console.log("User is " + req.user);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err)=> next(err))
            
        }
        else{
            var arr = favorite.dishes;
            arr.push(req.body.dishes);
            favorite.dishes.remove({});
            favorite.dishes.create(arr)
            .then((f)=>{
                console.log('favorite Created (Updated) ', favorite);
                // console.log("User is " + req.user);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err)=> next(err))
            
        }
    }) 
    .catch((err)=> next(err)); 
})
.put(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites'); 
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{

    Favorites.findOne({user : req.user})
    .then((favorite) => {
        favorite.remove({})
        .then((resp)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err)=> next(err))
        
    })  
    .catch((err)=> next(err));
});


FavoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next)=>{
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites' + req.params.dishId); 
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    req.body.user = req.user._id;
    req.body.dishes = [req.params.dishId];
    Favorites.findOne({user : req.user})
    .then((favorite) => {
        if(favorite===null){
            Favorites.create(req.body)
            .then((favorite)=>{
                console.log('favorite Created bcoz it was not there', favorite);
                // console.log("User is " + req.user);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err)=> next(err))
            
        }
        else{
            favorite.dishes.push(req.params.dishId)
            favorite.save()
            .then((f)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(f);
            }, (err) => next(err)); 
        }
    }) 
    .catch((err)=> next(err)); 
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites' + req.params.dishId)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{

    req.body.user = req.user._id;
    req.body.dishes = [req.params.dishId];
    Favorites.findOne({user : req.user})
    .then((favorite) => {
        if(favorite===null){
            err = new Error('Dish '+req.params.dishId+' not Found in your favorites!');
            err.statusCode = 404;
            return next(err);
        }
        else{
            favorite.dishes.findByIdAndRemove({_id:req.params.dishId})
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err)=> next(err)) 
        }
    })  
    .catch((err)=> next(err));
});

module.exports = FavoriteRouter;