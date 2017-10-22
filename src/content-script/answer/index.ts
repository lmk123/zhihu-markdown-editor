import zhihuProxy from '../share/zhihu-proxy'
import noop from '../share/noop'
import MDE from '../share/MarkDownEditor'
import html2md from '../share/html2md'
import md2html from '../share/md2html'
import detect from './detect'
import './style.css'

export default function() {
  const type = 'answer'
  let mde: MDE
  let textarea: HTMLTextAreaElement

  let initMDE = () => {
    initMDE = noop
    mde = new MDE(type, () => {
      zhihuProxy('saveDraft', type, md2html(textarea.value))
      const hiddenFooter = document.querySelector('.AnswerForm-footer--hidden')
      if (hiddenFooter) {
        hiddenFooter.classList.remove('AnswerForm-footer--hidden')
      }
    })
    textarea = mde.textarea

    interface ICustomMouseEvent extends MouseEvent {
      __pass?: boolean
    }

    // 拦截答案提交
    document.addEventListener(
      'click',
      (event: ICustomMouseEvent) => {
        if (event.__pass) return
        const target = event.target as HTMLElement
        if (target.matches('.AnswerForm-submit')) {
          event.stopPropagation()
          zhihuProxy('hackDraft', type, md2html(textarea.value)).then(() => {
            event.__pass = true
            target.dispatchEvent(event)
          })
        }
      },
      true
    )
  }

  detect((container, isAnswered) => {
    initMDE()

    textarea.placeholder = isAnswered ? '修改回答...' : '写回答...'

    zhihuProxy('getDraft', type).then((draft: string) => {
      if (draft) {
        textarea.value = html2md(draft)
      }
      textarea.focus()
      mde.resize()
    })

    container.appendChild(textarea)
  })
}
