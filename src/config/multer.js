const multer = require('multer');

// Configurar Multer para almacenar las imágenes en memoria
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // Limitar el tamaño del archivo a 5MB
});

module.exports = upload;