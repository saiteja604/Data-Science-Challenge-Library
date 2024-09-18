// models/file.js or similar
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: String,
    filepath: String,
    uploadDate: Date
});

const UploadedFile = mongoose.model('UploadedFile', fileSchema);

module.exports = UploadedFile;
