import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:{default:'Home Staff Services | Domestic Staff in Pakistan',template:'%s | Home Staff Services'},description:'Thoughtful domestic staffing for Pakistani households. Find home help, cooks, drivers, nannies and carers.',robots:{index:true,follow:true},icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-PK"><body id="top"><a href="#main" className="skip-link">Skip to content</a>{children}</body></html>}
