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
    let SubscriptionObj = {} ;
    SubscriptionObj[ SubscriptionUnit ] = SubscriptionUnitNumber ;
    return SubscriptionObj
}

function HoursCheck( ExpTimeStamp ) {
    if( ExpTimeStamp.hour > 24 ) {
        ExpTimeStamp.hour = ExpTimeStamp.hour - 24 ;
        ExpTimeStamp.day = ExpTimeStamp.day + 1 ;
    }
}

function IsLeapYear( YearIndex ) {
    let LeapYear = false ;
    if( YearIndex % 4  == 0 ) {
        LeapYear = true ;
    }
    return LeapYear
}

function MonthIndexDays( MonthIndex , YearIndex ) {

    let MonthDays = 31 ; 
    let DifferentDayMonths = [ 2 , 4 , 6 , 9 , 11 ];
    let DifferentDayMonthsDays = [ 28 , 30 , 30 , 30 , 30 ];

    if( IsLeapYear( YearIndex ) ) {
        DifferentDayMonthsDays[0] = 29 ;
    }

    if( DifferentDayMonths.includes( MonthIndex ) ) {
        for( let i = 0 ; i < 5 ; i++ ) {
            if( MonthIndex ==  DifferentDayMonths[i] ) {
                MonthDays = DifferentDayMonthsDays[i];
            }
        }
    }

    return MonthDays
}

function DaysCheck( ExpTimeStamp ) {

    let ThisMonthDays = MonthIndexDays( ExpTimeStamp.month , ExpTimeStamp.year );
    let NextMonthIndex = ExpTimeStamp.month + 1 ;
    let NextMonthDays = MonthIndexDays( NextMonthIndex , ExpTimeStamp.year );

    if( ExpTimeStamp.day > ThisMonthDays ) {
        if( ( ExpTimeStamp.day - ThisMonthDays ) < NextMonthDays ) {
            ExpTimeStamp.day = ExpTimeStamp.day - ThisMonthDays ;
            ExpTimeStamp.month = ExpTimeStamp.month + 1 ;
        } else {
            ExpTimeStamp.day = ( ExpTimeStamp.day - ThisMonthDays ) - NextMonthDays ;
            ExpTimeStamp.month = ExpTimeStamp.month + 2 ;
        }
    }
}

function MonthsCheck( ExpTimeStamp ) {

    if( ExpTimeStamp.month > 12 ) {
        ExpTimeStamp.month =  ExpTimeStamp.month - 12 ;
        ExpTimeStamp.year = ExpTimeStamp.year + 1 ;
    }

}

function YearsCheck( ExpTimeStamp ) {
    if( ExpTimeStamp.day == 29 && ExpTimeStamp.month == 2 && IsLeapYear( ExpTimeStamp.year ) == false ) {
        ExpTimeStamp.day = 1 ;
        ExpTimeStamp.month = 3 ;
    }
}

function CalculateExpDate( TimeStamp , SubscriptionObj ) {
    let ExpTimeStamp = TimeStamp ;
    let SubscriptionUnit = Object.keys( SubscriptionObj )[0] ;
    let SubscriptionUnitNumber = SubscriptionObj[ SubscriptionUnit ] ;

    let CalculationUnits = [ "hour" , "day" , "month" , "year" ];
    let TargetCalculationIndex = 0 ;
    for( let i = 0 ; i < 4 ; i++ ) {
        if( SubscriptionUnit ==  CalculationUnits[i] ) {
            TargetCalculationIndex = i ;
        }
    }
    let TargetCalculationUnits = CalculationUnits.slice( TargetCalculationIndex , );

    ExpTimeStamp[ SubscriptionUnit ] = ExpTimeStamp[ SubscriptionUnit ] + SubscriptionUnitNumber ;

    for( let i = 0 ; i < TargetCalculationUnits.length ; i++ ) {

        let unit = TargetCalculationUnits[i] ;
        switch( unit ) {
            case "hour" :
                HoursCheck( ExpTimeStamp );
            case "day" :
                DaysCheck( ExpTimeStamp );
            case "month" :
                MonthsCheck( ExpTimeStamp );
            case "year" :
                YearsCheck( ExpTimeStamp );
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
