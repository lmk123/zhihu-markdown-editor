// 检测知乎问答的编辑器
import getZHEditor from '../share/get-zh-editor'

export default function (onEditorShow: (editor: HTMLDivElement) => void) {
  // 如果问题还没有回答过，则知乎编辑器是一开始就有的
  const editor = getZHEditor()
  if (editor) {
    onEditorShow(editor)
    return
  }

  // 如果问题已经回答过了，则每次用户点了「修改」链接之后，知乎编辑器都会出现
  document.addEventListener('click', function (event: MouseEvent) {
    const editLink = (event.target as Element).closest('.AnswerItem-editButton')
    if (editLink) {
      const editor = getZHEditor()
      if (editor) {
        onEditorShow(editor)
      } else {
        throw new Error('无法检测到知乎编辑器，可能是页面结构发生了变化。')
      }
    }
  })
}
