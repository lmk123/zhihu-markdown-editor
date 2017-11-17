const base = [
  navigator.userAgent.toLocaleLowerCase().includes('mac') ? 'meta' : 'ctrl'
]
const baseAndAlt = base.concat('alt')
const baseAndShift = base.concat('shift')

type TKey = 'metaKey' | 'altKey' | 'shiftKey'

const shortcutKeys = {
  粗体: {
    modifiers: base,
    keyCode: 66 // b
  },
  斜体: {
    modifiers: base,
    keyCode: 73 // i
  },
  标题: {
    modifiers: baseAndAlt,
    keyCode: 49 // 1
  },
  引用块: {
    modifiers: baseAndShift,
    keyCode: 85 // u
  },
  代码块: {
    modifiers: baseAndAlt,
    keyCode: 67 // c
  },
  有序列表: {
    modifiers: baseAndShift,
    keyCode: 55 // 7
  },
  无序列表: {
    modifiers: baseAndShift,
    keyCode: 56 // 8
  },
  插入链接: {
    modifiers: base,
    keyCode: 75 // k
  },
  插入公式: {
    modifiers: baseAndShift,
    keyCode: 69 // e
  },
  插入分割线: {
    modifiers: baseAndShift,
    keyCode: 83 // s
  },
  清除格式: {
    modifiers: base,
    keyCode: 220 // \
  },
  撤销: {
    modifiers: base,
    keyCode: 90, // z
    prevent: true
  },
  重做: {
    modifiers: baseAndShift,
    keyCode: 90 // z
  }
}

type TLabel = keyof typeof shortcutKeys
type TMatchFunc = (laebl: TLabel) => void

export default function(textarea: HTMLTextAreaElement, onMatch: TMatchFunc) {
  textarea.addEventListener('keydown', e => {
    const { keyCode } = e
    for (let label in shortcutKeys) {
      const pattern = shortcutKeys[label as TLabel]
      if (
        keyCode === pattern.keyCode &&
        pattern.modifiers.every(m => e[(m + 'Key') as TKey])
      ) {
        if (label === '撤销') {
          e.preventDefault()
        }
        onMatch(label as TLabel)
      }
    }
  })
}
