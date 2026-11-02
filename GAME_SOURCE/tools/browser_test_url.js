'use strict';
// Serve fixtures over loopback HTTP: managed Chromium may disallow file://.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');let ready;
exports.url=async file=>{
 const rel=path.relative(root,path.resolve(file));
 if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Browser fixture must be inside GAME_SOURCE');
 if(!ready)ready=new Promise((resolve,reject)=>{
  const server=http.createServer((req,res)=>{
   let target;try{target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch(_){res.writeHead(400).end();return;}
   if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   fs.readFile(target,(err,data)=>{if(err){res.writeHead(404).end();return;}const ext=path.extname(target);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'})[ext]||'application/octet-stream');res.end(data);});
  });
  server.on('error',reject);server.listen(0,'127.0.0.1',()=>{server.unref();resolve('http://127.0.0.1:'+server.address().port+'/');});
 });
 return (await ready)+rel.split(path.sep).map(encodeURIComponent).join('/');
};
