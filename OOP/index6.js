class User {
    constructor( email , username , password ) {
        this.email = email ;
        this.username = username ;
        this.password = password ;
        this.wallet = 0 ;
        this.cart = [] ;
        this.products = [] ;
    }
    resetPassword( Token , NewPassword ){
        console.log("Password Changed!");
    }
    deleteAccount(){
        console.log("Account Deleted!");
    }
    addToCart( Product ){
        console.log("Product Added!");
    }
    walletTopUp( Amount ){
        console.log("Wallet Charged!");
    }
    productPurchase( CartIndex ){
        console.log("Product Purchased!")
    }
}

// let UserObj = new User( "sajjad@gmail.com" , "sajjad" , "123" );
// console.log( UserObj.username );
// UserObj.resetPassword();

class Product {
    constructor() {
        this.price = 0 ;
        this.type = "" ;
        this.subscriptionDays = 0 ;
        this.purchaseDate = {} ;
        this.expiryDate = {} ;
    }
    now() {
        let DateObj = new Date();
        let TimeStamp = {} ;
        TimeStamp[ "year" ] = DateObj.getUTCFullYear();
        TimeStamp[ "month" ] = DateObj.getUTCMonth() + 1 ;
        TimeStamp[ "day" ] = DateObj.getUTCDate();
        TimeStamp[ "hour" ] = DateObj.getUTCHours();
        TimeStamp[ "min" ] = DateObj.getUTCMinutes();
        return TimeStamp
    }
    applyPurchaseDate(){
        this.purchaseDate = this.now();
    }
    generateSubscription( SubscriptionUnit , SubscriptionUnitNumber ) {
        if( SubscriptionUnit == "day" ){
            this.subscriptionDays = SubscriptionUnitNumber ;
        }
        if( SubscriptionUnit == "month" ){
            this.subscriptionDays = SubscriptionUnitNumber * 30 ;
        }
        if( SubscriptionUnit == "year" ){
            this.subscriptionDays = SubscriptionUnitNumber * 360 ;
        }
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
    calculateExpDate() {
        this.expiryDate = this.purchaseDate ;
        let FirstMonthDays = this.getMonthDays( this.expiryDate.month , this.expiryDate.year ) - this.expiryDate.day ;
        if( this.subscriptionDays < FirstMonthDays ) {
            this.expiryDate.day = this.expiryDate.day + this.subscriptionDays ;
        } else {
            let SubscriptionRemainingDays = this.subscriptionDays - FirstMonthDays ;
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

let ProductObj = new Product();
ProductObj.applyPurchaseDate();
console.log( ProductObj.purchaseDate );
ProductObj.generateSubscription( "month" , 7 );
ProductObj.calculateExpDate();
console.log( ProductObj.expiryDate );
console.log( ProductObj.isExpired() );