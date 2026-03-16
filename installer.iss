[Setup]
AppName=Secure Apportionment System
AppVersion=0.1.0
DefaultDirName={pf}\ApportionmentSys
DefaultGroupName=Apportionment System
OutputBaseFilename=ApportionmentSys-Setup
SetupIconFile=icon.ico

[Files]
Source: "dist\ApportionmentSys.exe"; DestDir: "{app}"

[Icons]
Name: "{group}\Apportionment System"; Filename: "{app}\ApportionmentSys.exe"
Name: "{commondesktop}\Apportionment System"; Filename: "{app}\ApportionmentSys.exe"
