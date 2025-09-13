import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Toaster({ toasts, remove }){
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      <AnimatePresence>
        {toasts.map(t=>(
          <motion.div key={t.id} initial={{opacity:0,y:-8,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.98}} className="relative bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3 text-sm">
            <div className="font-medium text-gray-900">{t.title}</div>
            {t.desc && <div className="text-gray-600 text-xs mt-0.5">{t.desc}</div>}
            <button onClick={()=>remove(t.id)} className="absolute top-1.5 right-2 text-xs text-gray-400 hover:text-gray-700">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}