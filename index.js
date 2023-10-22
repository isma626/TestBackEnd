const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const Person = require('./models/person');
const swagger = require('./swagger');

const app = express();
const port = process.env.port || 80;

// conexion  a Base de datos
const user = 'jclavijo';
const pass = '3meIaerNaD8v2gG5';
const dbname = 'test'
const uri = `mongodb+srv://${user}:${pass}@test1.rgslb3b.mongodb.net/${dbname}?retryWrites=true&w=majority`;

app.use(express.json());

const upload = multer();


mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Base de datos Conectada'))
    .catch(e => console.log(e));


app.get('/', (req, res) =>{
    res.send('Api Test Person');
});


/**
 * @swagger
 * tags:
 *   name: person
 *   description: Consulta general de personas, Segundo punto del Test
 * /person:
 *   get:
 *     summary: Consulta de personas
 *     tags: [person]
 *     responses:
 *       200:
 *         description: person.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/person'
 *       500:
 *         description: Some server error
 *
 */
app.get('/person', async (req, res) =>{
    try {
        const arrayPersonDB = await Person.find();
        res.status(200).json(arrayPersonDB)
    } catch (error) {
        console.log(error);
    }
   
})

/**
 * @swagger
 * /person/{id}:
 *   get:
 *     summary: Consulta de personas por ID
 *     tags: [person]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: id de la persona
 *     responses:
 *       200:
 *         description: person.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/person'
 *       404:
 *         description: The person was not found
 */
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

/**
 * @swagger
 * /person:
 *   post:
 *     summary: Crear personas desde txt
 *     tags: [person]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               # 'file' will be the field name in this multipart request
 *               file:
 *                 type: string
 *                 format: base64
 *     responses:
 *       200:
 *         description: Creacion de personas exitoso
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/person'
 *       500:
 *         description: no se pudo crear las personas
 */
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
    res.status(200).json(personDataOjb);
  });

/**
 * @swagger
 * tags:
 *   name: array
 *   description: Primer punto del test
 * /array:
 *   post:
 *     summary: Mezcla dos listas numericas
 *     tags: [array]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/arrays'
 *     responses:
 *       200:
 *         description: Responde lista mezclada y ordenada.
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/arrays'
 *       500:
 *         description: No se logro la mezcla
 */ 
app.post('/array', async (req, res) =>{
    try {
        let array1 = req.body.array1;
        let array2 = req.body.array2;
        res.status(200).json(mergeArray(array1,array2));
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);        
    }    
});

app.listen(port, ()=> {
    swagger(app,port);
    console.log(`Escuchando en puerto ${port}...`);
});

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

function mergeArray(array1,array2){
    let map =  new Map(array1.map(element => [element, element]));
    let arrayEnd = [];
    array2.forEach(b => {
        map.set(b,b);
    });
    for (let key of map.keys()) {
        arrayEnd.push(key);
    }
    return arrayEnd.sort(function(a,b) { return a - b } );
}



/**
 * @swagger
 * components:
 *   schemas:
 *     person:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - age
 *         - gender
 *       properties:
 *         id:
 *           type: number
 *           description: Consecutivo 
 *         name:
 *           type: string
 *           description: Nombre de la persona
 *         age:
 *           type: number
 *           description: Edad de la persona
 *         gender:
 *           type: string
 *           description: Genero de la persona
 *       example:
 *         id: 1
 *         name: John
 *         age: 25
 *         gender: M
 *     arrays:
 *       type: object
 *       required:
 *         - array1
 *         - array2
 *       properties:
 *         id:
 *           type: array
 *           description: lista numerica 1 
 *         name:
 *           type: array
 *           description: lista numerica 1
 *       example:
 *         array1: [-10,22,333,42]
 *         array2: [-11,5,22,41,42]
 */