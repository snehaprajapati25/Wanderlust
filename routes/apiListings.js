const express = require("express");
const router = express.Router();

const Listing = require('../models/listing.js');

router.get('/', async(req, res, next) =>{
    try{
        const listings = await Listing.find({});
        res.json({listings});
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async(req, res, next) =>{
    try{
        const listing = await Listing.findById(req.params.id)
        .populate('owner')
        .populate('reviews');

        if(!listing){
            return res.statusCode(404).json({error: 'Listing not found'});
            res.json({listing});
        } 
        }catch (err){
            next(err);
    }
});

module.exports = router;