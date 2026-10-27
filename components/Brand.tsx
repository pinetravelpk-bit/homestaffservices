/* eslint-disable @next/next/no-img-element */
// Site logo. The light version is shown automatically on dark backgrounds (footer, admin).
export default function Brand({name='Home Staff Services'}:{name?:string}){
 return <a href="/" className="brand" aria-label={name+' homepage'}>
  <img className="brand-logo brand-logo-dark" src="/logo.webp" alt={name} width={900} height={197}/>
  <img className="brand-logo brand-logo-light" src="/logo-light.webp" alt="" aria-hidden="true" width={900} height={197}/>
 </a>;
}
