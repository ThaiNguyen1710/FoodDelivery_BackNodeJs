const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/webp': 'webp'
}

const storage = multer.memoryStorage(); // Sử dụng memory storage thay vì disk storage

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        if (isValid) {
            cb(null, true);
        } else {
            const uploadError = new Error('Invalid image type');
            cb(uploadError);
        }
    }
});

module.exports = upload;
