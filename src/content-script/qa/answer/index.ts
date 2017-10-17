import zhihuProxy from '../../share/zhihu-proxy'
import detect from './detect'
import MDE from '../../share/MarkDownEditor'
import html2md from '../../share/html2md'
import md2html from '../../share/md2html'

let mde: MDE
let textarea: HTMLTextAreaElement

let initMDE = () => {
  initMDE = () => {}
  mde = new MDE('answer', () => {
    zhihuProxy('saveDraft', 'answer', md2html(textarea.value))
  })
  textarea = mde.textarea

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

detect((container, isAnswered) => {
  initMDE()

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
