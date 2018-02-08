const mongoose = require('mongoose');
const dbconfig = require('../config/database_config');

const PlaceMetadataSchema = mongoose.Schema({
    PlaceId:{
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
    PlaceName: {
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
        require: true
    },
});

const PoiMetadata = module.exports = mongoose.model('placedata', PlaceMetadataSchema, 'placedata');

PoiMetadata.getPoiById = (id, callback) => {
    let query = {_id: id};
    PoiMetadata.find(query, callback);
}

PoiMetadata.getPoiInCircle = (lat, lng, minDistance, maxDistance, sampleSize, callback) => {
    PoiMetadata.find(
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

PoiMetadata.getPoiInPolygon = (lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, sampleSize, callback) => {
    PoiMetadata.find(
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

PoiMetadata.getPoiInPolygonSearch = (lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, category, sampleSize, callback) => {
    var regex = new RegExp(["^", category, "$"].join(""), "i");
    PoiMetadata.find(
        {
            $and: [{
                Location: {
                    $geoWithin: {
                        $geometry: {
                            type : "Polygon" ,
                            coordinates: [ [ [lng1, lat1],[lng3, lat3],   [lng4, lat4], [lng2,lat2], [lng1, lat1] ] ]
                        }
                    }
                },
                Category: {
                    '$regex' : "\b" +category + "\b",
                    '$options': 'i'
                }
            }]
        }, callback
    ).limit(sampleSize);
}