import json
import subprocess

print( "" )
print( "Welcome to WireGuard Installer" )
print( "" )

def Run( Command ) :
    CmdArg = Command.split(" ")
    stdout = subprocess.run( CmdArg , capture_output=True , text=True ).stdout
    return stdout

def Bash( Command ) :
    CmdArg = Command.split(" ")
    subprocess.run( CmdArg )

def Install() :
    Bash( "apt install -y -qq wireguard" )
    if "Status: install ok installed" == Run( "dpkg -s wireguard | grep Status" ) :
       return True
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
    print( "" )
    print( "Available Network Adapters :" )
    print( "" )
    print( "   Name   " + "      IPv4      " + "      IPv6      " )
    for UsableNIC in UsableNICs :
        TerminalRow = [ UsableNIC[ "name" ] ]
        TerminalRow.append( Pad[ : ( 10 - len( UsableNIC[ "name" ] ) ) ] )
        for ipv in [ "IPv4" , "IPv6" ] :
            if UsableNIC.get( ipv ) != None :
                TerminalRow.append( UsableNIC[ ipv ] )
                TerminalRow.append( Pad[ : ( 16 - len( UsableNIC[ ipv ] ) ) ] )
        print( "".join( TerminalRow ) )