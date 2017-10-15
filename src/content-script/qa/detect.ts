// 检测知乎问答的编辑器
import testElement from '../share/test-element'

// 列表页：url 路径是 /question/342342423 这样的形式
// 答案页：url 路径是 /question/342342423/answer/34242423 这样的形式
// 如果用户一开始进入的是列表页：
//   - 如果用户没有回答过这个问题，则网页上会有 .QuestionAnswers-answerAdd
//   - 如果用户回答过这个问题，则网页上会有「现有回答」这个链接，点击之后会 pushState 到答案页，此时的答案页会有「修改」链接
// 如果用户一开始进入的是答案页：
//   - 如果用户进入的这个答案是别人的回答，则点击「写回答」后会 pushState 到列表页，此时可以根据列表页的规则判断用户是否回答过
//   - 如果这个答案是用户自己写的，则会有「修改」链接

// todo 编辑器的判断有问题要重写
export default function (onEditorShow: (editor: HTMLDivElement) => void) {
  // 先判断页面上有没有 .AnswerForm，有则说明用户进入的是


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
