import { describe, expect, it } from 'vitest'
import { markdownToXiaohongshuProseMirror } from '../src/adapters/xiaohongshu-prosemirror'

describe('markdownToXiaohongshuProseMirror', () => {
  it('converts paragraphs without leaving raw line breaks in text nodes', async () => {
    const result = await markdownToXiaohongshuProseMirror('第一行\n第二行\n\n第三段')

    expect(result).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '第一行' },
            { type: 'text', text: '第二行' },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '第三段' }],
        },
      ],
    })
  })

  it('matches Xiaohongshu heading, marks, list and image node names', async () => {
    const result = await markdownToXiaohongshuProseMirror(
      '# 标题\n\n**粗体**和*斜体*\n\n- 列表\n\n![图片](https://example.com/a.png)',
      async () => ({
        url: 'https://ros-preview.xhscdn.com/file-id',
        width: 800,
        height: 600,
      })
    )

    expect(result.content?.map(node => node.type)).toEqual([
      'heading',
      'paragraph',
      'bulletList',
      'image',
    ])
    expect(result.content?.[1].content).toEqual([
      { type: 'text', text: '粗体', marks: [{ type: 'highlight' }] },
      { type: 'text', text: '和' },
      { type: 'text', text: '斜体' },
    ])
    expect(result.content?.[3]).toEqual({
      type: 'image',
      attrs: {
        imgs: [{
          src: 'https://ros-preview.xhscdn.com/file-id',
          desc: '',
          percent: 30,
          width: 410,
          height: 308,
        }],
      },
    })
  })
})
