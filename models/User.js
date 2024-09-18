"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
// Create a Schema corresponding to the interface
var userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // other fields as needed
});
// Create a Model
var User = mongoose_1.default.model('User', userSchema);
exports.default = User;
