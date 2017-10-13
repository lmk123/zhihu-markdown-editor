import * as toMarkdown from 'to-markdown'
import * as marked from 'marked'
import detect from './detect'
import MDE from '../share/MarkDownEditor'
import { editAnswer, getDraft, saveDraft } from './api'

type TInfo = {
  id: string
  aid?: string
}

let mde: MDE
let textarea: HTMLTextAreaElement
let info: TInfo
let answeredHTML: string
let first = true

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
    throw new Error('无法检测知乎问答信息，可能是知乎链接结构发生了变化。')
  }
}

const isAnswered = detect(container => {
  if (first) {
    first = false
    mde = new MDE(() => {
      saveDraft(info.id, marked(textarea.value))
    })
    textarea = mde.textarea
    textarea.placeholder = isAnswered ? '修改回答...' : '写回答...'
    info = parseQA()
    getDraft(info.id).then(content => {
      // todo 知乎的文本还需要做一些处理
      if (content) {
        textarea.value = toMarkdown(content)
      } else if (answeredHTML) {
        textarea.value = toMarkdown(answeredHTML)
      }
    })

    // 拦截问题提交
    document.addEventListener('submit', (event) => {
      if ((event.target as Element).matches('.AnswerForm')) {
        event.preventDefault()
        event.stopPropagation()

        editAnswer(info.aid as string, marked(textarea.value))
      }
    }, true)
  }

  container.appendChild(textarea)
})

if (isAnswered) {
  answeredHTML = (document.querySelector('.CopyrightRichText-richText') as HTMLDivElement).innerHTML
}
