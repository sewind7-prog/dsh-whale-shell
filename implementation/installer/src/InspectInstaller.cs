using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Reflection;
using System.Reflection.Emit;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Drawing;
using System.Drawing.Imaging;
using System.Web.Script.Serialization;

// Reads resources and compiled call sites. Never constructs a Form or invokes Main.
internal static class InspectInstaller {
 private static readonly Dictionary<short,OpCode> Codes=typeof(OpCodes).GetFields(BindingFlags.Public|BindingFlags.Static).Where(f=>f.FieldType==typeof(OpCode)).Select(f=>(OpCode)f.GetValue(null)).ToDictionary(c=>c.Value);
 private static string Hash(byte[] bytes){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();}
 private static void Require(bool condition,string message){if(!condition)throw new Exception(message);}
 private static string[] Calls(MethodBase method){
  var body=method.GetMethodBody();if(body==null)return new string[0];var il=body.GetILAsByteArray();var calls=new List<string>();int offset=0;
  while(offset<il.Length){short value=il[offset++];if(value==0xfe)value=(short)(0xfe00|il[offset++]);var opcode=Codes[value];int length;
   switch(opcode.OperandType){case OperandType.InlineNone:length=0;break;case OperandType.ShortInlineBrTarget:case OperandType.ShortInlineI:case OperandType.ShortInlineVar:length=1;break;case OperandType.InlineVar:length=2;break;case OperandType.InlineI8:case OperandType.InlineR:length=8;break;case OperandType.InlineSwitch:length=4+4*BitConverter.ToInt32(il,offset);break;default:length=4;break;}
   if(opcode.OperandType==OperandType.InlineMethod){var target=method.Module.ResolveMethod(BitConverter.ToInt32(il,offset),method.DeclaringType.IsGenericType?method.DeclaringType.GetGenericArguments():null,method.IsGenericMethod?method.GetGenericArguments():null);calls.Add(target.DeclaringType.FullName+"."+target.Name);}offset+=length;
  }return calls.ToArray();
 }
 public static int Main(string[] args){try{
  if(args.Length!=2)throw new Exception("Usage: InspectInstaller target.exe output-directory");Directory.CreateDirectory(args[1]);var assembly=Assembly.LoadFile(Path.GetFullPath(args[0]));var flags=BindingFlags.Instance|BindingFlags.Static|BindingFlags.NonPublic|BindingFlags.Public;var program=assembly.GetType("Program",true);var form=assembly.GetType("MainForm",true);
  var version=(string)program.GetField("Version",flags).GetRawConstantValue();Require(version=="1.0.3","Unexpected installer version");
  var installer=assembly.GetType("Installer",true);var runCalls=Calls(installer.GetMethod("Run",flags));Require(Array.IndexOf(runCalls,"Program.VerifyIdentity")>=0&&Array.IndexOf(runCalls,"Program.VerifyIdentity")<Array.IndexOf(runCalls,"System.Diagnostics.Process.Start"),"Target identity is not checked before runtime launch");
  Dictionary<string,object>[] supported;using(var stream=assembly.GetManifestResourceStream("SupportedShells"))using(var reader=new StreamReader(stream,Encoding.UTF8))supported=new JavaScriptSerializer().Deserialize<Dictionary<string,object>[]>(reader.ReadToEnd());Require(supported.Length==2,"Unexpected target catalog");
  var extract=installer.GetMethod("ExtractPayload",flags);var extracts=Enumerable.Range(0,2).Select(i=>System.Threading.Tasks.Task.Factory.StartNew(()=>(string)extract.Invoke(null,null))).ToArray();System.Threading.Tasks.Task.WaitAll(extracts);Require(extracts[0].Result!=extracts[1].Result&&extracts.All(task=>File.Exists(Path.Combine(task.Result,"manifest.json"))),"Parallel resource extraction is not isolated");
  byte[] iconBytes;using(var input=assembly.GetManifestResourceStream("WhaleIcon")){Require(input!=null,"WhaleIcon resource absent");using(var buffer=new MemoryStream()){input.CopyTo(buffer);iconBytes=buffer.ToArray();}}File.WriteAllBytes(Path.Combine(args[1],"managed-whale.ico"),iconBytes);
  var iconLoader=program.GetMethod("LoadWhaleIcon",flags);using(var icon=(Icon)iconLoader.Invoke(null,null))using(var bitmap=icon.ToBitmap()){Require(icon.Width>0&&icon.Height>0,"Icon loader returned empty icon");bitmap.Save(Path.Combine(args[1],"loaded-whale-icon.png"),ImageFormat.Png);}
  var ctorCalls=Calls(form.GetConstructors(flags).Single());Require(ctorCalls.Contains("Program.LoadWhaleIcon")&&ctorCalls.Contains("System.Windows.Forms.Form.set_Icon")&&ctorCalls.Contains("System.Windows.Forms.Form.set_ShowIcon")&&ctorCalls.Contains("System.Windows.Forms.Form.set_ShowInTaskbar"),"MainForm does not bind the whale window/taskbar icon");
  var success=Calls(form.GetMethod("CompleteSuccess",flags));Require(success.Contains("System.Windows.Forms.Timer.Start")&&success.Contains("System.Windows.Forms.Timer.set_Interval"),"Success timer not started");Require(!success.Any(c=>c.StartsWith("System.Windows.Forms.MessageBox.")),"Success must not require confirmation");
  var ticks=form.GetMethods(flags).Where(m=>m.Name.StartsWith("<CompleteSuccess>")).SelectMany(m=>Calls(m)).ToArray();Require(ticks.Contains("System.Windows.Forms.Form.Close"),"Completion timer does not close this form");Require(!ticks.Contains("System.Windows.Forms.Application.Exit"),"Completion must only close the installer form");
  var failure=Calls(form.GetMethod("CompleteFailure",flags));Require(failure.Contains("System.Windows.Forms.MessageBox.Show")&&failure.Contains("System.Windows.Forms.Control.set_Enabled"),"Failure must show its error and retain controls");Require(!failure.Contains("System.Windows.Forms.Timer.Start")&&!failure.Contains("System.Windows.Forms.Form.Close"),"Failure must retain the installer");
  var delay=(int)form.GetField("SuccessCloseDelayMs",flags).GetRawConstantValue();Require(delay==2000,"Unexpected completion delay");var all=assembly.GetTypes().SelectMany(t=>t.GetMethods(flags|BindingFlags.DeclaredOnly)).Select(m=>new{method=m,calls=Calls(m)}).ToArray();Require(all.Any(row=>row.calls.Contains("MainForm.CompleteSuccess")&&row.calls.Contains("MainForm.CompleteFailure")),"Worker completion is not routed to both outcomes");
  var result=new{status="PASS",version=version,supportedShells=supported,identityCheckedBeforeRuntimeLaunch=true,parallelExtractionIsolated=true,iconSha256=Hash(iconBytes),successCloseDelayMs=delay,exeIconAlsoCheckedByPEParser=true,windowIconBound=true,taskbarIconBound=true,successHasNoConfirmation=true,successTimerCallsFormClose=true,failureRetainsControlsAndError=true,formConstructed=false,desktopOpened=false,actualWindowClosureVerified=false,successCalls=success,timerCalls=ticks};var json=new JavaScriptSerializer().Serialize(result);File.WriteAllText(Path.Combine(args[1],"managed-contract-report.json"),json,new UTF8Encoding(false));Console.WriteLine(json);return 0;
 }catch(Exception error){Console.Error.WriteLine(error.ToString());return 1;}}
}
