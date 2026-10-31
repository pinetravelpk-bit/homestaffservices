import assert from 'node:assert/strict';
import {randomUUID,randomBytes,scryptSync} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {resolve,join} from 'node:path';
import {unlinkSync,existsSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
const ownServer=!process.env.HSS_TEST_BASE;
const port=String(18000+Math.floor(Math.random()*10000));
const base=process.env.HSS_TEST_BASE||'http://127.0.0.1:'+port;
const dataDir=ownServer?mkdtempSync(join(tmpdir(),'hss-integration-')):resolve(process.env.DATA_DIR||'./data');
let server,logs='';
if(ownServer){server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',port],{env:{...process.env,DATA_DIR:dataDir,COOKIE_SECURE:'false',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base)).status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready){server.kill();rmSync(dataDir,{recursive:true,force:true});throw Error('Test server did not start: '+logs);}}
const d=new DatabaseSync(join(dataDir,'homestaff.sqlite'));
const email='integration-'+randomUUID()+'@example.com';const password=randomBytes(24).toString('hex');const salt=randomBytes(16).toString('hex');
d.prepare('INSERT INTO admins(email,hash) VALUES(?,?)').run(email,salt+':'+scryptSync(password,salt,64).toString('hex'));
let cookie='',leadIds=[],testPostIds=[],originalContent,uploaded,passed=0;
const ok=(condition,message)=>{assert.ok(condition,message);passed++;console.log('PASS '+message)};
async function api(url,method='GET',body,auth=false,origin=base){const res=await fetch(base+url,{method,headers:{...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{Origin:origin}:{}),...(auth?{Cookie:cookie}:{})},body:body instanceof FormData?body:body?JSON.stringify(body):undefined,redirect:'manual'});return res;}
try{
 for(const path of ['/','/about','/contact','/careers','/services/cooks-chefs','/areas/islamabad','/privacy','/terms','/sitemap.xml','/robots.txt','/admin/preview','/blog','/blog/how-to-hire-reliable-domestic-staff-in-pakistan']){const res=await api(path);ok(res.status===200,'Public route '+path);}
 ok((await api('/services/missing-service')).status===404,'Unknown service returns 404');ok((await api('/blog/missing-article')).status===404,'Unknown article returns 404');
 ok((await api('/admin')).status===307,'Admin redirects without session');
 for(const path of ['/api/admin/content','/api/admin/enquiries','/api/admin/media','/api/admin/backup','/api/admin/posts'])ok((await api(path)).status===401,'Protected '+path);
 ok((await api('/api/enquiries','POST',{},false,'https://unrelated.example')).status===403,'Cross-origin submission blocked');
 ok((await api('/api/enquiries','POST',{name:'X'})).status===400,'Incomplete enquiry rejected');
 const lead={kind:'enquiry',name:'Integration Test Household',phone:'0300 '+Math.random().toString().slice(2,9),city:'Islamabad',service:'Cooks & Chefs',preference:'Live-in',message:'Temporary automated verification record.',website:''};
 const res=await api('/api/enquiries','POST',lead);ok(res.status===201,'Enquiry stored');leadIds.push((await res.json()).id);
 const appRes=await api('/api/enquiries','POST',{...lead,kind:'application',name:'Integration Test Applicant'});ok(appRes.status===201,'Application stored');leadIds.push((await appRes.json()).id);
 ok((await api('/api/enquiries','POST',{...lead,website:'spam.example'})).status===400,'Honeypot rejected');
 ok((await api('/api/admin/login','POST',{email,password:'incorrect-password'})).status===401,'Incorrect login rejected');
 const login=await api('/api/admin/login','POST',{email,password});ok(login.status===200,'Administrator sign-in');cookie=login.headers.get('set-cookie')?.split(';')[0]||'';ok(cookie.startsWith('hss_session='),'Session cookie issued');
 const records=await(await api('/api/admin/enquiries','GET',undefined,true)).json();ok(leadIds.every(id=>records.some(l=>l.id===id)),'Records visible in protected inbox');
 const updated=await api('/api/admin/enquiries','PATCH',{id:leadIds[0],status:'Contacted',notes:'Integration test note'},true);ok(updated.status===200,'Enquiry status and notes updated');
 const after=await(await api('/api/admin/enquiries','GET',undefined,true)).json();ok(after.find(l=>l.id===leadIds[0]).notes==='Integration test note','Notes persisted');
 originalContent=await(await api('/api/admin/content','GET',undefined,true)).json();const changed=structuredClone(originalContent);changed.settings.heroAccent='the right help, tested.';
 ok((await api('/api/admin/content','PUT',changed,true,'https://unrelated.example')).status===403,'Cross-origin admin mutation blocked');
 ok((await api('/api/admin/content','PUT',changed,true)).status===200,'Website content saved');ok((await(await api('/')).text()).includes('the right help, tested.'),'Saved content reaches public homepage');
 const invalid=structuredClone(changed);invalid.services[0].slug='../bad';ok((await api('/api/admin/content','PUT',invalid,true)).status===400,'Invalid service slug rejected');
 const validBackup=await api('/api/admin/backup','GET',undefined,true);ok(validBackup.status===200&&(await validBackup.json()).enquiries.some(l=>l.id===leadIds[0]),'Backup contains persisted records');
 const file=new FormData();const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');file.set('file',new Blob([png],{type:'image/png'}),'test.png');const upload=await api('/api/admin/media','POST',file,true);ok(upload.status===201,'Authenticated image upload');uploaded=(await upload.json()).url;ok((await api(uploaded)).status===200,'Uploaded image publicly served');
 const badFile=new FormData();badFile.set('file',new Blob(['<svg onload="alert(1)"></svg>'],{type:'image/svg+xml'}),'bad.svg');ok((await api('/api/admin/media','POST',badFile,true)).status===400,'SVG upload rejected');

 // Blog
 const slugBase='integration-test-'+randomUUID().slice(0,8);
 const draftPost={title:'Integration test article',slug:slugBase,excerpt:'Temporary automated test article.',body:'## Test heading'+String.fromCharCode(10,10)+'A temporary article <script>alert(1)</script> with [a link](/contact) and [bad](javascript:alert(1)).',cover:'/images/stock/cook.webp',status:'draft',seoTitle:'',seoDescription:'',author:'Test',publishedAt:''};
 ok((await api('/api/admin/posts','POST',draftPost,true,'https://unrelated.example')).status===403,'Cross-origin blog post blocked');
 ok((await api('/api/admin/posts','POST',{...draftPost,slug:'Bad Slug!'},true)).status===400,'Invalid blog slug rejected');
 const created=await api('/api/admin/posts','POST',draftPost,true);ok(created.status===201,'Blog draft created');const createdPost=await created.json();testPostIds.push(createdPost.id);
 ok((await api('/blog/'+slugBase)).status===404,'Draft article hidden from public');
 ok(!(await (await api('/blog')).text()).includes(slugBase),'Draft article not listed on blog');
 ok((await api('/api/admin/posts','POST',{...draftPost,title:'Duplicate'},true)).status===409,'Duplicate blog slug rejected');
 const published=await api('/api/admin/posts','PUT',{...draftPost,id:createdPost.id,status:'published'},true);ok(published.status===200&&(await published.json()).publishedAt,'Blog article published with date');
 const articleHtml=await (await api('/blog/'+slugBase)).text();ok(articleHtml.includes('Integration test article'),'Published article is public');
 ok(!articleHtml.includes('<script>alert(1)')&&articleHtml.includes('&lt;script&gt;'),'Article HTML is escaped');
 ok(!articleHtml.includes('href="javascript:'),'Unsafe article links removed');
 ok((await (await api('/blog')).text()).includes(slugBase),'Published article listed on blog');
 ok((await (await api('/sitemap.xml')).text()).includes('/blog/'+slugBase),'Published article in sitemap');
 ok((await api('/api/admin/posts','PUT',{...draftPost,id:createdPost.id,status:'draft'},true)).status===200,'Blog article unpublished');
 ok((await api('/blog/'+slugBase)).status===404,'Unpublished article hidden again');
 ok((await api('/api/admin/posts?id='+createdPost.id,'DELETE',undefined,true)).status===200,'Blog article deleted');testPostIds=[];
 ok((await api('/api/admin/posts?id='+createdPost.id,'DELETE',undefined,true)).status===404,'Deleted article no longer exists');
 ok((await api('/api/admin/content','PUT',originalContent,true)).status===200,'Original website content restored');originalContent=undefined;
 for(const id of leadIds)ok((await api('/api/admin/enquiries?id='+id,'DELETE',undefined,true)).status===200,'Temporary record deleted');leadIds=[];
 ok((await api('/api/admin/logout','POST',undefined,true)).status===200,'Administrator sign-out');ok((await api('/api/admin/content','GET',undefined,true)).status===401,'Signed-out session invalidated');
 console.log(`\n${passed} integration checks passed.`);
}finally{
 if(originalContent)d.prepare('UPDATE content SET json=? WHERE id=1').run(JSON.stringify(originalContent));
 for(const id of leadIds)d.prepare('DELETE FROM enquiries WHERE id=?').run(id);
 for(const id of testPostIds)d.prepare('DELETE FROM posts WHERE id=?').run(id);
 d.prepare('DELETE FROM sessions WHERE email=?').run(email);d.prepare('DELETE FROM admins WHERE email=?').run(email);
 if(uploaded){const filename=join(dataDir,'media',uploaded.split('/').pop());if(existsSync(filename))unlinkSync(filename)}
 d.close();
 if(server){server.kill();await new Promise(r=>server.once('exit',r));rmSync(dataDir,{recursive:true,force:true});}
}
