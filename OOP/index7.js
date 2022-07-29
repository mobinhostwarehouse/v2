const { createHash } = require('crypto');
const AccountingSecret = "drama";
let MonthlyPricing = { host : 2.5 , vps : 5 };

class Session {
    constructor( UserName , TimeStamp , ID ) {
        this.username = UserName ;
        if( ( TimeStamp && ID ) == undefined ) {
            this.timeStamp = this.generateTimeStampString ( this.now() );
            this.id = this.sha256( this.timeStamp + AccountingSecret + this.username );
        } else {
            this.timeStamp = TimeStamp ;
            this.id = ID ;
        }
    }
    now() {
        let DateObj = new Date();
        let TimeStampObj = {} ;
        TimeStampObj[ "hour" ] = DateObj.getUTCHours();
        TimeStampObj[ "min" ] = DateObj.getUTCMinutes();
        TimeStampObj[ "sec" ] = DateObj.getUTCSeconds();
        TimeStampObj[ "msec" ] = DateObj.getUTCMilliseconds();
        return TimeStampObj
    }
    sha256( InputData ) {
        return createHash('sha256').update( InputData ).digest('base64')
    }
    generateTimeStampString( TimeStampObj ) {
        let TimeStampString = "";
        let SixtyUnitsMax = [ "hour" , "min" , "sec" ];
        for( let i = 0 ; i < 3 ; i++ ) {
            let UnitNumber = TimeStampObj[ SixtyUnitsMax[i] ];
            if( UnitNumber < 10 ) {
                TimeStampString += UnitNumber.toString().padStart( 2 , 0 ); 
            } else {
                TimeStampString += UnitNumber.toString();
            }
        }
        let msec = TimeStampObj.msec ;
        if( msec > 99 ) {
            TimeStampString += msec.toString();
        } else if( msec > 9 ) {
            TimeStampString += msec.toString().padStart( 2 , 0 );
        } else {
            TimeStampString += msec.toString().padStart( 3 , 0 );
        }
        return TimeStampString
    }
    generateTimeStampObject( TimeStampString ) {
        let TimeStampObj = {};
        TimeStampObj[ "hour" ] = parseInt( TimeStampString.slice( 0 , 2 ) );
        TimeStampObj[ "min" ] = parseInt( TimeStampString.slice( 2 , 4 ) );
        TimeStampObj[ "sec" ] = parseInt( TimeStampString.slice( 4 , 6 ) );
        TimeStampObj[ "msec" ] = parseInt( TimeStampString.slice( 6 ) );
        return TimeStampObj
    }
    isValid() {
        let valid = false ;
        let IDString = this.timeStamp + AccountingSecret + this.username ;
        if( this.sha256( IDString ) == this.id ) {
            valid = true ;
        }
        return valid
    }
    isExpired() {
        let ExpTime = this.generateTimeStampObject( this.timeStamp );
        if( ExpTime.min < 55 ) {
            ExpTime.min = ExpTime.min + 5 ;
        } else {
            ExpTime.min = 60 - ExpTime.min ;
            ExpTime.hour = ExpTime.hour + 1 ;
        }
        let ComparisonOrder = [ "hour" , "min" , "sec" , "msec" ];
        let Expired = true ;
        let Now = this.now();
        for( let i = 0 ; i < 4 ; i++ ) {
            if( Now[ ComparisonOrder[i] ] > ExpTime[ ComparisonOrder[i] ] ) {
                break ;
            } else {
                if( Now[ ComparisonOrder[i] ] < ExpTime[ ComparisonOrder[i] ] ) {
                    Expired = false ;
                }
            }
        }
        return Expired
    }
}

class Product {
    constructor() {
        this.price = 0 ;
        this.days = 0 ;
        this.purchaseDate = {} ;
        this.expiryDate = {} ;
    }
    now() {
        let DateObj = new Date();
        let TimeStampObj = {} ;
        TimeStampObj[ "year" ] = DateObj.getUTCFullYear();
        TimeStampObj[ "month" ] = DateObj.getUTCMonth() + 1 ;
        TimeStampObj[ "day" ] = DateObj.getUTCDate();
        TimeStampObj[ "hour" ] = DateObj.getUTCHours();
        TimeStampObj[ "min" ] = DateObj.getUTCMinutes();
        return TimeStampObj
    }
    isLeapYear( Year ) {
        let LeapYear = false ;
        if( Year % 4  == 0 ) {
            LeapYear = true ;
        }
        return LeapYear
    }
    getMonthDays( Month , Year ) {
        let MonthDays = 31 ; 
        let DifferentDayMonths = [ 2 , 4 , 6 , 9 , 11 ];
        let DifferentDayMonthsDays = [ 28 , 30 , 30 , 30 , 30 ];
        if( this.isLeapYear( Year ) ) {
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
    purchased() {
        this.purchaseDate = this.now();
        this.expiryDate = {} ;
        this.expiryDate[ "year" ] = this.purchaseDate[ "year" ];
        this.expiryDate[ "month" ] = this.purchaseDate[ "month" ];
        this.expiryDate[ "day" ] = this.purchaseDate[ "day" ];
        this.expiryDate[ "hour" ] = this.purchaseDate[ "hour" ];
        this.expiryDate[ "min" ] = this.purchaseDate[ "min" ];
        let FirstMonthDays = this.getMonthDays( this.expiryDate.month , this.expiryDate.year ) - this.expiryDate.day ;
        if( this.days < FirstMonthDays ) {
            this.expiryDate.day = this.expiryDate.day + this.days ;
        } else {
            let SubscriptionRemainingDays = this.days - FirstMonthDays ;
            let SumNextMonthsDays = 0 ;
            for( let i = this.expiryDate.month + 1 ; SubscriptionRemainingDays > SumNextMonthsDays ; i++ ) {
                let NextMonthDays = this.getMonthDays( i , this.expiryDate.year );
                SumNextMonthsDays = SumNextMonthsDays + NextMonthDays ;
                if( SubscriptionRemainingDays < SumNextMonthsDays ) {
                    this.expiryDate.month = i ;
                    this.expiryDate.day = NextMonthDays - ( SumNextMonthsDays - SubscriptionRemainingDays );
                    break ;
                }
                if( i == 12 ) {
                    this.expiryDate.year = this.expiryDate.year + 1 ;
                    i = 0 ;
                }
            }
        }
    }
    isExpired() {
        let ComparisonOrder = [ "year" , "month" , "day" , "hour" , "min" ];
        let Now = this.now();
        let Expired = true ;
        for( let i = 0 ; i < 5 ; i++ ) {
            if( Now[ ComparisonOrder[i] ] > this.expiryDate[ ComparisonOrder[i] ] ) {
                break ;
            } else {
                if( Now[ ComparisonOrder[i] ] < this.expiryDate[ ComparisonOrder[i] ] ) {
                    Expired = false ;
                }
            }
        }
        return Expired
    }
}

class VPS extends Product {
    constructor( Days , RAM , vCPU , SSD , OS , OSv , Country , price , purchaseDate , expiryDate ) {
        super( price , purchaseDate , expiryDate );
        this.type = "vps" ;
        this.days = Days ;
        this.ram = RAM ;
        this.vcpu = vCPU ;
        this.ssd = SSD ;
        this.os = OS ;
        this.osv = OSv ;
        this.country = Country ;
        this.ip = "" ;
        this.password = "" ;    
    }
    ordered() {
        let DurationMultiplier = this.days / 30 ;
        let ConfigMultiplier = Math.cbrt( ( this.ram / 1024 ) * ( this.vcpu / 1 ) * ( this.ssd / 25 ) );
        let CountryMultiplier = 1 ;
        if( this.country == "IR" ) {
            CountryMultiplier = 3/4 ;
        }
        let Multiplier = DurationMultiplier * ConfigMultiplier * CountryMultiplier ;
        this.price = MonthlyPricing[ this.type ] * Multiplier ; 
    }
}

class Host extends Product {
    constructor( Days , Env , SSD , ControlPanel , WebServer , Country , price , purchaseDate , expiryDate ) {
        super( price , purchaseDate , expiryDate );
        this.type = "host" ;
        this.env = Env ;
        this.days = Days ;
        this.ssd = SSD ;
        this.cp = ControlPanel ;
        this.webserver = WebServer ;
        this.country = Country ;
        this.ip = "" ;
        this.password = "" ;
    }
    ordered() {
        let DurationMultiplier = this.days / 30 ;
        let ConfigMultiplier = this.ssd / 500 ;
        let CPMultiplier = 1 ;
        if( this.cp == "CPanel" ) {
            CPMultiplier = 2 ;
        }
        let CountryMultiplier = 1 ;
        if( this.country == "IR" ) {
            CountryMultiplier = 3/4 ;
        }
        let Multiplier = DurationMultiplier * ConfigMultiplier * CPMultiplier * CountryMultiplier ;
        this.price = MonthlyPricing[ this.type ] * Multiplier ; 
    }
}

class User {
    constructor( Email , UserName , Password ) {
        this.email = Email ;
        this.username = UserName ;
        this.password = this.sha256( Password );
        this.session = {};
        this.wallet = 0 ;
        this.cart = [] ;
        this.products = [] ;
    }
    now() {
        let DateObj = new Date();
        let TimeStampObj = {} ;
        TimeStampObj[ "year" ] = DateObj.getUTCFullYear();
        TimeStampObj[ "month" ] = DateObj.getUTCMonth() + 1 ;
        TimeStampObj[ "day" ] = DateObj.getUTCDate();
        TimeStampObj[ "hour" ] = DateObj.getUTCHours();
        return TimeStampObj
    }
    generateTimeStampString( TimeStampObj ) {
        let TimeStampString = TimeStampObj.year.toString();
        let Units = [ "month" , "day" , "hour" ];
        for( let i = 0 ; i < 3 ; i++ ) {
            let UnitNumberString = TimeStampObj[ Units[i] ].toString();
            if( UnitNumberString.length < 2 ) {
                TimeStampString += UnitNumberString.padStart( 2 , 0 );
            } else {
                TimeStampString += UnitNumberString ;
            }
        }
        return TimeStampString
    }
    sha256( InputData , Encoding ) {
        if( Encoding == undefined ) {
            Encoding = "base64" ;
        } else if( Encoding == "url" ) {
            Encoding = "base64url" ;
        }
        return createHash('sha256').update( InputData ).digest( Encoding )
    }
    verifyPassword( InputPassword ) {
        let verify = false ;
        if( this.password == this.sha256( InputPassword ) ) {
            this.session = new Session( this.username );
            verify = true ;
        }
        return verify
    }
    generateEmailVerifyCode() {
        let HourScopedTimeStampString = this.generateTimeStampString( this.now() );
        return this.sha256( HourScopedTimeStampString + AccountingSecret + this.username , "url" ) 
    }
    isCodeValid( EmailVerifyCode ) {
        let valid = false ;
        if( EmailVerifyCode == this.generateEmailVerifyCode() ) {
            valid = true ;
        }
        return valid
    }
}



