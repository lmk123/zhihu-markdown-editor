import './editor.scss'
import TinyMDE from 'tinymde'
// import zhihuProxy from './zhihu-proxy'
// import md2html from './md2html'

const toolbarPrefixes: { [type: string]: string | undefined } = {
  'question': '.QuestionAsk-DetailSection',
  'answer': '.AnswerForm-editor'
}

export default class MarkDownEditor extends TinyMDE {
  private removeListeners: () => void
  textarea: HTMLTextAreaElement

  constructor (type: string, onSave?: () => void) {
    const textarea = document.createElement('textarea')
    textarea.id = 'zhihu-md-tinymde'
    super(textarea, { onSave })
    this.textarea = textarea

    // region input 事件时做一些事情
    const onInput = () => {
      // 将  markdown 转换成 html 保存在知乎编辑器里
      // zhihuProxy('updateDraft', md2html(textarea.value))
      // 输入时自动撑高 textarea 的高度
      this.resize()
    }

    textarea.addEventListener('input', onInput)
    // endregion

    // region 拦截「插入链接」的表单提交
    const onSubmit = (event: Event) => {
      const target = event.target as Element
      if (target.matches('.LinkModal-form')) {
        event.preventDefault()
        event.stopPropagation()
        const inputs = target.querySelectorAll('.LinkModal-input input') as NodeListOf<HTMLInputElement>
        this.link(inputs[1].value, inputs[0].value)

        // 关闭弹层
        const modal = target.closest('.Modal-wrapper')
        if (modal) {
          const back = modal.querySelector('.Modal-backdrop')
          if (back) {
            (back as HTMLDivElement).click()
            return
          }
        }
        // 2333333
        window.alert('弹层似乎关不掉了，你自己关吧。')
      }
    }
    document.addEventListener('submit', onSubmit, true)
    // endregion

    // region 拦截工具栏
    const map: { [name: string]: () => void } = {
      '粗体': () => this.bold(),
      '斜体': () => this.italic(),
      '标题': () => this.heading(2),
      '引用块': () => this.quote(),
      '代码块': () => this.blockCode(),
      '有序列表': () => this.ol(),
      '无序列表': () => this.ul(),
      '上传图片': notSupportYet,
      '插入视频': notSupportYet,
      '插入公式': notSupportYet,
      '插入分割线': () => this.hr(),
      '清除格式': notSupportYet
    }

    const toolbarSelector = toolbarPrefixes[type] + ' .Editable-toolbar > button[aria-label]'
    const onClick = (event: MouseEvent) => {
      const btn = (event.target as Element).closest(toolbarSelector)
      if (btn) {
        const label = btn.getAttribute('aria-label') as string
        const func = map[label]
        if (func) {
          event.stopPropagation()
          func()
        }
      }
    }
    document.addEventListener('click', onClick, true)
    // endregion

    this.removeListeners = function () {
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('click', onClick, true)
      textarea.removeEventListener('input', onInput)
    }
  }

  // 自动撑高 textarea 的高度
  // https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
  resize () {
    const { textarea } = this
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  destroy () {
    this.removeListeners()
    super.destroy()

    const { textarea } = this
    const { parentNode } = textarea
    if (parentNode) {
      parentNode.removeChild(this.textarea)
    }
  }
}

function notSupportYet () {
  window.alert('暂不支持')
}
