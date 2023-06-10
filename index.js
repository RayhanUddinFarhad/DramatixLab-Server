const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;
app.use(express.json());
app.use(cors())
require("dotenv").config();
const stripe = require("stripe") (process.env.PAYMENT_SECRET_KEY)



app.get('/', (req, res) => {


    res.send('Welcome to DramatixLab')
})



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');





const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.9qpxu0o.mongodb.net/?retryWrites=true&w=majority`;

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
        //  await client.connect();

        const database = client.db("DramatixLab");
        const instructors = database.collection("instructors");
        const classes = database.collection("classes");
        const users = database.collection("user");
        const booking = database.collection("booking");
        const pendingClasses = database.collection("pendingClasses");
        const allClasses = database.collection("allClasses");
        const payments = database.collection("payments");


        app.get('/instructors', async (req, res) => {


            const result = await instructors.find().toArray()

            res.send(result)





        })




        app.post('/classes', async (req, res) => {

            const infoBody = req.body

            const result = await allClasses.insertOne(infoBody)






            res.send(result)





        })


        app.get('/classes', async (req, res) => {



            const result = await allClasses.find({status : 'approved'}).toArray()

            res.send(result)
        })
        app.get ('/instructorClasses', async (req, res) => { 


            const result = await allClasses.find().toArray()
            res.send(result)





        })

        app.get ('/allClasses', async (req, res) => { 



            const result = await allClasses.find().toArray()

            res.send (result)
        })

        app.patch ('/approved/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    status: 'approved'
                },
            };

            const result = await allClasses.updateOne(filter, updateDoc);
            res.send(result);






         })



         app.patch ('/sendFeedback/:id', async (req, res) => { 

            
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const body = req.body;

            const updateDoc = {
                $set: {
                    feedback: body.message
                },
            };

            const result = await allClasses.updateOne(filter, updateDoc);


            res.send(result);




            



         })



        app.patch ('/deny/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    status: 'denied'
                },
            };

            const result = await allClasses.updateOne(filter, updateDoc);
            res.send(result);






         })






       app.get ('/adminClasses', async (req, res) => {


        const result = await allClasses.find().toArray()
        res.send(result)
        })


        app.post('/users', async (req, res) => {


            const user = req.body;
            const query = { email: user.email }
            const existingUser = await users.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await users.insertOne(user);
            res.send(result);
        })




        app.get('/users', async (req, res) => {




            const result = await users.find().toArray()

            res.send(result)
        })



        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };

            const result = await users.updateOne(filter, updateDoc);
            res.send(result);

        })

        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'instructor'
                },
            };

            const result = await users.updateOne(filter, updateDoc);
            res.send(result);

        })

        app.get('/users/instructor/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query);
            const result = { instructor: user?.role === 'instructor' }
            res.send(result);
        })


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })

        app.post('/sendClass', async (req, res) => {










        })




        app.post('/myBooking', async (req, res) => {

            const item = req.body
            // console.log(item.data._id);

            // const query = { _id : new ObjectId (item.data._id)}


            // const existingItem = await booking.findOne (query);


            // if (existingItem) {

            //     return res.status(401).send({ message : 'Item already exists'})
            // }








            const result = await booking.insertOne(item)


            res.send(result)







        })

        //   app.get ('/myBooking', async (req, res) => {

        //     const result = await booking.find().toArray()

        //     res.send (result)
        //    })
        app.get('/myBooking/:email', async (req, res) => {



            const email = req.params.email


            const result = await booking.find({ email: email }).toArray()

            res.send(result)




        })

        app.delete('/myBooking/:id', async (req, res) => {



            const id = req.params.id

            const itemId = { _id: new ObjectId(id) }

            const result = await booking.deleteOne(itemId)

            res.send(result)
        })


        app.get ('/dashboard/payment/:id', async (req, res) => { 



            const id = req.params.id

            const itemId = { _id: new ObjectId(id) }

            const result =  await booking.findOne(itemId)

            res.send (result)
        })


        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;

            const amount =  Math.round (price *100)
          
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
              amount: amount,
              currency: "usd",
              payment_method_types: [
                "card"
              ]
            });
          
            res.send({
              clientSecret: paymentIntent.client_secret,
            });
          });

          app.post ('/payments', async (req, res) => { 




            const body = req.body;
            console.log(body);
            const id = body.id
            const itemId = body.itemId
            const ItemQuery = {_id : new ObjectId (itemId)}

            const query = {_id : new ObjectId (id)}
            const result = await payments.insertOne(body);


            const deleted = await booking.deleteOne(query);

            const update = await allClasses.updateOne(ItemQuery, { $inc: { availableSeats: -1 } });

            



            res.send ({result, deleted, update})



          })

          app.get ('/myEnrolled/:email', async (req, res) => { 



            const email = req.params.email

            const result = await payments.find({ email: email}).toArray();

            res.send (result)





            
          })


          app.get('/paymentHistory/:email', async (req, res) => {
            const email = req.params.email;
          
            const result = await payments
              .find({ email: email })
              .sort({ date: -1 }) // Sort by "date" field in descending order
              .toArray();
          
            res.send(result);
          });
          









        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //  await client.close();
    }
}
run().catch(console.dir);



















app.listen(port, (req, res) => {

    console.log(`Listening on ${port}`);
})