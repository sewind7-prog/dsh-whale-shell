param([string]$OutputDirectory = (Join-Path $PSScriptRoot 'build\bin-1.0.3'),[string]$PayloadDirectory = (Join-Path $PSScriptRoot 'build\payload-1.0.3'))
$ErrorActionPreference='Stop'
if((Test-Path -LiteralPath $OutputDirectory) -and (Get-ChildItem -LiteralPath $OutputDirectory -Force | Select-Object -First 1)){throw '输出目录已有文件；请选择新目录以保留已有构建。'}
$payload=[IO.Path]::GetFullPath($PayloadDirectory)
& node (Join-Path $PSScriptRoot 'sync-engine.cjs') $payload
if($LASTEXITCODE -ne 0){throw '资源同步失败'}
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$version=(Get-Content -LiteralPath (Join-Path $payload 'manifest.json') -Raw | ConvertFrom-Json).version
$template=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'src\Setup.cs') -Raw
if($template -notmatch ('Version="'+[regex]::Escape($version)+'"')){throw '安装器与资源版本不一致'}
$compiler=Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$zip=Join-Path $OutputDirectory 'payload-resource.zip'
[System.IO.Compression.ZipFile]::CreateFromDirectory($payload,$zip,[System.IO.Compression.CompressionLevel]::Optimal,$false)
$hash=(Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
$source=$template.Replace('__PAYLOAD_SHA256__',$hash)
$generated=Join-Path $OutputDirectory 'Setup.generated.cs'
[IO.File]::WriteAllText($generated,$source,[Text.UTF8Encoding]::new($false))
$catalog=Join-Path $OutputDirectory 'supported-shells.json'
& node -e 'process.stdout.write(JSON.stringify(require(process.argv[1]),null,2))' (Join-Path $PSScriptRoot 'src\supported-shells.cjs') | Set-Content -LiteralPath $catalog -Encoding utf8
if($LASTEXITCODE -ne 0){throw '版本白名单生成失败'}
$icon=Join-Path $OutputDirectory ('whale-'+$version+'.ico')
$iconBuilder=Join-Path $OutputDirectory 'BuildIcon.exe'
if(Test-Path -LiteralPath $iconBuilder){throw '图标构建程序已存在；请选择新输出目录'}
& $compiler /nologo /target:exe /platform:x64 /optimize+ "/out:$iconBuilder" /reference:System.Drawing.dll /reference:System.Web.Extensions.dll (Join-Path $PSScriptRoot 'src\BuildIcon.cs')
if($LASTEXITCODE -ne 0){throw '图标转换程序编译失败'}
& $iconBuilder (Join-Path $payload 'art\whale.png') $icon (Join-Path $OutputDirectory 'icon-manifest.json')
if($LASTEXITCODE -ne 0){throw '鲸鱼图标生成失败'}
$exe=Join-Path $OutputDirectory ('DSH鲸鱼外壳一键安装器-'+$version+'.exe')
if(Test-Path -LiteralPath $exe){throw '目标安装器已存在；请选择新的版本输出目录，保留前一构建。'}
& $compiler /nologo /target:winexe /platform:x64 /optimize+ "/out:$exe" "/win32icon:$icon" "/resource:$icon,WhaleIcon" "/resource:$catalog,SupportedShells" "/resource:$zip,WhalePayload" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Web.Extensions.dll /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll $generated
if($LASTEXITCODE -ne 0){throw '安装器编译失败'}
[pscustomobject]@{Exe=$exe;Version=$version;Bytes=(Get-Item -LiteralPath $exe).Length;Sha256=(Get-FileHash -LiteralPath $exe).Hash;PayloadSha256=$hash;IconSha256=(Get-FileHash -LiteralPath $icon).Hash;SuccessCloseDelayMs=2000} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $OutputDirectory 'build-manifest.json') -Encoding utf8
Get-Content -LiteralPath (Join-Path $OutputDirectory 'build-manifest.json') -Raw
