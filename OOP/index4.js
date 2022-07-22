const { MongoClient } = require("mongodb");

async function MDBConnect() {
    const MongoURL = "mongodb://127.0.0.1:27017/?compressors=zstd";
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
            username : "arch" ,
            password : "1234"

        } , {
            username : "tooor" ,
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

    // const f = await users.find( { username : "sajjad" } ); ????
    // console.log( f );
    MDBClose( MDBSession );
}

X();

