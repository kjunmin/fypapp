const mongoose = require('mongoose');
const dbconfig = require('../config/database_config');

const POIMetadataSchema = mongoose.Schema({
    LocationId:{
        type: String,
        require: true
    },
    Latitude: {
        type: Number,
        require: true
    },
    Longitude: {
        type: Number,
        require: true
    },
    Address: {
        type: String,
        require: true
    },
    Location: {
        coordinates: {
            type: Object
        },
        require:false
    },
    Category: {
        type: String,
    },
    Date: {
        type: String,
    },
    Url: {
        type: String,
    },
    iUrl: {
        type: String,
    },
    
});

const POIMetadata = module.exports = mongoose.model('poidata', POIMetadataSchema, 'poidata');

POIMetadata.getPOIById = (id, callback) => {
    let query = {_id: id};
    POIMetadata.find(query, callback);
}

POIMetadata.getPOIInCircle = (lat, lng, minDistance, maxDistance, sampleSize, callback) => {
    POIMetadata.find(
        {
            Location: {
                $near: { 
                    $geometry: { 
                        type: "Point",
                        coordinates: [ lng, lat ] 
                    },
                    $minDistance: minDistance,
                    $maxDistance: maxDistance
                }
            } 
        }, callback).limit(sampleSize);
}

POIMetadata.getPOIInPolygon = (lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, sampleSize, callback) => {
    POIMetadata.find(
        {
           Location: {
                $geoWithin: {
                    $geometry: {
                        type : "Polygon" ,
                        coordinates: [ [ [lng1, lat1],[lng3, lat3],   [lng4, lat4], [lng2,lat2], [lng1, lat1] ] ]
                    }
                }
            }
        }, callback
    ).limit(sampleSize);
}