const { randomBytes } = require('crypto');
const { createHash } = require('crypto');
const http = require("http");

function GetReqParse( GetReqQuery ) {
    GetReqQuery = GetReqQuery.slice( 1 , -1 );
    let LastPathDelimiter = 0 ;
    let GetReqPath = [];
    let GetReqBase64Str = "";
    for ( let i = 0 ; i < GetReqQuery.length ; i++ ) {
        if( GetReqQuery[i] == "/" ) {
            let GetReqPathDir = "" ;
            if( LastPathDelimiter == 0 ) {
                GetReqPathDir = GetReqQuery.slice( 0 , i );
            } else {
                GetReqPathDir = GetReqQuery.slice( LastPathDelimiter + 1 , i );
            }
            GetReqPath.push( GetReqPathDir );
            LastPathDelimiter = i ;
        } else {
            if( i == GetReqQuery.length - 1 ) {
                if( LastPathDelimiter == 0 ) {
                    GetReqBase64Str = GetReqQuery ;
                } else {
                    GetReqBase64Str = GetReqQuery.slice( LastPathDelimiter + 1 , GetReqQuery.length );
                }
            }
        }
    }
    let ReqObj = {
        Path : GetReqPath ,
        Base64Str : GetReqBase64Str
    };
    return ReqObj
}

function TokenGenerator() {
    const RandomToken = randomBytes(12);
    let RandomTokenBase64 = RandomToken.toString('base64url');
    return RandomTokenBase64
}

function PasswordHash( Password ) {
    const Sha256sum = createHash('sha256');
    Sha256sum.update( Password );
    return Sha256sum.digest('base64');
}

function GenerateTimeStamp() {
    let DateObj = new Date();
    let TimeStamp = {} ;
    TimeStamp[ "year" ] = DateObj.getUTCFullYear();
    TimeStamp[ "month" ] = DateObj.getUTCMonth() + 1 ;
    TimeStamp[ "day" ] = DateObj.getUTCDate();
    TimeStamp[ "hour" ] = DateObj.getUTCHours();
    TimeStamp[ "min" ] = DateObj.getUTCMinutes();
    return TimeStamp
}

function GenerateSubscription( SubscriptionUnit , SubscriptionUnitNumber ) {
    let SubscriptionDays = 0 ;
    switch( SubscriptionUnit ) {
        case "day" :
            SubscriptionDays = SubscriptionUnitNumber ;
            break ;
        case "month" :
            SubscriptionDays = SubscriptionUnitNumber * 30 ;
            break ;
        case "year" :
            SubscriptionDays = SubscriptionUnitNumber * 360 ;
            break ;
    }
    return SubscriptionDays
}

function IsLeapYear( Year ) {
    let LeapYear = false ;
    if( Year % 4  == 0 ) {
        LeapYear = true ;
    }
    return LeapYear
}

function GetMonthDays( Month , Year ) {

    let MonthDays = 31 ; 
    let DifferentDayMonths = [ 2 , 4 , 6 , 9 , 11 ];
    let DifferentDayMonthsDays = [ 28 , 30 , 30 , 30 , 30 ];
    if( IsLeapYear( Year ) ) {
        DifferentDayMonthsDays[0] = 29 ;
    }
    if( DifferentDayMonths.includes( Month ) ) {
        for( let k = 0 ; k < 5 ; k++ ) {
            if( Month ==  DifferentDayMonths[k] ) {
                MonthDays = DifferentDayMonthsDays[k];
            }
        }
    }
    return MonthDays
}

function CalculateExpDate( PurchaseDate , SubscriptionDays ) {
    let ExpTimeStamp = PurchaseDate ;
    let FirstMonthDays = GetMonthDays( ExpTimeStamp.month , ExpTimeStamp.year ) - ExpTimeStamp.day ;
    if( SubscriptionDays < FirstMonthDays ) {
        ExpTimeStamp.day = ExpTimeStamp.day + SubscriptionDays ;
    } else {
        let SubscriptionRemainingDays = SubscriptionDays - FirstMonthDays ;
        let SumNextMonthsDays = 0 ;
        for( let i = ExpTimeStamp.month + 1 ; SubscriptionRemainingDays > SumNextMonthsDays ; i++ ) {
            let NextMonthDays = GetMonthDays( i , ExpTimeStamp.year );
            SumNextMonthsDays = SumNextMonthsDays + NextMonthDays ;
            if( SubscriptionRemainingDays < SumNextMonthsDays ) {
                ExpTimeStamp.month = i ;
                ExpTimeStamp.day = NextMonthDays - ( SumNextMonthsDays - SubscriptionRemainingDays );
                break ;
            }
            if( i == 12 ) {
                ExpTimeStamp.year = ExpTimeStamp.year + 1 ;
                i = 0 ;
            }
        }
    }
    return ExpTimeStamp
}

function IsServiceExpired( ExpTimeStamp ) {

    let ComparisonOrder = [ "year" , "month" , "day" , "hour" , "min" ];
    let Now = GenerateTimeStamp();
    let Expired = true ;
    for( let i = 0 ; i < 5 ; i++ ) {
        if( Now[ ComparisonOrder[i] ] > ExpTimeStamp[ ComparisonOrder[i] ] ) {
            break ;
        } else {
            if( Now[ ComparisonOrder[i] ] < ExpTimeStamp[ ComparisonOrder[i] ] ) {
                Expired = false ;
            }
        }
    }
    return Expired
}

function GetClientIPv4( req ) {
    let IP = req.socket.remoteAddress ;
    let LastColonIndex = 0 ;
    for( let i = 0 ; i < IP.length ; i++ ) {
        if( IP[i] == ":" ) {
            LastColonIndex = i ;
        }
    }
    let IPv4 = IP.slice( LastColonIndex + 1 , );
    return IPv4
}

const server = http.createServer( 
    function( req , res ) {
        if( req.method == "GET" ) {
            res.setHeader( "Access-Control-Allow-origin" , "*" );
            res.write( "OK" );
            res.end();
        }
    }
);

server.listen( 8000 );
