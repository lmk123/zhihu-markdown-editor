import zhihuProxy from '../../share/zhihu-proxy'
import noop from '../../share/noop'
import MDE from '../../share/MarkDownEditor'
import html2md from '../../share/html2md'
import md2html from '../../share/md2html'
import detect from './detect'
import './style.css'

export default function() {
  const type = 'question'
  let mde: MDE
  let textarea: HTMLTextAreaElement

  let initMDE = () => {
    initMDE = noop
    mde = new MDE(type)
    textarea = mde.textarea

    interface ICustomMouseEvent extends MouseEvent {
      __pass?: boolean
    }

    // 拦截问题提交
    document.addEventListener(
      'click',
      (event: ICustomMouseEvent) => {
        if (event.__pass) return
        const target = event.target as HTMLElement
        if (target.matches('.QuestionAsk .ModalButtonGroup .Button--primary')) {
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

  detect(container => {
    initMDE()

    textarea.placeholder = '问题背景、条件等详细信息'

    zhihuProxy('getDraft', type).then((draft: string) => {
      if (draft) {
        textarea.value = html2md(draft)
        // todo 需要一个 clearState 方法
        mde.saveState()
      }
      textarea.focus()
      mde.resize()
    }, noop)

    container.appendChild(textarea)
  })
}
