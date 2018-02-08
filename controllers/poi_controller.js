const POI = require('../models/poi_model');

module.exports = {

    getPOIInCircle: (req, res, next) => {
        let latitude = req.body.lat;
        let longitude = req.body.lng;
        let minDistance = req.body.mindistance;
        let maxDistance = req.body.maxdistance;
        let sampleSize = req.body.sampleSize;
        POI.getPOIInCircle(latitude, longitude, minDistance, maxDistance, sampleSize, (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                res.json({ success: false, output: "No poi found in specified area!"});
            } else {
                res.json({ success: true, output: results});
            }
        }) 
    },

    getPOIInPolygon: (req, res, next) => {
        let lat1 = req.body.lat1;
        let lng1 = req.body.lng1;
        let lat2 = req.body.lat2;
        let lng2 = req.body.lng2;
        let lat3 = req.body.lat3;
        let lng3 = req.body.lng3;
        let lat4 = req.body.lat4;
        let lng4 = req.body.lng4;
        let sampleSize = req.body.sampleSize;
        POI.getPOIInPolygon(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, sampleSize, (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                res.json({ success: false, output: "No poi found in specified area!"});
            } else {
                res.json({ success: true, output: results});
            }
        })
    },

}