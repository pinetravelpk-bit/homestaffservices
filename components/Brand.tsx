import {House,Leaf} from 'lucide-react';
export default function Brand({name='Home Staff Services'}:{name?:string}) {return <a href="/" className="brand" aria-label={name+' homepage'}><span className="brand-mark"><House size={41} strokeWidth={1}/><Leaf size={23} strokeWidth={1.5}/></span><span>{name==='Home Staff Services'?<>HOME STAFF<br/>SERVICES</>:name}</span></a>}
