const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hzcboi3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobCollection = client.db("careerNest").collection("jobs");
    const applyCollection = client.db("careerNest").collection("applyJob");

    // get all data from DB
    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();

      res.send(result);
    });

    // single data on job details pages
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    // save apply data in database
    app.post("/apply", async (req, res) => {
      const applyData = req.body;
      const result = await applyCollection.insertOne(applyData);
      res.send(result);
    });

    // get all data from apply database
    app.get("/applyJob", async (req, res) => {
      const result = await applyCollection.find().toArray();

      res.send(result);
    });

    // add job section
    app.post("/addjob", async (req, res) => {
      const addJob = req.body;
      const result = await jobCollection.insertOne(addJob);

      res.send(result);
    });

    // get my job
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    // my upload job delete
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // update job data on my uploaded jo
    app.put("/job/:id", async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };
      const result = await jobCollection.updateOne(query, updateDoc, options);
      res.send(result);

    });



    
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Careernestle server is running peacefully");
});

app.listen(port, () => {
  console.log(`Careernestle server is running on port: ${port}`);
});
