import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { seed } from './seed';
import { starterPosts } from './blogSeed';
import type { Content, Enquiry } from './types';
let instance:DatabaseSync;
export function db(){
 if(instance) return instance;
 const dir=path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || './data'); mkdirSync(dir,{recursive:true});
 instance=new DatabaseSync(path.join(dir,'homestaff.sqlite'));
 instance.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS content(id INTEGER PRIMARY KEY CHECK(id=1),json TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS admins(email TEXT PRIMARY KEY,hash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,email TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS enquiries(id TEXT PRIMARY KEY,kind TEXT NOT NULL,name TEXT NOT NULL,phone TEXT NOT NULL,city TEXT NOT NULL,service TEXT NOT NULL,preference TEXT NOT NULL,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'New',notes TEXT NOT NULL DEFAULT '',createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS posts(id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL,excerpt TEXT NOT NULL DEFAULT '',body TEXT NOT NULL,cover TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'draft',seoTitle TEXT NOT NULL DEFAULT '',seoDescription TEXT NOT NULL DEFAULT '',author TEXT NOT NULL DEFAULT '',publishedAt TEXT NOT NULL DEFAULT '',createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS posts_status ON posts(status,publishedAt);
 CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 `);
 instance.prepare('INSERT OR IGNORE INTO content(id,json) VALUES(1,?)').run(JSON.stringify({...seed,settings:{...seed.settings,siteUrl:process.env.SITE_URL||seed.settings.siteUrl}}));
 // Starter blog posts are added once. Deleting them later does not bring them back.
 if(!instance.prepare("SELECT 1 FROM meta WHERE key='posts_seeded'").get()){
  const insert=instance.prepare('INSERT OR IGNORE INTO posts(id,slug,title,excerpt,body,cover,status,seoTitle,seoDescription,author,publishedAt,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
  for(const p of starterPosts)insert.run(p.id,p.slug,p.title,p.excerpt,p.body,p.cover,p.status,p.seoTitle,p.seoDescription,p.author,p.publishedAt,p.createdAt,p.updatedAt);
  instance.prepare("INSERT INTO meta(key,value) VALUES('posts_seeded','1')").run();
 }
 return instance;
}
export function getContent():Content {return JSON.parse((db().prepare('SELECT json FROM content WHERE id=1').get() as {json:string}).json);}
export function saveContent(content:Content){db().prepare('UPDATE content SET json=? WHERE id=1').run(JSON.stringify(content));}
export function enquiries():Enquiry[]{return db().prepare('SELECT * FROM enquiries ORDER BY createdAt DESC').all() as unknown as Enquiry[];}
export function limited(key:string,max:number,windowMs:number){
 const now=Date.now(); const d=db();
 d.prepare('INSERT INTO limits(key,count,reset) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset<? THEN 1 ELSE count+1 END,reset=CASE WHEN reset<? THEN excluded.reset ELSE reset END').run(key,now+windowMs,now,now);
 const row=d.prepare('SELECT count FROM limits WHERE key=?').get(key) as {count:number};
 return row.count>max;
}
