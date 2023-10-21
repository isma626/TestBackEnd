const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const personSchema = new Schema({
    id: Number,
    name: String,
    age: Number,
    gender: String
})

const Person = mongoose.model('person',personSchema);

module.exports = Person;