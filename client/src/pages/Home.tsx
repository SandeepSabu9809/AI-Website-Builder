import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2Icon, Sparkles, Mic, MicOff } from 'lucide-react';
import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';

// TypeScript fix for SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const Home = () => {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition once
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return toast.error("Speech recognition not supported");
    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user) return toast.error('Please sign in to create a project');
      if (!input.trim()) return toast.error('Please enter a message');
      setLoading(true);
      const { data } = await api.post('/api/user/project', { initial_prompt: input });
      setLoading(false);
      navigate(`/projects/${data.projectId}`);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  return (
    <section style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#ffffff',
      fontFamily: "'Inter', sans-serif", overflow: 'hidden',
      position: 'relative', padding: '0 1.5rem',
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 10%, transparent 100%)',
        opacity: 0.4, pointerEvents: 'none',
      }} />

      {/* Dynamic Blob */}
      <div style={{
        position: 'absolute', top: '15%', left: '20%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(80px)',
        zIndex: 0, animation: 'float 6s ease-in-out infinite',
      }} />

      {/* Badge */}
      <a href="/pricing" className="badge-hover" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        border: '1px solid rgba(0,0,0,0.08)', borderRadius: '999px',
        padding: '5px 16px 5px 6px', textDecoration: 'none',
        color: '#4b5563', fontSize: '12px', background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)', zIndex: 1, marginBottom: '32px',
        transition: 'all 0.3s ease',
      }}>
        <span style={{
          background: '#000', color: '#fff', fontSize: '10px',
          fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
        }}>PRO</span>
        <span style={{ fontWeight: 500 }}>V2.0 is now live — try free trial</span>
      </a>

      {/* Heading */}
      <div style={{ textAlign: 'center', zIndex: 1, marginBottom: '40px' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.05,
          fontWeight: 800, color: '#000', maxWidth: '850px',
          margin: '0 auto 20px', letterSpacing: '-0.04em',
        }}>
          Build the web at the <br />
          <span style={{
            background: 'linear-gradient(to right, #8b5cf6, #d946ef)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            paddingRight: '4px'
          }}>speed of thought.</span>
        </h1>
        <p style={{
          color: '#666', fontSize: '18px', maxWidth: '520px',
          margin: '0 auto', lineHeight: 1.6, fontWeight: 400
        }}>
          The AI engine that turns prompts into production-ready websites in seconds.
        </p>
      </div>

      {/* Exquisite Form Container */}
      <form
        onSubmit={onSubmitHandler}
        className="form-container"
        style={{
          background: '#ffffff', maxWidth: '680px', width: '100%',
          borderRadius: '24px', padding: '8px', border: '1px solid #e2e8f0',
          boxShadow: '0 20px 50px rgba(0,0,0,0.08)', display: 'flex',
          flexDirection: 'column', zIndex: 1, transition: 'all 0.3s ease',
        }}
      >
        <div style={{ padding: '16px 12px 8px' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            placeholder="e.g. A dark themed portfolio for a motion designer..."
            required
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', width: '100%', color: '#1a1a1a',
              fontSize: '16px', lineHeight: 1.5, fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px', borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Voice Toggle */}
            <button
              type="button"
              onClick={toggleListening}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: isListening ? '#fef2f2' : '#f8fafc',
                color: isListening ? '#ef4444' : '#64748b',
                border: `1px solid ${isListening ? '#fecaca' : '#e2e8f0'}`,
                borderRadius: '10px', padding: '6px 12px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              {isListening ? (
                <><Mic size={14} className="animate-pulse" /><span>Listening...</span></>
              ) : (
                <><Mic size={14} /><span>Voice</span></>
              )}
            </button>

            <div style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={12} /> High Fidelity</span>
              <span className="hidden sm:inline">✦ SEO Optimized</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="generate-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#000', color: '#fff', border: 'none',
              borderRadius: '12px', padding: '12px 24px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {!loading ? <>Generate Site</> : <Loader2Icon className="animate-spin" size={18} />}
          </button>
        </div>
      </form>

      {/* Footer Branding */}
      <div style={{ marginTop: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 1 }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Trusted by innovators at
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', opacity: 0.5 }}>
          {['Framer', 'Huawei', 'Instagram', 'Microsoft', 'Walmart'].map((name, i) => (
            <span key={i} style={{ fontWeight: 700, color: '#64748b', fontSize: '18px' }}>{name}</span>
          ))}
        </div>
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .generate-btn:hover { background: #1a1a1a !important; transform: translateY(-1px); }
        .form-container:focus-within {
          border-color: #8b5cf6 !important;
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.12) !important;
        }
      `}</style>
    </section>
  );
};

export default Home;