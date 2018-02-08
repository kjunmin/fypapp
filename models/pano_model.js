const mongoose = require('mongoose');
const dbconfig = require('../config/database_config');

const PanoMetadataSchema = mongoose.Schema({
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

const PanoMetadata = module.exports = mongoose.model('poidata', PanoMetadataSchema, 'poidata');

PanoMetadata.getPanoById = (id, callback) => {
    let query = {_id: id};
    PanoMetadata.find(query, callback);
}

PanoMetadata.getPanoInCircle = (lat, lng, minDistance, maxDistance, sampleSize, callback) => {
    PanoMetadata.find(
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

PanoMetadata.getPanoInPolygon = (lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, sampleSize, callback) => {
    PanoMetadata.find(
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
