const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

// artCrafters
// cLyxe0l2WxC26ROl
//---- middleware----// 
app.use(cors())
app.use(express.json())


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    // bearer token
    const token = authorization.split(' ')[1];


    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }

        req.decoded = decoded;
        next();
    })
}




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
        const selectedclassCollection = client.db('artCrafters').collection('selectedClass')
        const usersCollection = client.db('artCrafters').collection('users')



        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })

            console.log(token)
            res.send({ token })

        })

        // ----Data Read operation----//
        // users api
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exist' })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                return res.send({ admin: false })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const result = { admin: user?.role === 'admin' }
            res.send(result)
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const { role } = req.body;

            try {
                const result = await usersCollection.updateOne(filter, { $set: { role } });

                if (result.modifiedCount === 1) {
                    res.send({ message: 'Role updated successfully' });
                } else {
                    res.status(404).send({ message: 'User not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Error updating role' });
            }
        });

        // instructors api
        app.get('/users/instructor/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                return res.send({ instructor: false })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const result = { instructor: user?.role === 'instructor' }
            res.send(result)
        })


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


        // post method for classes by instructor
        
        app.post('/classes', async (req, res) => {
            try {
                const newClass = req.body;

                // Check for required fields
                if (!newClass.name || !newClass.image || !newClass.status || !newClass.instructor || !newClass.instructorEmail || !newClass.availableSeats || !newClass.price) {
                    return res.status(400).send({ error: 'Missing required fields' });
                }

                const result = await classCollection.insertOne(newClass);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to create class' });
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

        //  update function for reducing classes after clicking

        // app.patch('/classes/:id', async (req, res) => {
        //     try {
        //         const id = req.params.id;
        //         if (!ObjectId.isValid(id)) {
        //             return res.status(400).send({ error: 'Invalid class ID' });
        //         }

        //         const { incrementStudents } = req.body;

        //         const query = { _id: new ObjectId(id) };
        //         const update = {};

        //         if (incrementStudents) {
        //             update.$inc = { students: 1, availableSeats: -1 };
        //         }

        //         const result = await classesCollection.findOneAndUpdate(query, update);

        //         if (!result.value) {
        //             return res.status(404).send({ error: 'Class not found' });
        //         }

        //         res.send({ modifiedCount: 1 });
        //     } catch (error) {
        //         console.error('Error updating class:', error);
        //         res.status(500).send({ error: 'Failed to update class' });
        //     }
        // });
        //   selected class collection
        app.get('/selectedClass', verifyJWT, async (req, res) => {
            const email = req.query.email;

            if (!email) {
                res.send([])
            }
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(401).send({ error: true, message: 'forbiden access' })
            }
            const query = { email: email };
            const result = await selectedclassCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/selectedClass', async (req, res) => {
            try {
                const item = req.body;
                const result = await selectedclassCollection.insertOne(item);

                res.send(result);
            } catch (error) {
                console.error('Error inserting selected class:', error);
                res.status(500).send({ error: 'Failed to insert selected class' });
            }
        });
        // delete method 

        app.delete('/selectedClass/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await selectedclassCollection.deleteOne(query)
            res.send(result)
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