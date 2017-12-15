import zhihuProxy from '../utils/zhihu-proxy'
import noop from '../utils/noop'
import MDE from '../utils/editor'
import html2md from '../utils/html2md'
import md2html from '../utils/md2html'
import detect from './detect'
import './style.css'

const type = 'article'
let mde: MDE
let textarea: HTMLTextAreaElement

let initMDE = () => {
  initMDE = noop
  mde = new MDE(type, () => {
    const draft = md2html(textarea.value)
    zhihuProxy('saveDraft', type, draft).then(() => {
      zhihuProxy('hackDraft', type, draft).then(noop, noop)
    }, noop)
  })
  textarea = mde.textarea
}

detect(container => {
  initMDE()

  textarea.placeholder = '请输入正文'

  zhihuProxy('getDraft', type).then((draft: string) => {
    if (draft) {
      textarea.value = html2md(draft)
    }
    textarea.focus()
    mde.resize()
  }, noop)

  container.appendChild(textarea)
})
