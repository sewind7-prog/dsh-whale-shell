param([Parameter(Mandatory=$true)][string]$SetupPath,[Parameter(Mandatory=$true)][string]$ExpectedSha256,[Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference='Stop'
$setup=[IO.Path]::GetFullPath($SetupPath)
if((Get-FileHash -LiteralPath $setup -Algorithm SHA256).Hash -ne $ExpectedSha256){throw '安装器散列不匹配，未加载资源。'}
$output=[IO.Path]::GetFullPath($OutputDirectory)
if(Test-Path -LiteralPath $output){throw '输出目录已存在，请使用新目录。'}
Add-Type -AssemblyName System.IO.Compression
$assembly=[Reflection.Assembly]::LoadFile($setup)
$program=$assembly.GetType('Program',$true)
$flags=[Reflection.BindingFlags]'Static,NonPublic,Public'
$expected=$program.GetField('PayloadHash',$flags).GetRawConstantValue()
$stream=$assembly.GetManifestResourceStream('WhalePayload')
if($null -eq $stream){throw 'WhalePayload资源缺失。'}
try {
 $sha=[Security.Cryptography.SHA256]::Create()
 try{$actual=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
 if($actual -ne $expected){throw '内嵌资源散列不匹配。'}
 $stream.Position=0
 [IO.Directory]::CreateDirectory($output) | Out-Null
 $prefix=$output+[IO.Path]::DirectorySeparatorChar
 $archive=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read,$true)
 try{foreach($entry in $archive.Entries){$target=[IO.Path]::GetFullPath([IO.Path]::Combine($output,$entry.FullName));if(-not $target.StartsWith($prefix,[StringComparison]::OrdinalIgnoreCase)){throw '资源路径不安全。'};if([string]::IsNullOrEmpty($entry.Name)){[IO.Directory]::CreateDirectory($target)|Out-Null;continue};[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target))|Out-Null;$inputStream=$entry.Open();try{$outputStream=[IO.File]::Create($target);try{$inputStream.CopyTo($outputStream)}finally{$outputStream.Dispose()}}finally{$inputStream.Dispose()}}}finally{$archive.Dispose()}
}finally{$stream.Dispose()}
[pscustomobject]@{status='PASS';payload=$output;embeddedZipSha256=$actual;installerMainCalled=$false;formConstructed=$false}|ConvertTo-Json
