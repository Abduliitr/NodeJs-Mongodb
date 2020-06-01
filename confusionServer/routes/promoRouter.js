const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Promotions = require('./../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req, res, next)=>{
    // res.end('Will send all the promotions to you!');
    Promotions.find({})
    .then((promotions)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
    }, (err)=> next(err))
    .catch((err)=>{
        next(err);
    });
})
.post( authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    // res.end('Will add the promotion: '+req.body.name+' with details: '+req.body.description); 
    Promotions.create(req.body)
    .then((promotion)=>{
        console.log('Promotion Created ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err)=> next(err))
    .catch((err)=> next(err));
})
.put( authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions'); 
})
.delete( authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    // res.end('Deleting all the promotions...'); 
    Promotions.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err)=> next(err))
    .catch((err)=> next(err));
});


promoRouter.route('/:promoId')
.get((req, res, next)=>{
    // res.end('Will send details of the promo: '+req.params.promoId+' to you!');
    Promotions.findById(req.params.promoId)
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err)=> next(err))
    .catch((err)=>{
        next(err);
    });
})
.post(authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    res.end('POST operation  not supported on /promotions/:promoId'); 
})
.put(authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    // res.write('Updating the promo: '+req.params.promoId);
    // res.end(' Will update the promo: '+req.body.name+' with details: '+req.body.description);
    Promotions.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, {new: true})
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err)=> next(err))
    .catch((err)=>{
        next(err);
    });
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=>{
    // res.end('Deleting promo: '+req.params.promoId); 
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err)=> next(err))
    .catch((err)=> next(err));
});


module.exports = promoRouter;