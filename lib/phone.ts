// Turn a display number like "0314 3217406" into a dialable tel: link.
export function telHref(phone:string){return 'tel:'+phone.replace(/[^+0-9]/g,'');}
