const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vb0ze04.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// jwt verify function/middleware
function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err) {
            return req.status(401).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next()
    })
}


async function run() {
    try{
        const usersCollection = client.db('click&buy').collection('users');


        // post users
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

         // get all users
         app.get('/users', async(req, res) => {
            const query = {}
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })

         // issue jwt token
         app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query)
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '24h'})
                return res.send({accessToken: token})
            }
            res.status(401).send({accessToken: 'invalid user'})
        })

        // make admin
        app.put('/users/admin/:id', async(req, res) => {
            

            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        // delete user
        app.delete('/users/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await usersCollection.deleteOne(filter);
            res.send(result)
        })
        
    }
    finally{

    }
}
run().catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('click & buy server running')
})

app.listen(port, () => {
    console.log(`click & buy server running on port${port}`)
})