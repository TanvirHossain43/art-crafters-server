const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const instructorCollection = client.db('artCrafters').collection('instructors')

        // ----Data Read operation----//
        app.get('/classes', async (req, res) => {
            try {
                const result = await classesCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch tasks' });
            }
        });

        // popular classes
        app.get('/classes/popular', async (req, res) => {
            try {
                const result = await classesCollection.find().sort('-students').limit(6).toArray()
                res.send(result)
            }
            catch (error) {
                res.status(500).send({ error: 'Failed to fetch tasks' });
            }

        })

        // to get classes by specific id

        app.get('/classes/:id', async (req, res) => {

            try {
                const id = req.params.id;
                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ error: 'Invalid task ID' });
                }

                const query = { _id: new ObjectId(id) };
                const result = await classesCollection.findOne(query);
                if (!result) {
                    return res.status(404).send({ error: 'Task not found' });
                }

                res.send(result);
            }
            catch (error) {
                res.status(500).send({ error: 'Failed to fetch task' });
            }
        });

        // get the all instructors
        app.get('/instructors', async (req, res) => {
            try {
                const result = await instructorCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch tasks' });
            }
        });

        // popular instructors
        app.get('/instructors/popular', async (req, res) => {
            try {
                const result = await instructorCollection.find().limit(6).toArray()
                res.send(result)
            }
            catch (error) {
                res.status(500).send({ error: 'Failed to fetch tasks' });
            }

        })


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