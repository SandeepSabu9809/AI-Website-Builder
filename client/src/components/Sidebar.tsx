import React, { useEffect, useRef, useState } from 'react'
import type { Message, Project, Version } from '../types';
import { BotIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon, Mic, MicOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';

// TypeScript fix for SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface SidebarProps {
    isMenuOpen: boolean;
    project: Project,
    setProject: (project: Project)=> void;
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean)=> void;
}

const Sidebar = ({isMenuOpen, project, setProject, isGenerating, setIsGenerating} : SidebarProps) => {

    const messageRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)

    // Initialize Speech Recognition
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
                toast.success("Thought captured");
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

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/api/user/project/${project.id}`)
            setProject(data.project)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const handleRollback = async (versionId: string) => {
        try {
            const confirm = window.confirm('Are you sure you want to rollback to this version?')
            if(!confirm) return;
            setIsGenerating(true)
            const { data } = await api.get(`/api/project/rollback/${project.id}/${versionId}`);
            const { data: data2 } = await api.get(`/api/user/project/${project.id}`);
            toast.success(data.message)
            setProject(data2.project)
            setIsGenerating(false)
        } catch (error: any) {
            setIsGenerating(false);
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const handleRevisions = async (e: React.FormEvent) => {
        e.preventDefault()
        let interval: number | undefined;
        try {
            setIsGenerating(true);
            interval = window.setInterval(()=>{
                fetchProject();
            },10000)
            const {data} = await api.post(`/api/project/revision/${project.id}`, {message: input})
            fetchProject();
            toast.success(data.message)
            setInput('')
            clearInterval(interval)
            setIsGenerating(false);
        } catch (error: any) {
            setIsGenerating(false);
            toast.error(error?.response?.data?.message || error.message);
            clearInterval(interval)
        }
    }

    useEffect(()=>{
        if(messageRef.current){
            messageRef.current.scrollIntoView({behavior: 'smooth'})
        }
    },[project.conversation.length, isGenerating])

  return (
    <div className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'}`}>
      <div className='flex flex-col h-full'>
        {/* Messages container */}
        <div className='flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4'>
            {[...project.conversation, ...project.versions]
            .sort((a,b)=> new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((message, idx)=>{
                const isMessage = 'content' in message;

                if(isMessage){
                    const msg = message as Message;
                    const isUser = msg.role === 'user';
                    return (
                        <div key={msg.id || idx} className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                            {!isUser && (
                                <div className='w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shrink-0'>
                                    <BotIcon className='size-5 text-white'/>
                                </div>
                            )}
                            <div className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${isUser ? "bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none" : "rounded-tl-none bg-gray-800 text-gray-100"}`}>
                                {msg.content}
                            </div>
                            {isUser && (
                                <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0'>
                                    <UserIcon className='size-5 text-gray-200'/>
                                </div>
                            )}
                        </div>
                    )
                } else {
                    const ver = message as Version;
                    return (
                        <div key={ver.id} className='w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2'>
                            <div className='text-xs font-medium'>
                                code updated <br /> 
                                <span className='text-gray-500 text-xs font-normal'>
                                    {new Date(ver.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <div className='flex items-center justify-between'>
                                {project.current_version_index === ver.id ? (
                                    <button className='px-3 py-1 rounded-md text-xs bg-gray-700'>Current version</button>
                                ): (
                                    <button onClick={()=> handleRollback(ver.id)} className='px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white'>Roll back</button>
                                )}
                                <Link target='_blank' to={`/preview/${project.id}/${ver.id}`}>
                                    <EyeIcon className='size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded'/>
                                </Link>
                            </div>
                        </div>
                    )
                }
            })}
            {isGenerating && (
                <div className='flex items-start gap-3 justify-start'>
                    <div className='w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shrink-0'>
                        <BotIcon className='size-5 text-white'/>
                    </div>
                    <div className='flex gap-1.5 h-8 items-center'>
                        <span className='size-1.5 rounded-full animate-bounce bg-gray-600' style={{animationDelay : '0s'}}/>
                        <span className='size-1.5 rounded-full animate-bounce bg-gray-600' style={{animationDelay : '0.2s'}}/>
                        <span className='size-1.5 rounded-full animate-bounce bg-gray-600' style={{animationDelay : '0.4s'}}/>
                    </div>
                </div>
            )}
            <div ref={messageRef}/>
        </div>

        {/* Exquisite Input area */}
        <form onSubmit={handleRevisions} className='m-3 relative'>
            <div className='relative flex flex-col'>
                <textarea 
                    onChange={(e)=>setInput(e.target.value)} 
                    value={input} 
                    rows={4} 
                    placeholder='Describe changes...' 
                    className='flex-1 p-3 pb-12 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all' 
                    disabled={isGenerating}
                />
                
                {/* Floating Buttons Container */}
                <div className='absolute bottom-2 right-2 flex items-center gap-2 px-2 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700'>
                    
                    {/* Listening Text Status */}
                    {isListening && (
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse mr-1">
                            Listening...
                        </span>
                    )}

                    {/* Mic Button */}
                    <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isGenerating}
                        className={`transition-colors duration-300 outline-none ${
                            isListening ? 'text-rose-500' : 'text-gray-400 hover:text-indigo-400'
                        }`}
                    >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    {/* Send Button */}
                    <button 
                        type="submit"
                        disabled={isGenerating || !input.trim()} 
                        className='text-white rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-95 disabled:opacity-40'
                    >
                        {isGenerating 
                            ? <Loader2Icon className='size-7 p-1.5 animate-spin'/>
                            : <SendIcon className='size-7 p-1.5' />
                        }
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  )
}

export default Sidebar