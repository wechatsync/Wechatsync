import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(new URL('../packages/cli/package.json',import.meta.url));
const {WebSocket}=require('ws');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'wechatsync-cli-test-'));
fs.writeFileSync(path.join(fixture,'article.md'),'# Fixture\n\n![Step](./test.png)\n\n```powershell\n$secure_key = $local_key\nWrite-Host "<text>"\n```\n');
fs.writeFileSync(path.join(fixture,'test.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/9sAAAAASUVORK5CYII=','base64'));

async function runCase(port,failImage){
  let connected=false,client,attemptTimer,killTimer;const requests=[];let output='';
  const child=spawn(process.execPath,[path.join(root,'packages/cli/dist/index.js'),'--timeout','3000','sync',path.join(fixture,'article.md'),'-p','zhihu','--author','Example'],{env:{...process.env,NODE_OPTIONS:'',SYNC_WS_PORT:String(port),WECHATSYNC_TOKEN:'regression-only-token'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  child.stdout.on('data',c=>output+=c);child.stderr.on('data',c=>output+=c);
  const done=new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',code=>resolve(code));killTimer=setTimeout(()=>{child.kill();reject(new Error('regression process timed out'))},10000)});
  attemptTimer=setInterval(()=>{
    if(connected)return;
    const ws=new WebSocket(`ws://127.0.0.1:${port}`);
    ws.on('error',()=>{});ws.on('open',()=>{connected=true;client=ws;clearInterval(attemptTimer)});
    ws.on('message',raw=>{
      const msg=JSON.parse(raw);requests.push(msg.method);
      let result={success:true};
      if(msg.method==='checkAuth')result={isAuthenticated:true};
      if(msg.method==='uploadImage:complete'||msg.method==='uploadImage'){
        if(failImage){ws.send(JSON.stringify({id:msg.id,error:{code:-1,message:'simulated upload failure'}}));return}
        result={url:'https://pic.zhimg.com/test.png'};
      }
      if(msg.method==='syncArticle'){
        assert.equal(msg.params.article.author,'Example');
        assert.ok(msg.params.article.content.includes('$secure_key = $local_key'));
        assert.ok(msg.params.article.content.includes('&lt;text&gt;'));
        assert.ok(!msg.params.article.content.includes('<em>key'));
        result={results:[{platform:'zhihu',success:false,error:'simulated draft failure'}]};
      }
      ws.send(JSON.stringify({id:msg.id,result}));
    });
  },80);
  try{const code=await done;assert.equal(code,1);if(failImage)assert.ok(!requests.includes('syncArticle'),'Must not submit after image failure');else assert.equal(requests.filter(x=>x==='syncArticle').length,1);return {code,requests};}
  finally{clearInterval(attemptTimer);clearTimeout(killTimer);client?.close();}
}
try {
  await runCase(19657,true);
  await runCase(19659,false);
} finally { fs.rmSync(fixture,{recursive:true,force:true}); }
console.log('PASS: real CLI refuses draft creation after image failure, returns nonzero on draft failure, sends exactly one save request.');
