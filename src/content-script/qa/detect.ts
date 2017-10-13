// 检测知乎问答的编辑器
import testElement from '../share/test-element'

export default function (onEditorShow: (editor: HTMLDivElement) => void) {
  // 如果问题已经回答过了，则每次用户点了「修改」之后，知乎编辑器都会出现
  if (document.querySelector('.QuestionAnswers-answerTipCard') || document.querySelector('.QuestionAnswer-content')) {
    document.addEventListener('click', function (event: MouseEvent) {
      const editLink = (event.target as Element).closest('.AnswerItem-editButton')
      if (editLink) {
        testElement('.Input.Editable').then((container: HTMLDivElement) => {
          onEditorShow(container)
        })
      }
    })
    return true
  }

  testElement('.Input.Editable').then((container: HTMLDivElement) => {
    onEditorShow(container)
  })

  return false
}
