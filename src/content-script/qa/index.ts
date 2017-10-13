import detect from './detect'
import MDE from '../share/MarkDownEditor'

type TInfo = {
  id: string
  aid?: string
}

const qaReg = /\d+/g
let mde: MDE
let info: TInfo

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

detect(editor => {
  if (!mde) {
    mde = new MDE()
  }

  if (!info) {
    info = parseQA()
  }

  (editor.parentElement as Element).appendChild(mde.textarea)
})
