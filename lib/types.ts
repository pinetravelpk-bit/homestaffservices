export type Service = {id:string; slug:string; title:string; summary:string; description:string; image:string; duties:string[]; active:boolean};
export type Area = {id:string; slug:string; title:string; description:string; neighborhoods:string[]; active:boolean};
export type FAQ = {id:string; question:string; answer:string};
export type Settings = {brand:string; heroTitle:string; heroAccent:string; heroText:string; aboutTitle:string; aboutText:string; email:string; phone:string; whatsapp:string; siteUrl:string; heroImage:string; familyImage:string; officeImage:string; seoTitle:string; seoDescription:string};
export type Content = {settings:Settings; services:Service[]; areas:Area[]; faqs:FAQ[]};
export type Enquiry = {id:string; kind:'enquiry'|'application'; name:string; phone:string; city:string; service:string; preference:string; message:string; status:string; notes:string; createdAt:string};
export type PostStatus = 'draft'|'published';
export type Post = {id:string; slug:string; title:string; excerpt:string; body:string; cover:string; status:PostStatus; seoTitle:string; seoDescription:string; author:string; publishedAt:string; createdAt:string; updatedAt:string};
