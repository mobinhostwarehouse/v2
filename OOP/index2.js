const http = require("http");

const server = http.createServer( 
    function( req , res ) {
        let ReqData = [];
        req.setEncoding( 'utf8' );
        req.on( 'data' , ReqDataChunk => {
            ReqData.push( ReqDataChunk );
        });
        req.on( 'end' , () => {
            let Response = "";
            ReqData = ReqData.toString();
            let JsonReqData = JSON.parse( ReqData );
            switch ( JsonReqData.OP ) {
                case "AuthReq" :
                    let AuthResponse = {
                        "OP" : "AuthRes" ,
                        "Result" : ""
                    };
                    if ( JsonReqData.username == "sajjad" && JsonReqData.password == "drama" ) {
                        AuthResponse.Result = "OK !" ;
                    }
                    Response = JSON.stringify( AuthResponse );
            }
            res.setHeader( "Access-Control-Allow-origin" , "*" );
            res.write( Response );
            res.end();
        });
    }
);

server.listen( 8000 );

