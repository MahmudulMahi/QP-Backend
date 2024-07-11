const express = require('express')
const cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.Port || 5000

// middleware
app.use(cors())
app.use(express.json())

// qpServer
// 5zX8N86i46q4Cy4t




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8zyyzcn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const qpMainCollection = client.db("qpServer").collection('qpmain')
    const userCollection = client.db("qpServer").collection('users')
    const postCollection = client.db("qpServer").collection('post')
    const storyCollection = client.db("qpServer").collection('story')

    app.get('/qpmain', async (req, res) => {
      const result = await qpMainCollection.find().toArray()
      res.send(result)
    })
// create token
    app.post('/api/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log(token);
      res.send({token});

    });

    //  registration
    app.post('/api/signup', async (req, res) => {
      const { first_name, last_name, email, phone, password, user_role, gender, day, month, year } = req.body;
      const birthDate = new Date(`${year}-${month}-${day}`);
      const newUser = {
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        password,
        userRole: user_role,
        gender,
        birthDate,
      };
      console.log(newUser);

      const result = await userCollection.insertOne(newUser);
      res.send(result)
    });
  

    app.get('/api/save-post',  async (req, res) => {
     
      // console.log(req.query);
      // let query = {}; //get all post
      // if (req.query?.email) {
      //   query = {email:req.query.email};
      // }

      const result = await postCollection.find().toArray();
      res.send(result);
    });

    //get story image 
    app.get('/storyimg', async (req, res) => {
     
      const result = await storyCollection.find().toArray()
      res.send(result)
    })

    //post story image 
    app.post('/storyimg',async(req,res)=>{
      const story=req.body
      const result=await storyCollection.insertOne(story)
      res.send(result)
    })
    // specific story
    app.get('/storyimg/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await storyCollection.findOne(query)
      res.send(result)
    })
   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Qp server is runing')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})