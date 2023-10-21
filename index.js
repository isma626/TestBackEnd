const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const app = express();
const port = process.env.port || 80;

// conexion  a Base de datos
const user = 'jclavijo';
const pass = '3meIaerNaD8v2gG5';
const dbname = 'test'
const uri = `mongodb+srv://${user}:${pass}@test1.rgslb3b.mongodb.net/${dbname}?retryWrites=true&w=majority`;

const Person = require('./models/person');

app.use(express.json());

const upload = multer();


mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Base de datos Conectada'))
    .catch(e => console.log(e));


app.get('/', (req, res) =>{
    res.send('Api Test Person');
});

app.get('/person', async (req, res) =>{
    try {
        const arrayPersonDB = await Person.find();
        res.status(200).json(arrayPersonDB)
    } catch (error) {
        console.log(error);
    }
   
})

app.get('/person/:id', async (req, res) =>{
    try {
        await Person.findOne({id: {$gte:req.params.id} })
            .then((docs)=>{
                console.log("Result :",docs);
                res.status(200).json(docs)
            })
            .catch((err)=>{
                console.log(err);
                res.send(err);
            });        
    } catch (error) {
        console.log(error);
    }   
})

app.post('/person', upload.single('file'), (req, res) => {
    let personData = JSON.parse(toJson(req.file.buffer.toString('utf8')));
    let personDataOjb = toPerson(personData);
    for(var personItem in personDataOjb){
        new Person(personDataOjb[personItem])
          .save()
          .catch((err)=>{
            console.log(err.message);
          });
    }
    res.status(200).json("guardado exitoso")
  });
 
app.listen(port, ()=> console.log(`Escuchando en puerto ${port}...`));

function toPerson(personData){
    let personDataOjb = [];
    for(var personItem in personData){
        let person = new Person();
        person.id = personData[personItem].id;
        person.name = personData[personItem].name;
        person.age = personData[personItem].age;
        person.gender = personData[personItem].gender;
        personDataOjb.push(person);
    }
    return personDataOjb;
}

function toJson(csv){
    const array = csv.toString().split("\r\n");
    let result = [];
    let headers = array[0].split(",")
    for (let i = 1; i < array.length; i++) {
        let obj = {}
        let str = array[i]
        let s = ''
        let flag = 0
        for (let ch of str) {
            if (ch === '"' && flag === 0) {
                flag = 1
            }
            else if (ch === '"' && flag == 1) flag = 0
            if (ch === ',' && flag === 0) ch = '|'
            if (ch !== '"') s += ch
        }
        let properties = s.split("|")
        for (let j in headers) {
            if (properties[j].includes(", ")) {
                obj[headers[j]] = properties[j]
                    .split(",").map(item => item.trim())
            }
            else obj[headers[j]] = properties[j]
        }
        result.push(obj)
    }
    return JSON.stringify(result);
};