// 检测知乎问答的编辑器
import testElement from '../../share/test-element'

const editorContainer = '.Input.Editable'

/*
 * 列表页：url 路径是 /question/342342423 这样的形式
 * 答案页：url 路径是 /question/342342423/answer/34242423 这样的形式
 *
 * 如果用户一开始进入的是列表页：
 *   - 如果用户没有回答过这个问题，则网页上会有 .QuestionAnswers-answerAdd
 *   - 如果用户回答过这个问题，则网页上会有「现有回答」这个链接，点击之后会 pushState 到答案页，此时的答案页会有「修改」链接
 *
 * 如果用户一开始进入的是答案页：
 *   - 如果用户进入的这个答案是别人的回答，则点击「写回答」后会 pushState 到列表页，此时可以根据列表页的规则判断用户是否回答过
 *   - 如果这个答案是用户自己写的，则会有「修改」链接
 */

function tryGetRawHtml (editLink: Element) {
  let rawHtml: string | undefined
  const richContainer = editLink.closest('.RichContent')
  if (richContainer) {
    const innerContainer = richContainer.querySelector('.CopyrightRichText-richText')
    if (innerContainer) {
      rawHtml = innerContainer.innerHTML
    }
  }
  if (rawHtml === undefined) {
    window.alert('无法获取已回答内容，可能是页面结构发生了变化。')
  }
  return rawHtml
}

function tryGetAnswerId (editLink: Element): string {
  const item = editLink.closest('.ContentItem.AnswerItem') as HTMLElement
  if (item) {
    return JSON.parse(item.dataset.zop as string).itemId
  }
  const msg = '无法获取问题的 id，可能是页面结构发生了变化'
  window.alert(msg)
  throw new Error(msg)
}

export default function (onEditorShow: (container: Element, answered: boolean, rawHtml?: string, aid?: string) => void) {
  // 无论是那种情况，点了「修改」之后都一定会出现编辑器
  document.addEventListener('click', function (event: MouseEvent) {
    const editLink = (event.target as Element).closest('.AnswerItem-editButton')
    if (editLink) {
      // 先尝试获取已回答的内容
      const rawHtml = tryGetRawHtml(editLink)
      const aid = tryGetAnswerId(editLink)

      testElement(editorContainer).then(container => {
        onEditorShow(container, true, rawHtml, aid)
      })
    }
  })

  // 如果进入的是列表页且问题没有回答过，则一开始就会有编辑器
  const answerRoot = document.querySelector('.QuestionAnswers-answerAdd')
  if (answerRoot) {
    testElement(editorContainer, answerRoot).then(container => {
      onEditorShow(container, false)
    })
  } else {
    // 等待用户点击「写回答」按钮，点击之后判断出现的是已回答的提示还是编辑器
    const writeAnswer = document.querySelector('.QuestionHeader-footer .QuestionButtonGroup button:last-child')
    if (writeAnswer) {
      writeAnswer.addEventListener('click', () => {
        window.setTimeout(() => {
          testElement('.QuestionAnswers-answerTipCard,' + editorContainer).then(el => {
            if (el.matches(editorContainer)) {
              onEditorShow(el as HTMLDivElement, false)
            }
          })
        }, 0)
      })
    } else {
      window.alert('无法检测知乎编辑器，可能是知乎的页面结构发生了变化。')
    }
  }
}
