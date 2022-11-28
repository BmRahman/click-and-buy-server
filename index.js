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
        const productsCollection = client.db('click&buy').collection('products');
        const bookingsCollection = client.db('click&buy').collection('bookings');
        const advertisedCollection = client.db('click&buy').collection('advertised');




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

        // get user by role
        app.get('/users/:role', async(req, res) => {
            const role = req.params.role;
            const query = {role: role}
            const user = await usersCollection.find(query).toArray()
            res.send(user)
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
        
        // verify seller
        app.put('/users/verified/:id', async(req, res) => {
            

            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    verified: 'yes'
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

        // post products
        app.post('/products', async(req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })

        // // get products by category
        // app.get('/allCategory', async(req, res) => {
        //     const query = {}
        //     const result = await productsCollection.find(query).project({category: 1}).toArray()
        //     res.send(result)
        // })

        // get products by category
        app.get('/products/:category', async(req, res) => {
            const category = req.params.category;
            const query = {category: category}
            const cat = await productsCollection.find(query).toArray()
            res.send(cat)
        })

        // post bookings
        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        })

        // get bookings by email
        app.get('/bookings', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const result = await bookingsCollection.find(query).toArray();
            res.send(result)
        })

        // delete a booking
        app.delete('/bookings/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const result = await bookingsCollection.deleteOne(filter)
            res.send(result)
        })

       // get products by email
       app.get('/products', async(req, res) => {
        const email = req.query.email;
        const query = {email: email};
        const result = await productsCollection.find(query).toArray();
        res.send(result)
    })

    // delete a product
    app.delete('/products/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: ObjectId(id)}
        const result = await productsCollection.deleteOne(filter)
        res.send(result)
    })


    // get admin
    app.get('/users/admin/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email};
        const user = await usersCollection.findOne(query);
        res.send({isAdmin: user?.role === 'admin'})
    }) 

    // get seller
    app.get('/users/seller/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email};
        const user = await usersCollection.findOne(query);
        res.send({isSeller: user?.role === 'Seller'})
    }) 

    // get verified seller
    app.get('/users/verifiedseller/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email};
        const user = await usersCollection.findOne(query);
        res.send({isVerified: user?.verified === 'yes'})
    }) 

    // get buyer
    app.get('/users/buyer/:email', async(req, res) => {
        const email = req.params.email;
        const query = {email};
        const user = await usersCollection.findOne(query);
        res.send({isBuyer: user?.role === 'Buyer'})
    }) 

    // post advertised products
    app.post('/advertised', async(req, res) => {
        const advertise = req.body;
            const result = await advertisedCollection.insertOne(advertise)
            res.send(result)
    })

    // get advertised products
    app.get('/advertised', async(req, res) => {
        const query = {}
        const result = await advertisedCollection.find(query).toArray()
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