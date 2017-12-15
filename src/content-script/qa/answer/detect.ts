import noop from '../../utils/noop'
import testElement from '../../utils/test-element'

const editorContainer = '.AnswerForm-editor .Input.Editable'

// 页面上一开始没有编辑器，点击「写回答」后才会显示编辑器；
// 如果问题已经回答过，则点击「查看回答」会显示自己的答案，点击修改后会显示编辑器。
export default function(
  onEditorShow: (container: Element, answered: boolean) => void
) {
  function testEditorContainer(isModify: boolean) {
    testElement(editorContainer).then(el => {
      if (el.matches(editorContainer)) {
        onEditorShow(el as HTMLDivElement, isModify)
      }
    }, noop)
  }

  // 无论是哪种情况，点了「修改」之后都会出现编辑器
  document.addEventListener('click', function(event: MouseEvent) {
    const editLink = (event.target as Element).closest('.AnswerItem-editButton')
    if (editLink) {
      testEditorContainer(true)
    }
  })

  const writeAnswerBtns = document.querySelectorAll(
    '.QuestionButtonGroup > .Button:last-child'
  )

  if (writeAnswerBtns.length) {
    switch (writeAnswerBtns[0].textContent) {
      case '写回答':
        const onWriteClick = () => {
          window.setTimeout(() => {
            testEditorContainer(false)
          }, 0)
        }
        Array.prototype.forEach.call(writeAnswerBtns, (btn: Element) => {
          btn.addEventListener('click', onWriteClick)
        })
        return
      case '编辑回答':
        testEditorContainer(true)
        return
      case '查看回答':
        return
    }
  }

  window.alert('无法检测知乎编辑器，可能是知乎的页面结构发生了变化。')
}
