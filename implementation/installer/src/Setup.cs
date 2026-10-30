using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Drawing;
using System.Diagnostics;
using System.ComponentModel;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Web.Script.Serialization;
using System.Windows.Forms;

internal static class Program {
 internal const string Version="1.0.2";
 internal const string PayloadHash="__PAYLOAD_SHA256__";
 internal static readonly JavaScriptSerializer Json=new JavaScriptSerializer {MaxJsonLength=16000000};
 [STAThread] public static int Main(string[] args) {
  var lockName="Local\\DSHWhaleInstaller";var fixtureIndex=Array.IndexOf(args,"--fixture-app");if(fixtureIndex>=0&&fixtureIndex+1<args.Length){using(var sha=SHA256.Create())lockName+="-fixture-"+BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(Path.GetFullPath(args[fixtureIndex+1]).ToLowerInvariant()))).Replace("-","").Substring(0,20);}
  bool created;using(var mutex=new System.Threading.Mutex(true,lockName,out created)) {
   if(!created){if(args.Contains("--command")){var index=Array.IndexOf(args,"--result");if(index>=0&&index+1<args.Length)Write(Path.GetFullPath(args[index+1]),new{ok=false,error="另一个鲸鱼外壳安装器正在处理此目录。"});return 2;}MessageBox.Show("另一个鲸鱼外壳安装器正在运行。","DSH 鲸鱼外壳");return 2;}
   try {Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);var options=new Options(args);
    if(options.Command!=null){if(!options.Fixture)throw new Exception("自动测试命令仅适用于带标记的独立测试目录。");var runner=new Installer(options,Console.WriteLine);try{var result=runner.Execute(options.Command);if(options.Result!=null)File.WriteAllText(options.Result,Json.Serialize(result),new UTF8Encoding(false));return 0;}catch(Exception e){if(options.Result!=null)File.WriteAllText(options.Result,Json.Serialize(new{ok=false,error=e.Message}),new UTF8Encoding(false));return 1;}}
    Application.Run(new MainForm(options));return 0;
   }catch(Exception e){MessageBox.Show(e.Message,"DSH 鲸鱼外壳",MessageBoxButtons.OK,MessageBoxIcon.Error);return 1;}
  }
 }
 internal static string Hash(string p){using(var stream=File.OpenRead(p))using(var hash=SHA256.Create())return BitConverter.ToString(hash.ComputeHash(stream)).Replace("-","").ToLowerInvariant();}
 internal static string Quote(string value){return "\""+value.Replace("\"","\\\"")+"\"";}
 internal static Dictionary<string,object> Read(string p){return Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(p,Encoding.UTF8));}
 internal static string Get(Dictionary<string,object>d,string key){return d.ContainsKey(key)&&d[key]!=null?Convert.ToString(d[key]):null;}
 internal static void Write(string p,object value){Directory.CreateDirectory(Path.GetDirectoryName(p));File.WriteAllText(p,Json.Serialize(value),new UTF8Encoding(false));}
 internal static Icon LoadWhaleIcon(){using(var stream=System.Reflection.Assembly.GetExecutingAssembly().GetManifestResourceStream("WhaleIcon")){if(stream==null)throw new Exception("鲸鱼图标资源缺失，请重新获取完整安装器。");using(var image=new Icon(stream))return (Icon)image.Clone();}}
}
internal sealed class Options {
 internal string AppDir,Home,Runtime,Command,Result;internal bool Fixture;
 internal Options(string[] args){
  AppDir=FindApp();Home=Environment.GetEnvironmentVariable("DSH_HOME");if(String.IsNullOrWhiteSpace(Home))Home=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),".dsh");Home=Path.GetFullPath(Home);
  for(int i=0;i<args.Length;i++){if(i+1>=args.Length)throw new Exception("安装器参数不完整。");var key=args[i];var value=args[++i];switch(key){case "--fixture-app":AppDir=Path.GetFullPath(value);Fixture=true;break;case "--fixture-home":Home=Path.GetFullPath(value);break;case "--runtime-exe":Runtime=Path.GetFullPath(value);break;case "--command":Command=value;break;case "--result":Result=Path.GetFullPath(value);break;default:throw new Exception("未知安装器参数。");}}
  if(Fixture){if(!File.Exists(Path.Combine(AppDir,"DSH-WHALE-TEST-FIXTURE"))||Runtime==null)throw new Exception("独立测试目录标记或测试运行时缺失。");var common=Directory.GetParent(AppDir).FullName+Path.DirectorySeparatorChar;if(!Home.StartsWith(common,StringComparison.OrdinalIgnoreCase))throw new Exception("测试数据目录必须与测试程序目录隔离在同一个测试根目录。");}
  else {if(args.Any(a=>a=="--fixture-home"||a=="--runtime-exe"))throw new Exception("测试参数仅适用于独立测试目录。");Runtime=AppDir==null?null:Path.Combine(AppDir,"DeepSeek Harness.exe");}
  if(Home.StartsWith("\\\\")||(AppDir!=null&&AppDir.StartsWith("\\\\")))throw new Exception("请使用本机磁盘上的安装与数据目录。");
 }
 private static string FindApp(){var candidates=new[]{Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Programs","DeepSeek Harness"),Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),"DeepSeek Harness"),Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),"DeepSeek Harness")};return candidates.FirstOrDefault(p=>File.Exists(Path.Combine(p,"resources","app.asar")));}
}
internal sealed class Installer {
 private readonly Options o;private readonly Action<string> log;private string payload,root;
 internal Installer(Options options,Action<string> logger){o=options;log=logger;root=Path.Combine(o.Home,"whale-shell-installer");}
 internal static string ExtractPayload(){
  var cache=Path.Combine(Path.GetTempPath(),"DSHWhaleInstaller",Program.Version+"-"+Program.PayloadHash.Substring(0,12));var zip=cache+".zip";
  Directory.CreateDirectory(Path.GetDirectoryName(cache));
  if(!File.Exists(zip)||Program.Hash(zip)!=Program.PayloadHash){using(var input=System.Reflection.Assembly.GetExecutingAssembly().GetManifestResourceStream("WhalePayload")){if(input==null)throw new Exception("安装资源缺失。");using(var output=File.Create(zip))input.CopyTo(output);}if(Program.Hash(zip)!=Program.PayloadHash)throw new Exception("安装包完整性校验失败。");}
  cache=cache+"-"+Guid.NewGuid().ToString("N");Directory.CreateDirectory(cache);var prefix=Path.GetFullPath(cache)+Path.DirectorySeparatorChar;
  using(var archive=ZipFile.OpenRead(zip)){foreach(var e in archive.Entries){var p=Path.GetFullPath(Path.Combine(cache,e.FullName));if(!p.StartsWith(prefix,StringComparison.OrdinalIgnoreCase))throw new Exception("安装资源路径不安全。");if(String.IsNullOrEmpty(e.Name)){Directory.CreateDirectory(p);continue;}Directory.CreateDirectory(Path.GetDirectoryName(p));using(var input=e.Open())using(var output=File.Create(p))input.CopyTo(output);}}
  return cache;
 }
 private void CheckClosed(){
  if(String.IsNullOrWhiteSpace(o.AppDir)||!File.Exists(Path.Combine(o.AppDir,"DeepSeek Harness.exe")))throw new Exception("请选择 DSH 的安装文件夹，里面应有 DeepSeek Harness.exe。");
  var exe=Path.GetFullPath(Path.Combine(o.AppDir,"DeepSeek Harness.exe"));var runtimeRoot=Path.GetFullPath(Path.Combine(o.AppDir,"resources","runtime"))+Path.DirectorySeparatorChar;
  foreach(var p in Process.GetProcessesByName("DeepSeek Harness").Concat(Process.GetProcessesByName("node"))){try{if(p.Id==Process.GetCurrentProcess().Id||p.HasExited)continue;var module=p.MainModule;var source=module==null?null:module.FileName;if(String.Equals(source,exe,StringComparison.OrdinalIgnoreCase)||source!=null&&source.StartsWith(runtimeRoot,StringComparison.OrdinalIgnoreCase))throw new Exception("请先完全退出 DSH（包括后台托盘与该安装目录的后台运行时），再点击安装或还原。安装器不会关闭窗口或停止任务。");}catch(InvalidOperationException){if(!p.HasExited)throw new Exception("无法确认 DSH 运行状态，请退出后重试。");}catch(System.ComponentModel.Win32Exception){throw new Exception("无法确认 DSH 或后台运行时是否已退出。请完全退出后重试；安装器不会强制关闭它。");}finally{p.Dispose();}}
 }
 private void CheckSpace(){var appDrive=new DriveInfo(Path.GetPathRoot(o.AppDir));var homeDrive=new DriveInfo(Path.GetPathRoot(o.Home));long need=appDrive.Name==homeDrive.Name?700L*1024*1024:256L*1024*1024;if(appDrive.AvailableFreeSpace<need||homeDrive.AvailableFreeSpace<512L*1024*1024)throw new Exception("备份与安装需要约 700 MB 可用空间，请清出空间后重试。");}
 private Dictionary<string,object> Run(string action,string receipt){
  var config=Path.Combine(root,"launcher-"+Guid.NewGuid().ToString("N")+".json");Directory.CreateDirectory(root);Program.Write(config,new{appDir=o.AppDir,dataHome=o.Home,payloadDir=payload,action=action,receipt=receipt});
  Dictionary<string,object> result=null;string error=null;var stderr=new StringBuilder();var info=new ProcessStartInfo(o.Runtime,"--expose-internals "+Program.Quote(Path.Combine(payload,"engine.cjs"))+" "+Program.Quote(config)){UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true,StandardOutputEncoding=Encoding.UTF8,StandardErrorEncoding=Encoding.UTF8};info.EnvironmentVariables["ELECTRON_RUN_AS_NODE"]="1";info.EnvironmentVariables.Remove("ELECTRON_NO_ASAR");
  try{using(var process=new Process()){process.StartInfo=info;process.OutputDataReceived+=(s,e)=>{if(e.Data==null)return;try{var item=Program.Json.Deserialize<Dictionary<string,object>>(e.Data);var type=Program.Get(item,"type");if(type=="progress")log(Program.Get(item,"message"));else if(type=="error")error=Program.Get(item,"message");else if(type=="result")result=item;}catch{}};process.ErrorDataReceived+=(s,e)=>{if(e.Data!=null&&stderr.Length<4000)stderr.AppendLine(e.Data);};process.Start();process.BeginOutputReadLine();process.BeginErrorReadLine();process.WaitForExit();if(process.ExitCode!=0)throw new Exception(error??("安装组件运行失败："+stderr.ToString()));return result;}}finally{if(File.Exists(config))File.Delete(config);}
 }
 private void Swap(Dictionary<string,object> receipt,bool rollback){
  CheckClosed();var target=Path.Combine(o.AppDir,"resources","app.asar");var before=Program.Get(receipt,"shellBefore");var after=Program.Get(receipt,"shellAfter");var current=Program.Hash(target);
  if(rollback){if(current==before)return;if(current!=after)throw new Exception("外壳在安装期间被其他操作修改，未覆盖；原备份已保留。");var backup=Program.Get(receipt,"shellBackup");if(Program.Hash(backup)!=before)throw new Exception("原外壳备份校验失败。");var staged=Path.Combine(o.AppDir,"resources",".dsh-whale-restore-"+Guid.NewGuid().ToString("N")+".asar");File.Copy(backup,staged);File.Replace(staged,target,null);if(Program.Hash(target)!=before)throw new Exception("外壳回退校验失败。");}
  else {if(current!=before)throw new Exception("外壳在安装准备后发生变化，已停止。");var staged=Program.Get(receipt,"stagedAsar");if(staged==null)return;if(Program.Hash(staged)!=after)throw new Exception("候选外壳校验失败。");File.Replace(staged,target,null);if(Program.Hash(target)!=after)throw new Exception("外壳写入校验失败。");}
 }
 private bool Committed(string receiptPath){var state=Path.Combine(root,"install-state.json");return File.Exists(state)&&Program.Get(Program.Read(state),"latest")==receiptPath;}
 private void Recover(){var pending=Path.Combine(root,"pending.json");if(!File.Exists(pending)){log("没有未完成的安装。");return;}var pointer=Program.Read(pending);var receiptPath=Program.Get(pointer,"receipt");var safeRoot=Path.GetFullPath(Path.Combine(root,"backups"))+Path.DirectorySeparatorChar;if(!Path.GetFullPath(receiptPath).StartsWith(safeRoot,StringComparison.OrdinalIgnoreCase))throw new Exception("恢复记录路径无效。");var receipt=Program.Read(receiptPath);if(Program.Get(receipt,"appDir")!=o.AppDir||Program.Get(receipt,"dataHome")!=o.Home)throw new Exception("恢复记录与当前目录不符。");if(Committed(receiptPath)){CheckClosed();Run("finalize",receiptPath);log("上次文件写入已完成，现已补齐完成记录。");return;}log("正在恢复上次未完成的安装……");Run("rollback",receiptPath);Swap(receipt,true);Run("clear-pending",null);log("已恢复到上次安装前状态。");}
 internal object Execute(string command){
  if(command!="install"&&command!="restore"&&command!="recover")throw new Exception("未知安装操作。");CheckClosed();CheckSpace();payload=ExtractPayload();log("数据目录："+o.Home);if(command=="recover"){Recover();return new{ok=true,action=command};}
  if(File.Exists(Path.Combine(root,"pending.json")))Recover();
  log(command=="restore"?"正在准备还原安装前外壳……":"正在检查资源、现有插件与头像库……");var receipt=Run(command=="restore"?"prepare-restore":"prepare",null);if(receipt==null)throw new Exception("安装组件未返回准备结果。");var receiptPath=Program.Get(receipt,"receipt");
  try{Swap(receipt,false);CheckClosed();Run("apply",receiptPath);CheckClosed();Run("finalize",receiptPath);}catch(Exception original){if(Committed(receiptPath)){try{CheckClosed();Run("finalize",receiptPath);}catch(Exception completion){throw new Exception("文件写入已完成，但完成记录未补齐："+completion.Message+"\r\n请再次运行本安装器，使用“修复未完成安装”。");}}else{try{CheckClosed();Run("rollback",receiptPath);Swap(receipt,true);Run("clear-pending",null);}catch(Exception recovery){throw new Exception(original.Message+"\r\n自动回退未完成："+recovery.Message+"\r\n请再次运行本安装器，使用“修复未完成安装”。");}throw new Exception(original.Message+"\r\n已回退本次修改，原文件和备份均保留。");}}
  if(command=="restore")log("还原完成。DS Bot、头像和聊天数据保留。请重新启动 DSH。");else log("安装完成：鲸鱼外壳 + DS Bot 0.2.4 + 默认头像库。请重新启动 DSH。");
  return new{ok=true,action=command,avatarsAdded=Program.Get(receipt,"avatarsAdded"),avatarTotal=Program.Get(receipt,"avatarTotal"),backup=Path.GetDirectoryName(receiptPath)};
 }
}
internal sealed class MainForm:Form {
 private readonly Options options;private readonly Icon whaleIcon;private TextBox pathBox,logBox;private Button browse,install,restore,recover;private ProgressBar progress;private bool busy;private System.Windows.Forms.Timer autoCloseTimer;
 internal const int SuccessCloseDelayMs=2000;
 internal MainForm(Options o){options=o;whaleIcon=Program.LoadWhaleIcon();Icon=whaleIcon;ShowIcon=true;ShowInTaskbar=true;Text="DSH 鲸鱼外壳安装器 "+Program.Version;ClientSize=new Size(650,520);FormBorderStyle=FormBorderStyle.FixedSingle;MaximizeBox=false;StartPosition=FormStartPosition.CenterScreen;BackColor=Color.FromArgb(250,249,244);Font=new Font("Microsoft YaHei UI",9F);AutoScaleMode=AutoScaleMode.Dpi;
  var title=new Label{Text="让鲸鱼住进 DSH",Font=new Font(Font.FontFamily,20F,FontStyle.Bold),ForeColor=Color.FromArgb(20,70,170),Location=new Point(26,24),AutoSize=true};Controls.Add(title);
  Controls.Add(new Label{Text="鲸鱼外壳 · DS Bot 0.2.4 · 36 个拼贴头像\r\n离线安装，自动备份，保留账号、设置和聊天数据。",Location=new Point(28,76),Size=new Size(590,48)});
  Controls.Add(new Label{Text=o.Fixture?"独立测试目录（不会安装到当前客户端）":"DSH 安装文件夹",Location=new Point(28,138),AutoSize=true});
  pathBox=new TextBox{Text=o.AppDir??"",Location=new Point(28,162),Size=new Size(494,26),ReadOnly=o.Fixture};Controls.Add(pathBox);browse=new Button{Text="选择文件夹",Location=new Point(532,159),Size=new Size(90,30),Enabled=!o.Fixture};browse.Click+=(s,e)=>{using(var dialog=new FolderBrowserDialog()){dialog.Description="选择包含 DeepSeek Harness.exe 的安装文件夹";if(dialog.ShowDialog()==DialogResult.OK)pathBox.Text=dialog.SelectedPath;}};Controls.Add(browse);
  Controls.Add(new Label{Text="适用 Windows 10 / 11 x64，DSH 0.2.1-rc.3。\r\n安装前请完全退出 DSH（包括托盘）；不匹配的版本会停止安装。",Location=new Point(28,201),Size=new Size(594,44),ForeColor=Color.FromArgb(75,82,94)});
  install=new Button{Text="备份并一键安装",Location=new Point(28,258),Size=new Size(183,42),BackColor=Color.FromArgb(27,85,222),ForeColor=Color.White,FlatStyle=FlatStyle.Flat};install.Click+=(s,e)=>Start("install");Controls.Add(install);
  restore=new Button{Text="还原安装前外壳",Location=new Point(221,258),Size=new Size(183,42)};restore.Click+=(s,e)=>Start("restore");Controls.Add(restore);
  recover=new Button{Text="修复未完成安装",Location=new Point(414,258),Size=new Size(208,42)};recover.Click+=(s,e)=>Start("recover");Controls.Add(recover);
  progress=new ProgressBar{Location=new Point(28,313),Size=new Size(594,8),Style=ProgressBarStyle.Continuous};Controls.Add(progress);
  logBox=new TextBox{Location=new Point(28,335),Size=new Size(594,145),Multiline=true,ReadOnly=true,ScrollBars=ScrollBars.Vertical,BackColor=Color.White,BorderStyle=BorderStyle.FixedSingle};Controls.Add(logBox);
  Log(o.Fixture?"独立测试模式：文件与数据仅写入标记的测试目录。":"请选择安装位置，然后点击“备份并一键安装”。");Controls.Add(new Label{Text="还原仅恢复外壳与皮肤；DS Bot、头像和聊天数据会保留。",Location=new Point(28,489),AutoSize=true,ForeColor=Color.FromArgb(95,100,110)});
  Shown+=(s,e)=>{try{var p=Path.Combine(Installer.ExtractPayload(),"art","whale.png");using(var stream=new MemoryStream(File.ReadAllBytes(p)))using(var source=Image.FromStream(stream)){var picture=new PictureBox{Location=new Point(508,10),Size=new Size(114,106),SizeMode=PictureBoxSizeMode.Zoom,Image=new Bitmap(source)};Controls.Add(picture);picture.BringToFront();}}catch(Exception ex){Log("预览图未加载："+ex.Message);}};
  FormClosing+=(s,e)=>{if(busy){e.Cancel=true;Log("正在处理文件，请等待完成后关闭；中断后可用本安装器修复。");}};
  FormClosed+=(s,e)=>{if(autoCloseTimer!=null){autoCloseTimer.Stop();autoCloseTimer.Dispose();autoCloseTimer=null;}whaleIcon.Dispose();};
 }
 private void Log(string text){if(IsDisposed)return;if(InvokeRequired){BeginInvoke((Action)(()=>Log(text)));return;}logBox.AppendText(text+Environment.NewLine);}
 private void CompleteSuccess(string action){
  progress.Style=ProgressBarStyle.Continuous;progress.Value=100;var status=action=="install"?"安装完成":action=="restore"?"还原完成":"修复检查完成";Text=status+" · DSH 鲸鱼外壳安装器";Log(status+"，本窗口将在 2 秒后自动关闭。无需点击确认。");
  autoCloseTimer=new System.Windows.Forms.Timer {Interval=SuccessCloseDelayMs};autoCloseTimer.Tick+=(s,e)=>{if(autoCloseTimer==null)return;autoCloseTimer.Stop();autoCloseTimer.Dispose();autoCloseTimer=null;Close();};autoCloseTimer.Start();
 }
 private void CompleteFailure(Exception error){install.Enabled=restore.Enabled=recover.Enabled=pathBox.Enabled=true;browse.Enabled=!options.Fixture;progress.Style=ProgressBarStyle.Continuous;Log("未完成："+error.Message);Log("窗口将保持打开。修正原因后可重试；如有未完成记录，请使用“修复未完成安装”。");MessageBox.Show(this,error.Message,"DSH 鲸鱼外壳",MessageBoxButtons.OK,MessageBoxIcon.Information);}
 private void Start(string action){if(busy||autoCloseTimer!=null)return;try{if(String.IsNullOrWhiteSpace(pathBox.Text))throw new Exception("请先选择 DSH 安装文件夹。");options.AppDir=Path.GetFullPath(pathBox.Text.Trim());if(!options.Fixture)options.Runtime=Path.Combine(options.AppDir,"DeepSeek Harness.exe");}catch(Exception ex){Log(ex.Message);return;}busy=true;install.Enabled=restore.Enabled=recover.Enabled=browse.Enabled=pathBox.Enabled=false;progress.Style=ProgressBarStyle.Marquee;var worker=new BackgroundWorker();worker.DoWork+=(s,e)=>{e.Result=new Installer(options,Log).Execute(action);};worker.RunWorkerCompleted+=(s,e)=>{busy=false;worker.Dispose();if(e.Error!=null)CompleteFailure(e.Error);else CompleteSuccess(action);};worker.RunWorkerAsync();}
}
