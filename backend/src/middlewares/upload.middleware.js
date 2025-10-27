const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }).array('images', 5);

module.exports = upload;