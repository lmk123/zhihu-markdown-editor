import zhihuProxy from '../../share/zhihu-proxy'
import detect from './detect'
import MDE from '../../share/MarkDownEditor'
import { editAnswer, getDraft, saveDraft } from './api'
import html2md from '../../share/html2md'
import md2html from '../../share/md2html'

type TInfo = {
  id: string
  aid?: string
}

let mde: MDE
let textarea: HTMLTextAreaElement
let answerId: string | undefined
let info: TInfo

const qaReg = /\d+/g

function parseQA () {
  const url = new URL(window.location.href)
  const match = url.pathname.match(qaReg)
  if (match) {
    return {
      id: match[0], // 问题的 id
      aid: match[1] // 答案的 id
    }
  } else {
    const msg = '无法检测知乎问答信息，可能是知乎链接结构发生了变化。'
    window.alert(msg)
    throw new Error(msg)
  }
}

let initMDE = () => {
  initMDE = () => {}
  mde = new MDE('answer', () => {
    zhihuProxy('saveDraft', 'answer', md2html(textarea.value))
  })
  textarea = mde.textarea
  info = parseQA()

  interface ICustomMouseEvent extends MouseEvent {
    __pass?: boolean
  }

  // 拦截问题提交
  document.addEventListener('click', (event: ICustomMouseEvent) => {
    if (event.__pass) return
    const target = event.target as HTMLElement
    if (target.matches('.AnswerForm-submit')) {
      event.stopPropagation()
      zhihuProxy('hackDraft', 'answer', md2html(textarea.value)).then(() => {
        event.__pass = true
        target.dispatchEvent(event)
      })
    }
  }, true)
}

detect((container, isAnswered, rawHtml, aid) => {
  initMDE()
  answerId = aid

  textarea.placeholder = isAnswered ? '修改回答...' : '写回答...'

  zhihuProxy('getDraft', 'answer').then((draft: string) => {
    if (draft) {
      textarea.value = html2md(draft)
    }
    textarea.focus()
    mde.resize()
  })

  container.appendChild(textarea)
})
