/** 从 pre/code 的 class 或 data-lang 中提取语言标识。 */
export function detectCodeLang(pre: Element): string | null {
  const elements = [pre, pre.querySelector('code')].filter(Boolean) as Element[]

  for (const element of elements) {
    const dataLang = element.getAttribute('data-lang')
    if (dataLang) return dataLang.trim().toLowerCase()

    const match = element.className.match(/(?:language|lang|highlight)-(\w+)/)
    if (match) return match[1].toLowerCase()

    const wxMatch = element.className.match(/code-snippet__(\w+)/)
    if (wxMatch) return wxMatch[1].toLowerCase()
  }

  return null
}
