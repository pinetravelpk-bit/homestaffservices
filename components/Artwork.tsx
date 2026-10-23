const regions:Record<string,[number,number,number,number]>={hero:[367,70,456,322],maid:[49,542,240,111],cook:[306,544,223,112],driver:[547,544,237,112],nanny:[50,704,238,116],care:[307,704,222,116],gardener:[548,704,236,116],family:[1,871,416,216],office:[1,1480,302,153],house:[683,1132,143,145],key:[683,1132,143,145],map:[458,1290,370,166]};
export default function Artwork({image,className='',label='',priority=false}:{image:string;className?:string;label?:string;priority?:boolean}){
 const region=regions[image.replace('art:','')];
 if(!region)return <div className={'photo '+className}><img src={image} alt={label} loading={priority?'eager':'lazy'} /></div>;
 const [x,y,w,h]=region;
 return <div className={'photo artwork '+className} role={label?'img':undefined} aria-label={label||undefined} aria-hidden={!label} style={{aspectRatio:`${w}/${h}`}}><svg viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}><image href="/images/approved-design.png" width="835" height="1884" /></svg></div>;
}
