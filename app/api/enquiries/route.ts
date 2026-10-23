import {NextResponse} from 'next/server';import {randomUUID} from 'node:crypto';import {db,limited} from '@/lib/db';import {sameOrigin} from '@/lib/auth';import {enquirySchema} from '@/lib/validation';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Invalid request origin.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>16000)return NextResponse.json({error:'Request too large.'},{status:413});
 try{
 const raw=await req.text();if(raw.length>16000)return NextResponse.json({error:'Request too large.'},{status:413});
 const parsed=enquirySchema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Please check your name, phone number, city and service.'},{status:400});
 const v=parsed.data;const key='form:'+v.phone.replace(/\D/g,'');if(limited(key,4,60*60*1000))return NextResponse.json({error:'You have sent several requests. Please try again later.'},{status:429});
 // Global cap complements per-phone throttling on single-server installations.
 if(limited('form:global',100,60*60*1000))return NextResponse.json({error:'We are receiving many requests. Please try again later.'},{status:429});
 const id=randomUUID();db().prepare('INSERT INTO enquiries(id,kind,name,phone,city,service,preference,message,createdAt) VALUES(?,?,?,?,?,?,?,?,?)').run(id,v.kind,v.name,v.phone,v.city,v.service,v.preference,v.message,new Date().toISOString());
 return NextResponse.json({ok:true,id},{status:201});
 }catch{return NextResponse.json({error:'Unable to process this request. Please try again.'},{status:400});}
}
