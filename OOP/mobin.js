let ServerChassises = [] ;
let SSDs = [] ;

let WareHouseDataBase = {
    ServerChassises : ServerChassises ,
    SSDs : SSDs
};

class WarehouseEquipment {
    constructor( SerialNumber , Model , QC , Note ) {
        this.SerialNumber = SerialNumber ;
        this.Model = Model ;
        this.QC = QC ;
        this.Note = Note ;
    }
}

class ServerChassis extends WarehouseEquipment {
    constructor( SerialNumber , Model , QC , Note , Type , Gen , Ext ) {
        super( SerialNumber , Model , QC , Note ) ;
        this.Type = Type ;
        this.Gen = Gen ;
        this.Ext = Ext ;

        switch( Model ) {
            case "360" :
                this.CPU_Slots = "2" ;
                this.RAM_Slots = "12" ;
                this.RAM_DDR = "3" ;
                this.BIOS = "Legacy" ;
                this.Rack_Units = "1" ;
                break ;
        }
    }
}

let NewServer = new ServerChassis( "123" , "360" , "OK" , "Has 2 Cages" , "DL" , "8" , "P" ) ;
WareHouseDataBase.ServerChassises.push( NewServer );

class SSD extends WarehouseEquipment {
    constructor( SerialNumber , Model , QC , Note , Brand , Series ) {
        super( SerialNumber , Model , QC , Note ) ;
        this.Brand = Brand ;
        this.Series = Series ;
    }
}

let NewSSD = new SSD( "456" , "870" , "Defective" , "Frame is broken!" , "Samsung" , "EVO" ) ;
WareHouseDataBase.SSDs.push( NewSSD );

let ES = JSON.stringify( WareHouseDataBase );
let ESD = JSON.parse( ES ) ;
console.log( ESD.SSDs[0].Brand ) ;

