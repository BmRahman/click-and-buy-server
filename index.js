const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vb0ze04.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const usersCollection = client.db('click&buy').collection('users');


        // post users
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
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