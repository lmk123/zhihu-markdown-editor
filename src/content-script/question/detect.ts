import noop from '../share/noop'
import testElement from '../share/test-element'

const editorContainer = '.QuestionAsk-DetailSection .Input.Editable'

export default function(onEditorShow: (container: Element) => void) {
  // 点击「修改」和「提问」后都会出现编辑器弹层
  document.addEventListener('click', event => {
    const target = event.target as Element
    const editOrAsk = target.closest('.QuestionHeader-edit, .QuestionAskButton')
    if (editOrAsk) {
      testElement(editorContainer).then(el => {
        onEditorShow(el)
      }, noop)
    }
  })
}
