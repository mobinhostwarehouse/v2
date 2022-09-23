import json
import subprocess

print()
print( "Welcome to WireGuard Installer" )
print()

def Run( Command ) :
    CmdArg = Command.split(" ")
    stdout = subprocess.run( CmdArg , capture_output=True , text=True ).stdout
    return stdout

def Bash( Command ) :
    CmdArg = Command.split(" ")
    subprocess.run( CmdArg )

def Install() :
    Bash( "apt install -y -qq wireguard sudo" )
    if "Status: install ok installed" == Run( "dpkg -s wireguard | grep Status" ) :
       return True

Install()

def ListNICs() :
    UsableNICs = []
    AllNICs = json.loads( Run( "ip -j address" ) )
    for NIC in AllNICs :
        if NIC[ "link_type" ] != "loopback" :
            PhysicalNIC = { "name" : NIC[ "ifname" ] }
            for Addr in NIC[ "addr_info" ] :
                if Addr[ "scope" ] == "global" :
                    if Addr[ "family" ] == "inet" :
                        PhysicalNIC[ "IPv4" ] = Addr[ "local" ]
                    if Addr[ "family" ] == "inet6" :
                        PhysicalNIC[ "IPv6" ] = Addr[ "local" ]
            UsableNICs.append( PhysicalNIC )
    Pad = "                "
    print()
    print( "Available Network Adapters :" )
    print()
    print( "   Name   " + "      IPv4      " + "      IPv6      " )
    for UsableNIC in UsableNICs :
        TerminalRow = [ UsableNIC[ "name" ] ]
        TerminalRow.append( Pad[ : ( 10 - len( UsableNIC[ "name" ] ) ) ] )
        for ipv in [ "IPv4" , "IPv6" ] :
            if UsableNIC.get( ipv ) != None :
                TerminalRow.append( UsableNIC[ ipv ] )
                TerminalRow.append( Pad[ : ( 16 - len( UsableNIC[ ipv ] ) ) ] )
        print( "".join( TerminalRow ) )

ListNICs()

def GeneratePrivateKey() :
    PrivateKey = Run( "wg genkey" )
    return PrivateKey

def GeneratePublicKey( PrivateKey ) :
    PublicKey = subprocess.run(
        [ "wg" , "pubkey" ] ,
        capture_output = True ,
        input = PrivateKey.encode()
    ).stdout.decode().rstrip()
    return PublicKey

def CreateFile( Path , Name , Data ) :
    with open( r"{}".format( Path + Name ) , "w+" ) as FileObj :
        FileObj.writelines( Data )

def GenerateServerConfig( Port ) :
    ServerPrivateKey = GeneratePrivateKey().strip()
    ServerPublicKey = GeneratePublicKey( ServerPrivateKey ).strip()
    SrvPriKeyConfLine = "PrivateKey = " + ServerPrivateKey + "\n"
    SrvPortConfLine = "ListenPort = " + str( Port ) + "\n"
    ServerConfLines = [
        "[Interface]\n" ,
        SrvPriKeyConfLine ,
        SrvPortConfLine
    ]
    CreateFile( "/etc/wireguard/" , "wg0.conf" , ServerConfLines )

GenerateServerConfig( 55820 )

def GenerateNICConfig() :
    NICConfLines = [
        "auto wg0\n" ,
        "iface wg0 inet static\n" ,
        "address 10.0.0.1/21\n" ,
        "pre-up ip link add wg0 type wireguard\n" ,
        "pre-up wg setconf wg0 /etc/wireguard/wg0.conf\n" ,
        "post-up sysctl --write net.ipv4.ip_forward=1\n" ,
        "post-down sysctl --write net.ipv4.ip_forward=0\n" ,
        "post-down ip link del wg0\n" ,
        "iface wg0 inet6 static\n" ,
        "address fd00::0001/117\n" ,
        "post-up sysctl --write net.ipv6.conf.all.forwarding=1\n" ,
        "post-down sysctl --write net.ipv6.conf.all.forwarding=0\n"
    ]
    CreateFile( "/etc/network/interfaces.d/" , "wg0" , NICConfLines )
    Bash( "sudo ifup wg0" )

GenerateNICConfig()
