//MODIFY RENDER STATEMENTS TO INCORPORATE AUTH TOKEN INFO!! 4/6/24

//DID I GET A SET OF USERINDICES AND MONGOIDS INTO A MONGODB???

var express = require('express');
var router = express.Router();
// Normal include statements

const myGetRestCall=require("../middleware/RestAPIGet");
const myIncrementRestCall = require("../middleware/RestAPIIncrement");
const auth = require("../middleware/verifyToken");
//including middleware

router.get('/', auth, function(req,res,next) {
    const url = 'https://inbdpa.api.hscc.bdpa.org/v1/users';
    const token = process.env.BEARER_TOKEN;
    //console.log(url); //Debug

    // Pass url and token into RestAPIGet and pull information from response
    myGetRestCall.getWithBearerToken(url, token)
    .then(data => {
        console.log("REST CALL ", data);
        if (data.success){
            // SUBJECT TO CHANGE
            var userlist=data.users;
            var lastuserid=userlist[userlist.length-1].user_id;

            //TRYING TO STORE INFO INTO MONGO
            const { MongoClient, ServerApiVersion } = require('mongodb');
            const uri = "mongodb+srv://" + process.env.MONGO_LOGIN + "@inbdpa23.dmklbqg.mongodb.net/?retryWrites=true&w=majority&appName=inBDPA23";
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
                // Send a ping to confirm a successful connection
                await client.db("admin").command({ ping: 1 });
                console.log("Pinged your deployment. You successfully connected to MongoDB!");
                const db = client.db('inBDPA24');
                const collection = db.collection('UserIndex');
                //Try to store list in mongodb???
                
                for (var i=0; i<userlist.length; i++)
                {
                    const add= await collection.insertOne({
                        userindex: i+1,
                        mongoIndex: userlist[i].user_id
                      })

                }

                // Find the first document in the collection
                const first = await collection.find();
                console.log(first);
            } finally {
                // Ensures that the client will close when you finish/error
                await client.close();
            }
            }
            run().catch(console.dir);




            res.render('getusers', { 
                title: 'inBDPA Stats' , 
                users: userlist,
                lastuser: lastuserid,
                id: res.locals.user_id,
                role: res.locals.role,
                name: res.locals.name
            });
        } // closes if statement
        else{
            res.render('error', {title: 'Stats call failed', 
            message: data.error,
            id: res.locals.user_id,
            role: res.locals.role,
            name: res.locals.name
        });
        }
    }) // data then component
    .catch(error => console.error(error));
}); // close router.get general route

router.get('/page/:pagenum', auth, function(req,res,next) {
    const url = 'https://inbdpa.api.hscc.bdpa.org/v1/users';
    const token = process.env.BEARER_TOKEN;
    //console.log(url); //Debug

    // Pass url and token into RestAPIGet and pull information from response
    myGetRestCall.getWithBearerToken(url, token)
    .then(data => {
        console.log("REST CALL ", data);
        if (data.success){
            // SUBJECT TO CHANGE
            var userlist=data.users;
            var lastuserid=userlist[userlist.length-1].user_id;
            res.render('getusers', { 
                title: 'inBDPA Stats' , 
                users: userlist,
                lastuser: lastuserid,
                id: res.locals.user_id,
                role: res.locals.role,
                name: res.locals.name
            });
        } // closes if statement
        else{
            res.render('error', {title: 'Stats call failed', 
            message: data.error,
            id: res.locals.user_id,
            role: res.locals.role,
            name: res.locals.name
        });
        }
    }) // data then component
    .catch(error => console.error(error));
}); // close router.get general route

// GET route for a specific user (based on username)
router.get('/:username', auth, function(req,res,next) {
    const url = 'https://inbdpa.api.hscc.bdpa.org/v1/users/' + req.params.username;
    const token = process.env.BEARER_TOKEN;

    //console.log(url); //Debugging code to test url; I'll comment it out once it works

    // Pass url and token into RestAPIGet and pull information from response
    myGetRestCall.getWithBearerToken(url, token)
    .then(data => {
        console.log('REST CALL',data);
        if (data.success){
            // SUBJECT TO CHANGE
            var username=data.user.username;
            var usertype=data.user.type;
            var views=data.user.views;
            var aboutsection=data.user.sections.about;
            var educationsection=data.user.sections.education;
            var experiencesection=data.user.sections.experience;
            var skillssection=data.user.sections.skills;
            var volunteeringsection=data.user.sections.volunteering;
            var userid=data.user.user_id;

            const idurl='https://inbdpa.api.hscc.bdpa.org/v1/users/' + userid;

            console.log(idurl);

            myIncrementRestCall.incrementWithBearerToken(idurl, token);
            res.render('userprofile', 
            {title: 'User profile', 
            username: username,
            type: usertype,
            views: views+1,
            about: aboutsection,
            education: educationsection,
            experience: experiencesection,
            skills: skillssection,
            volunteering: volunteeringsection,
            id: res.locals.user_id,
            role: res.locals.role,
            name: res.locals.name
            }); //closes res.render statement



        } // closes if statement
        else{
            res.render('error', {title: 'User call failed',
            message: data.error,
            id: res.locals.user_id,
            role: res.locals.role,
            name: res.locals.name
        });
        }


    }) // data then component
    .catch(error => console.error(error));



}); // close router.get username route





module.exports=router;
    





