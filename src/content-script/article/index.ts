import zhihuProxy from '../share/zhihu-proxy'
import noop from '../share/noop'
import MDE from '../share/MarkDownEditor'
import html2md from '../share/html2md'
import md2html from '../share/md2html'
import detect from './detect'
import './style.scss'

const type = 'article'
let mde: MDE
let textarea: HTMLTextAreaElement

let initMDE = () => {
  initMDE = noop
  mde = new MDE(type, () => {
    zhihuProxy('saveDraft', type, md2html(textarea.value))
  })
  textarea = mde.textarea
}

detect((container) => {
  initMDE()

  textarea.placeholder = '请输入正文'

  zhihuProxy('getDraft', type).then((draft: string) => {
    if (draft) {
      textarea.value = html2md(draft)
    }
    textarea.focus()
    mde.resize()
  })

  container.appendChild(textarea)
})
