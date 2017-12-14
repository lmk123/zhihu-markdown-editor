import './editor.css'
import TinyMDE from 'tinymde'
import hotkey from './hotkey'
import noop from './noop'

const toolbarPrefixes = {
  question: '.QuestionAsk-DetailSection',
  answer: '.AnswerForm-editor'
}

type TEditType = keyof typeof toolbarPrefixes

let cloneTextarea: HTMLTextAreaElement

export default class MarkDownEditor extends TinyMDE {
  textarea: HTMLTextAreaElement

  constructor(type: TEditType, onSave = noop) {
    const textarea = document.createElement('textarea')
    textarea.className = 'zhihu-md-tinymde'
    super(textarea, { onSave })
    this.textarea = textarea

    // 输入时自动撑高 textarea 的高度
    textarea.addEventListener('input', () => {
      this.resize()
    })

    const map = {
      粗体: () => this.bold(),
      斜体: () => this.italic(),
      标题: () => this.heading(2),
      引用块: () => this.quote(),
      代码块: () => this.blockCode(),
      有序列表: () => this.ol(),
      无序列表: () => this.ul(),
      插入链接: () => this.link(),
      上传图片: notSupportYet,
      上传视频: notSupportYet,
      插入公式: notSupportYet,
      插入分割线: () => this.hr(),
      清除格式: notSupportYet,
      // 界面上没有下面两个按钮，写在这里是为了兼容快捷键
      撤销: () => this.undo(),
      重做: () => this.redo()
    }

    type TMapAction = keyof typeof map

    // 快捷键
    hotkey(textarea, label => {
      map[label]()
    })

    // 拦截工具栏
    const toolbarSelector =
      toolbarPrefixes[type] + ' .Editable-toolbar > button[aria-label]'
    document.addEventListener(
      'click',
      event => {
        const btn = (event.target as Element).closest(toolbarSelector)
        if (btn) {
          const label = btn.getAttribute('aria-label') as TMapAction
          const func = map[label]
          if (func) {
            event.stopPropagation()
            func()
          }
        }
      },
      true
    )
    // 「问题」还有两个额外的按钮
    if (type === 'question') {
      document.addEventListener(
        'click',
        event => {
          const btn = (event.target as Element).closest(
            '.QuestionAsk-sectionHeaderRight > button'
          )
          if (btn) {
            // 第二个是图片，第三个是视频
            const i = Array.prototype.indexOf.call(
              (btn.parentElement as HTMLElement).children,
              btn
            )
            switch (i) {
              case 1:
                event.stopPropagation()
                map['上传图片']()
                break
              case 2:
                event.stopPropagation()
                map['插入视频']()
                break
            }
          }
        },
        true
      )
    }

    // 删除草稿后清空编辑器的内容
    document.addEventListener('click', event => {
      const target = event.target as Element
      const modalInner = target.closest('.Modal-inner')
      if (modalInner) {
        const modalTitle = modalInner.querySelector('.Modal-title')
        if (modalTitle && modalTitle.textContent === '清除草稿') {
          textarea.value = ''
        }
      }
    })
  }

  // 自动撑高 textarea 的高度
  // https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
  resize() {
    // 直接把原来的 textarea 设置 `height = 'auto'` 会导致浏览器跳回到文本框第一行的位置，
    // 所以这里用了一个复制出来的 textarea
    if (!cloneTextarea) {
      cloneTextarea = document.createElement('textarea')
      cloneTextarea.className = 'zhihu-md-tinymde'
      cloneTextarea.style.height = 'auto'
    }
    const { textarea } = this
    const parent = textarea.parentElement as Element
    parent.appendChild(cloneTextarea)
    cloneTextarea.value = textarea.value
    textarea.style.height = cloneTextarea.scrollHeight + 'px'
    parent.removeChild(cloneTextarea)
  }
}

function notSupportYet() {
  window.alert('暂不支持')
}
