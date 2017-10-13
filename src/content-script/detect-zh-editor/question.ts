// 检测「知乎问答」页面的编辑器
import { CSS_SELECTOR, detectEditor } from './meta'

export default function (): Promise<HTMLDivElement> {
  return new Promise((res, rej) => {
    // 对于没有回答过的问题，编辑器是一开始就有的
    const editor = document.querySelector(CSS_SELECTOR) as HTMLDivElement
    if (editor) {
      res(editor)
      return
    }

    // 对于回答过的问题，需要点击「修改」链接才会显示知乎编辑器
    function listenEdit (returnError = false) {
      const editLink = document.getElementsByClassName('AnswerItem-editButton')[0]

      if (editLink) {
        const handle = function () {
          editLink.removeEventListener('click', handle)
          window.setTimeout(() => {
            detectEditor().then(res, rej)
          }, 0)
        }
        editLink.addEventListener('click', handle)
        return true
      } else {
        if (returnError) {
          rej(new Error('没有找到知乎编辑器。'))
        } else {
          return false
        }
      }
    }

    // 在自己的问题下，「修改」一开始就是有的。
    // 如果没有，则监听「现有回答」的点击事件，之后「修改就会有了」
    if (!listenEdit()) {
      const showEditLink = document.querySelector('.QuestionAnswers-answerTipCard a')
      if (showEditLink) {
        const handle = function () {
          showEditLink.removeEventListener('click', handle)
          listenEdit(true)
        }
        showEditLink.addEventListener('click', handle)
      } else {
        rej(new Error('没有找到「现有回答」链接。'))
      }
    }
  })
}
