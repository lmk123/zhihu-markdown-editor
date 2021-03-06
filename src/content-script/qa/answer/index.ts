import zhihuProxy from '../../utils/zhihu-proxy'
import noop from '../../utils/noop'
import MDE from '../../utils/editor'
import html2md from '../../utils/html2md'
import md2html from '../../utils/md2html'
import detect from './detect'
import './style.css'

export default function() {
  const type = 'answer'
  let mde: MDE
  let textarea: HTMLTextAreaElement

  let initMDE = () => {
    initMDE = noop
    mde = new MDE(type, () => {
      zhihuProxy('saveDraft', type, md2html(textarea.value)).then(noop, noop)
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
          }, noop)
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
        // TODO: 需要一个 clearState 方法
        mde.saveState()
      }
      textarea.focus()
      mde.resize()
    }, noop)

    container.appendChild(textarea)
  })
}
