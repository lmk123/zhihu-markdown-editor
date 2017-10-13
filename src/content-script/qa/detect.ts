// 检测知乎问答的编辑器
import getZHEditor from '../share/get-zh-editor'

export default function (): Promise<TInfo> {
  // 如果问题还没有回答过，则知乎编辑器是一开始就有的
  const info = getInfo()
  if (info) {
    return Promise.resolve(info)
  }

  // 否则需要等用户点了「修改」链接之后，知乎编辑器才会出现
  return new Promise((resolve, reject) => {

    function handler (event: MouseEvent) {
      const editLink = (event.target as Element).closest('.AnswerItem-editButton')
      if (editLink) {
        document.removeEventListener('click', handler)
        const info = getInfo()
        if (info) {
          resolve(info)
        } else {
          reject(new Error('无法检测到知乎编辑器。'))
        }
      }
    }

    document.addEventListener('click', handler)
  })
}

export type TInfo = {
  id: string
  aid?: string
  editor: HTMLDivElement
}

const qaReg = /\d+/g

function getInfo (): TInfo | void | never {
  const editor = getZHEditor()
  if (editor) {
    const url = new URL(window.location.href)
    const match = url.pathname.match(qaReg)
    if (match) {
      return {
        id: match[0], // 问题的 id
        aid: match[1], // 答案的 id
        editor
      }
    } else {
      throw new Error('无法解析知乎问答的 id，可能是知乎的链接格式改变了。')
    }
  }
}
