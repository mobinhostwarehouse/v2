const { MongoClient } = require("mongodb");

async function MDBConnect() {
    const MongoURL = "mongodb://127.0.0.1:27017/";
    const MongoDBclient = new MongoClient( MongoURL );
    await MongoDBclient.connect();
    return MongoDBclient
}

function MDBSelect( MongoDBclient , MongoDataBaseName , MongoCollectionName ) {
    const MongoDataBaseObj = MongoDBclient.db( MongoDataBaseName );
    const MongoCollectionObj = MongoDataBaseObj.collection( MongoCollectionName );
    return MongoCollectionObj
}

async function MDBClose( MongoDBclient ) {
    await MongoDBclient.close();
}

async function X() {
    const MDBSession = await MDBConnect();
    let Doc = {
        username : "sajjad" ,
        password : "123"
    };
    let Docs = [
        {
            username : "admin" ,
            password : "1234"

        } , {
            username : "sajad" ,
            password : "12345"
        }
    ];
    const users = MDBSelect( MDBSession , "Panel" , "users" );
    
    // let MongoInsertResult = await users.insertOne( Doc );
    // console.log( MongoInsertResult.insertedId );
    
    // let MongoInserManytResult = await users.insertMany( Docs );
    // console.log( MongoInserManytResult.insertedIds );
    
    // const MongoFoundObj = await users.findOne( { username : "xyz" } );
    // console.log( MongoFoundObj ); //null

    // let MongoSearchResult = await MongoCollectionObj.find( {} ).toArray();
    // let MongoSearchResult = await MongoCollectionObj.find( { password : "123" } , { projection: { _id: 0, username: 1 } } ).toArray(); // username field ONLY
    // let MongoSearchResult = await MongoCollectionObj.find( { password : "123" } , { projection: { password : 0 } ).toArray(); // all fields except password field
    // let MongoSearchResult = await MongoCollectionObj.find().sort( { username : 1 } ).toArray();  // sort based on username field ( also { username : -1 } )
    // let MongoSearchResult = await MongoCollectionObj.find().limit(5).toArray();

    // like insert :
    // MongoCollectionObj.deleteOne();
    // MongoCollectionObj.deleteMany();

    // let c = await MongoCollectionObj.drop(); [ true / false ]

    // let z = await MongoCollectionObj.updateOne( { username : "admin" } , { $set: { password : "123" } } );
    // .updateMany
    // .replaceOne --> a new defined doc is replaced 

    // { status: { $in: ['OK', 'InProgress'] } } // or $nin
    // { status: { $ne: 'Failed' } }
    // { status: 'InProgress' , age : { $lt : 22 } } // Logical AND , <
    // { $or: [ { status: 'Failed' } , { age : { $gt : 22 } } ] } // Logical OR , >
    MDBClose( MDBSession );
}

X();

