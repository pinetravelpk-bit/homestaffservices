import 'server-only';
import { cookies } from 'next/headers';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './db';
export const hashToken=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function session(){
 const token=(await cookies()).get('hss_session')?.value; if(!token) return null;
 return db().prepare('SELECT email FROM sessions WHERE token=? AND expires>?').get(hashToken(token),Date.now()) as {email:string}|undefined;
}
export function verifyPassword(password:string,stored:string){
 try{const [salt,hex]=stored.split(':');const expected=Buffer.from(hex,'hex');const got=scryptSync(password,salt,64);return expected.length===got.length&&timingSafeEqual(expected,got);}catch{return false;}
}
export async function createSession(email:string){
 const token=randomBytes(32).toString('hex'); const now=Date.now();
 db().prepare('DELETE FROM sessions WHERE expires<?').run(now);
 db().prepare('INSERT INTO sessions(token,email,expires) VALUES(?,?,?)').run(hashToken(token),email,now+8*60*60*1000);
 (await cookies()).set('hss_session',token,{httpOnly:true,secure:process.env.COOKIE_SECURE==='false'?false:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:8*60*60});
}
export async function clearSession(){const c=await cookies();const token=c.get('hss_session')?.value;if(token) db().prepare('DELETE FROM sessions WHERE token=?').run(hashToken(token)); c.delete('hss_session');}
export function sameOrigin(req:Request){const origin=req.headers.get('origin'); if(!origin)return false;try {return new URL(origin).host===req.headers.get('host');}catch{return false;}}
