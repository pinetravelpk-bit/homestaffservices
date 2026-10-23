import {z} from 'zod';
const text=z.string().trim();
const image=text.max(300).refine(v=>/^art:(hero|maid|cook|driver|nanny|care|gardener|family|office|house|key|map)$/.test(v)||/^\/media\/[a-f0-9-]+\.(jpg|png|webp)$/.test(v),'Use a built-in image or an uploaded image');
export const enquirySchema=z.object({kind:z.enum(['enquiry','application']).default('enquiry'),name:text.min(2).max(100),phone:text.min(7).max(30).regex(/^[+0-9 ()-]+$/),city:text.min(2).max(100),service:text.min(2).max(100),preference:text.max(60).default('To discuss'),message:text.max(2000).default(''),website:text.max(0).optional()});
const slug=text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const id=text.min(1).max(100);
export const contentSchema=z.object({
 settings:z.object({brand:text.min(2).max(100),heroTitle:text.min(2).max(120),heroAccent:text.min(2).max(80),heroText:text.min(5).max(400),aboutTitle:text.min(5).max(180),aboutText:text.min(5).max(1200),email:z.union([z.literal(''),z.email()]),phone:text.max(30).regex(/^[+0-9 ()-]*$/),whatsapp:text.max(20).regex(/^[0-9]*$/),siteUrl:z.url().refine(v=>/^https?:\/\//.test(v)),heroImage:image,familyImage:image,officeImage:image,seoTitle:text.min(5).max(100),seoDescription:text.min(10).max(300)}),
 services:z.array(z.object({id,slug,title:text.min(2).max(100),summary:text.min(5).max(250),description:text.min(20).max(6000),image,duties:z.array(text.min(2).max(300)).min(1).max(20),active:z.boolean()})).max(30),
 areas:z.array(z.object({id,slug,title:text.min(2).max(100),description:text.min(20).max(6000),neighborhoods:z.array(text.min(1).max(100)).max(50),active:z.boolean()})).max(100),
 faqs:z.array(z.object({id,question:text.min(5).max(200),answer:text.min(10).max(2000)})).max(40)
}).superRefine((c,ctx)=>{for(const key of ['services','areas'] as const){for(const field of ['id','slug'] as const){const vals=c[key].map(x=>x[field]);if(new Set(vals).size!==vals.length)ctx.addIssue({code:'custom',path:[key],message:'IDs and slugs must be unique'});}}});
