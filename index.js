const express = require('express')
const cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    // login page
    app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;

      try {
        // Find the user by email
        const user = await userCollection.findOne({ email });

        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check the password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        // const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

        res.send.json(user);
      } catch (error) {
        res.status(500).json({ error: 'Failed to log in' });
      }
    });
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