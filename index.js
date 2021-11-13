const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


//--------------   Connection String   ------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.chteo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        //--------------   Database Connect ------------------
        await client.connect();

        //--------------   Connect with Databases   ------------------
        const database = client.db('flyingRover');
        const productsCollections = database.collection('products');
        const ordersCollections = database.collection('orders');
        const reviewsCollections = database.collection('reviews');
        const usersCollection = database.collection('users');


        //--------------   Get All Products    ------------------
        app.get('/products', async (req, res) => {
            const cursor = productsCollections.find({});
            const products = await cursor.toArray();
            res.send(products);
        });


        //--------------   Get Product using Id    ------------------
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const products = await productsCollections.findOne(query);
            res.json(products);
        });


        //--------------   Insert New Product    ------------------
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollections.insertOne(product);
            res.send(result)
        });

        //--------------   Delete Product Using Id    ------------------
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.deleteOne(query);
            res.json(result);
        });

        //--------------   Insert New Order    ------------------
        app.post('/orders', async (req, res) => {
            const orderDetails = req.body;
            const result = await ordersCollections.insertOne(orderDetails);
            res.send(result)
        });

        //--------------   Get All Orders    ------------------
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollections.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //--------------   Get Order Details Using Email    ------------------
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = await ordersCollections.find({ user: email });
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //--------------   Delete Order Using Id    ------------------
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollections.deleteOne(query);
            res.json(result);
        });

         //--------------   Update Order Status Using Id    ------------------
         app.get('/orderUpdate/:id', async (req, res) => {
            const id = req.params.id;            
            const filter = { _id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "approved"                    
                },
            };
            const result = await ordersCollections.updateOne(filter, updateDoc, options);           
            res.json(result)
        })

        //--------------   Get All Reviews    ------------------
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollections.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //--------------   Insert New Review    ------------------
        app.post('/reviews', async (req, res) => {
            const reviewDetails = req.body;
            const result = await reviewsCollections.insertOne(reviewDetails);
            res.send(result)
        });

        //--------------   Add New User    ------------------
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //--------------   Update User    ------------------
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //--------------   Check User is admin    ------------------
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        //--------------   Update User Admin    ------------------
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };           
            const updateDoc = {
                $set: {
                    role: "admin"
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);        
        });        
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
    console.log("Server is running on Port", port);
})