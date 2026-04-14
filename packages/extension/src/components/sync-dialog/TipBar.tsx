import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import tips from '@/data/tips.json'

const AUTHOR_URL = 'https://fun0.netlify.app/about/?utm_source=wechatsync_tip'

/**
 * 同步等待时显示的随机功能提示
 * 每次挂载随机选一条，之后每 5 秒轮换，可关闭
 */
export function TipBar() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * tips.length))
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const timer = setInterval(() => {
      setIndex(prev => {
        let next: number
        do {
          next = Math.floor(Math.random() * tips.length)
        } while (next === prev && tips.length > 1)
        return next
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [dismissed])

  if (dismissed) return null

  const tip = tips[index]
  const isNew = tip.category === 'new'
  const isNotice = tip.category === 'notice'

  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/40 px-3 py-2.5 text-xs leading-relaxed">
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 mb-1">
        <span className="text-xs">{isNotice ? '⚠️' : '💡'}</span>
        <span className="font-medium text-[11px]">{isNotice ? '使用须知' : '你知道吗'}</span>
        {isNew && <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium px-1 py-px rounded">NEW</span>}
        <a
          href={AUTHOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 transition-colors"
        >
          来自作者 fun
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="text-gray-600 dark:text-gray-300 pl-[22px]">
        {tip.text}
      </div>
    </div>
  )
}
