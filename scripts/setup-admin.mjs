import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
try {
 const email=(await rl.question('Admin email: ')).trim().toLowerCase();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw Error('Enter a valid email.');
 const password=await rl.question('Admin password (12+ characters; input is visible in this terminal): ');
 if(password.length<12) throw Error('Password must have at least 12 characters.');
 const dir=path.resolve(process.env.DATA_DIR||'./data');mkdirSync(dir,{recursive:true});
 const db=new DatabaseSync(path.join(dir,'homestaff.sqlite'));
 db.exec('CREATE TABLE IF NOT EXISTS admins(email TEXT PRIMARY KEY,hash TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,email TEXT NOT NULL,expires INTEGER NOT NULL)');
 const salt=randomBytes(16).toString('hex');const hash=salt+':'+scryptSync(password,salt,64).toString('hex');
 db.prepare('INSERT INTO admins(email,hash) VALUES(?,?) ON CONFLICT(email) DO UPDATE SET hash=excluded.hash').run(email,hash);
 db.prepare('DELETE FROM sessions WHERE email=?').run(email);db.close();console.log('Admin saved. Sign in at /admin/login.');
} catch(e){console.error(e.message);process.exitCode=1;} finally {rl.close();}
