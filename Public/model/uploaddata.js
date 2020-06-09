const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Public/uploaddata/')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ','+','.').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now());
    }
})

var uploaddata = multer({ storage: storage })
module.exports=uploaddata;