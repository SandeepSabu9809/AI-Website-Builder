import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
  const { pathname } = useParams()

  return (
    <main className="p-4 flex flex-col justify-center items-center h-[80vh]">
  <AuthView 
    pathname={pathname} 
    classNames={{
      base: `
        bg-white/10 
        ring ring-slate-100 
        
        /* The Float Aesthetic (Shadow & Movement) */
        shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
        transition-all duration-500 ease-out 
        hover:-translate-y-2 
        hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)]
      `
    }}
  />
</main>
  )
}