const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

// artCrafters
// cLyxe0l2WxC26ROl
//---- middleware----// 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5lehpdk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection


        const classesCollection = client.db('artCrafters').collection('classes')

        // ----Data Read operation----//
        app.get('/classes', async (req, res) => {
            try {
                const result = await classesCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch tasks' });
            }
        });




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// ----server test function ---//
app.get('/', (req, res) => {
    res.send('Art and crafters server is running........')
})

app.listen(port, () => {
    console.log(`Art and crafters is running on port:${port}`)
})