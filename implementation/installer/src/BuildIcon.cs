using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Web.Script.Serialization;

// Deterministic local format conversion of the supplied whale, never generated art.
internal static class BuildIcon {
 private static string Hash(byte[] bytes){using(var sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();}
 private static void Preview(byte[] small16,byte[] small32,string filename){using(var canvas=new Bitmap(640,336,PixelFormat.Format32bppArgb))using(var g=Graphics.FromImage(canvas))using(var font=new Font(FontFamily.GenericSansSerif,13F)){
  g.Clear(Color.FromArgb(248,249,251));g.DrawString("16 px (16x zoom)",font,Brushes.Black,24,10);g.DrawString("32 px (8x zoom)",font,Brushes.Black,344,10);
  for(int panel=0;panel<2;panel++){var x0=24+320*panel;for(int y=0;y<272;y+=16)for(int x=0;x<272;x+=16)using(var fill=new SolidBrush(((x+y)/16)%2==0?Color.White:Color.FromArgb(220,225,231)))g.FillRectangle(fill,x0+x,42+y,16,16);using(var input=new MemoryStream(panel==0?small16:small32))using(var image=Image.FromStream(input)){g.InterpolationMode=InterpolationMode.NearestNeighbor;g.PixelOffsetMode=PixelOffsetMode.Half;g.DrawImage(image,new Rectangle(x0+8,50,256,256),0,0,image.Width,image.Height,GraphicsUnit.Pixel);}}
  canvas.Save(filename,ImageFormat.Png);
 }}
 public static int Main(string[] args){try{
  if(args.Length!=3)throw new Exception("Usage: BuildIcon source.png output.ico metadata.json");
  if(File.Exists(args[1])||File.Exists(args[2]))throw new Exception("Icon output already exists; choose a fresh versioned path.");
  var sizes=new[]{16,24,32,48,64,128,256};var images=new List<byte[]>();var frames=new List<object>();Rectangle bounds;
  using(var original=new Bitmap(args[0])){
   if(original.Width!=1448||original.Height!=1086)throw new Exception("Unexpected whale canvas; inspect the supplied art before changing the head crop.");bounds=new Rectangle(0,210,390,390);
   foreach(var size in sizes)using(var bitmap=new Bitmap(size,size,PixelFormat.Format32bppArgb)){
    using(var g=Graphics.FromImage(bitmap)){
     g.Clear(Color.Transparent);g.CompositingMode=CompositingMode.SourceCopy;g.CompositingQuality=CompositingQuality.HighQuality;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.SmoothingMode=SmoothingMode.HighQuality;
     var padding=Math.Max(1,(int)Math.Round(size*.035));var scale=Math.Min((double)(size-2*padding)/bounds.Width,(double)(size-2*padding)/bounds.Height);var width=Math.Max(1,(int)Math.Round(bounds.Width*scale));var height=Math.Max(1,(int)Math.Round(bounds.Height*scale));
     var destination=new Rectangle((size-width)/2,(size-height)/2,width,height);var diameter=Math.Max(2,(int)Math.Round(width*.24));using(var clip=new GraphicsPath()){clip.AddArc(destination.Left,destination.Top,diameter,diameter,180,90);clip.AddArc(destination.Right-diameter,destination.Top,diameter,diameter,270,90);clip.AddArc(destination.Right-diameter,destination.Bottom-diameter,diameter,diameter,0,90);clip.AddArc(destination.Left,destination.Bottom-diameter,diameter,diameter,90,90);clip.CloseFigure();g.SetClip(clip);g.DrawImage(original,destination,bounds,GraphicsUnit.Pixel);}
    }
    using(var stream=new MemoryStream()){bitmap.Save(stream,ImageFormat.Png);var bytes=stream.ToArray();images.Add(bytes);frames.Add(new{size=size,sha256=Hash(bytes),bytes=bytes.Length});}
    if(size==256)bitmap.Save(Path.ChangeExtension(args[1],".png"),ImageFormat.Png);if(size==16||size==32)bitmap.Save(Path.Combine(Path.GetDirectoryName(args[1]),Path.GetFileNameWithoutExtension(args[1])+"-"+size+"px.png"),ImageFormat.Png);
   }
  }
  Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(args[1])));
  using(var stream=new FileStream(args[1],FileMode.CreateNew))using(var writer=new BinaryWriter(stream)){
   writer.Write((ushort)0);writer.Write((ushort)1);writer.Write((ushort)sizes.Length);var offset=6+16*sizes.Length;
   for(int i=0;i<sizes.Length;i++){writer.Write((byte)(sizes[i]==256?0:sizes[i]));writer.Write((byte)(sizes[i]==256?0:sizes[i]));writer.Write((byte)0);writer.Write((byte)0);writer.Write((ushort)1);writer.Write((ushort)32);writer.Write(images[i].Length);writer.Write(offset);offset+=images[i].Length;}
   foreach(var bytes in images)writer.Write(bytes);
  }
  Preview(images[0],images[2],Path.Combine(Path.GetDirectoryName(args[1]),"whale-icon-small-preview.png"));var metadata=new{sourceSha256=Hash(File.ReadAllBytes(args[0])),crop=new{x=bounds.X,y=bounds.Y,width=bounds.Width,height=bounds.Height},cropDescription="supplied whale head with original eye and smile; rounded transparent crop",iconSha256=Hash(File.ReadAllBytes(args[1])),frames=frames};var json=new JavaScriptSerializer().Serialize(metadata);File.WriteAllText(args[2],json,new UTF8Encoding(false));Console.WriteLine(json);return 0;
 }catch(Exception error){Console.Error.WriteLine(error.Message);return 1;}}
}
