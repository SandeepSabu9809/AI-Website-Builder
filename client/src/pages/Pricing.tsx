import React from 'react'
import { appPlans } from '../assets/assets';
import Footer from '../components/Footer';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import api from '@/configs/axios';
import { Check, Sparkles } from 'lucide-react';

const Pricing = () => {
    const { data: session } = authClient.useSession()
    const [plans] = React.useState(appPlans)

    const handlePurchase = async (planId) => {
        try {
            if (!session?.user) return toast('Please login to purchase credits')
            const { data } = await api.post('/api/user/purchase-credits', { planId })
            window.location.href = data.payment_link;
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* Soft top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-slate-200/30 blur-[100px] pointer-events-none" />

            <div className='relative w-full max-w-6xl mx-auto z-20 px-6 py-20'>
                
                {/* Header Section: Standard Bold Scaling */}
                <div className='text-center mb-16'>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold mb-6 uppercase tracking-widest shadow-sm">
                        <Sparkles size={14} className="text-slate-400" /> Subscription Tiers
                    </div>
                    <h2 className='text-slate-900 text-4xl md:text-5xl font-bold tracking-tight mb-5'>
                        Power your <span style={{
            background: 'linear-gradient(to right, #8b5cf6, #d946ef)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            paddingRight: '4px'
          }}>creativity.</span>
                    </h2>
                    <p className='text-slate-500 text-lg max-w-2xl mx-auto font-normal leading-relaxed'>
                        Choose a plan that scales with your ambition. No hidden fees, just pure synthesis.
                    </p>
                </div>

                {/* Grid Layout */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
                    {plans.map((plan, idx) => {
                        const isMiddle = idx === 1;
                        return (
                            <div 
                                key={idx} 
                                className={`group relative flex flex-col p-8 rounded-[2rem] transition-all duration-500 border-2 ${
                                    isMiddle 
                                    ? 'bg-white border-slate-900 shadow-2xl shadow-slate-200 z-10' 
                                    : 'bg-white/60 border-slate-100 hover:border-slate-200'
                                }`}
                            >
                                {isMiddle && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-4 py-1 rounded-full tracking-wider uppercase">
                                        Best Value
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-[0.2em]">{plan.name}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-extrabold tracking-tighter text-slate-900">{plan.price}</span>
                                        <span className="text-slate-400 text-base font-medium">/ {plan.credits} credits</span>
                                    </div>
                                    <p className="text-slate-500 mt-6 text-base leading-relaxed">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-10 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start text-[15px] group/item">
                                            <div className={`mr-4 mt-1 p-1 rounded-full transition-colors ${
                                                isMiddle ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover/item:bg-slate-900 group-hover/item:text-white'
                                            }`}>
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-slate-600 group-hover/item:text-slate-900 transition-colors">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={() => handlePurchase(plan.id)} 
                                    className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-[0.98] ${
                                        isMiddle 
                                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-300' 
                                        : 'bg-white text-slate-900 border-2 border-slate-100 hover:border-slate-900'
                                    }`}
                                >
                                    Get Started
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footnote: Clean and legible */}
                <div className="mt-16 text-center">
                    <div className="inline-block px-10 py-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                         <p className='text-sm text-slate-500 font-medium'>
                            Project <span className="text-slate-900 underline decoration-slate-200 underline-offset-4">Creation & Revision</span> consume 5 credits per request.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Pricing;