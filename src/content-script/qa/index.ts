import detect from './detect'
import MDE from '../share/MarkDownEditor'
import { editAnswer, getDraft, saveDraft } from './api'
import html2md from '../share/html2md'
import md2html from '../share/md2html'

type TInfo = {
  id: string
  aid?: string
}

let mde: MDE
let textarea: HTMLTextAreaElement
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
  mde = new MDE(() => {
    saveDraft(info.id, md2html(textarea.value))
  })
  textarea = mde.textarea
  info = parseQA()

  // 拦截问题提交
  // todo 提交不成功，代码没有执行到这里
  document.addEventListener('submit', (event) => {
    if ((event.target as Element).matches('.AnswerForm')) {
      event.preventDefault()
      event.stopPropagation()
      console.log(textarea.value)
      editAnswer(info.aid as string, md2html(textarea.value))
        .then(content => {
          const htmlBox = document.querySelector('.CopyrightRichText-richText')
          if (htmlBox) {
            htmlBox.innerHTML = content
          }
        })
    }
  }, true)
}

detect((container, isAnswered, rawHtml) => {
  initMDE()

  textarea.placeholder = isAnswered ? '修改回答...' : '写回答...'

  getDraft(info.id).then(content => {
    if (content) {
      textarea.value = html2md(content)
    } else if (rawHtml) {
      textarea.value = html2md(rawHtml, true)
    }
  })

  container.appendChild(textarea)
})
