import {NextResponse} from 'next/server';import {createSession,sameOrigin,verifyPassword} from '@/lib/auth';import {db,limited} from '@/lib/db';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Invalid request origin.'},{status:403});
 try{const raw=await req.text();if(raw.length>4096)return NextResponse.json({error:'Invalid request.'},{status:400});const {email,password}=JSON.parse(raw);if(typeof email!=='string'||typeof password!=='string'||email.length>200||password.length>300)return NextResponse.json({error:'Invalid credentials.'},{status:400});
 const normalized=email.trim().toLowerCase();if(limited('login:'+normalized,8,15*60*1000)||limited('login:global',80,15*60*1000))return NextResponse.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429});
 const user=db().prepare('SELECT email,hash FROM admins WHERE email=?').get(normalized) as {email:string;hash:string}|undefined;
 if(!user){verifyPassword(password,'not-a-real-account:'+ '00'.repeat(64));return NextResponse.json({error:'Email or password is incorrect.'},{status:401});}
 if(!verifyPassword(password,user.hash))return NextResponse.json({error:'Email or password is incorrect.'},{status:401});await createSession(user.email);return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Unable to sign in.'},{status:400});}
}
