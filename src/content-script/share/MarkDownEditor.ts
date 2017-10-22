import './editor.css'
import TinyMDE from 'tinymde'
import noop from './noop'

const toolbarPrefixes = {
  question: '.QuestionAsk-DetailSection',
  answer: '.AnswerForm-editor'
}

type TEditType = keyof typeof toolbarPrefixes

export default class MarkDownEditor extends TinyMDE {
  textarea: HTMLTextAreaElement

  constructor(type: TEditType, onSave = noop) {
    const textarea = document.createElement('textarea')
    textarea.className = 'zhihu-md-tinymde'
    super(textarea, { onSave })
    this.textarea = textarea

    // region 输入时自动撑高 textarea 的高度
    textarea.addEventListener('input', () => {
      this.resize()
    })
    // endregion

    // region 拦截「插入链接」的表单提交
    document.addEventListener(
      'submit',
      (event: Event) => {
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
              ;(back as HTMLDivElement).click()
              return
            }
          }
          // 2333333
          window.alert('弹层似乎关不掉了，你自己关吧。')
        }
      },
      true
    )
    // endregion

    // region 拦截工具栏
    const map = {
      粗体: () => this.bold(),
      斜体: () => this.italic(),
      标题: () => this.heading(2),
      引用块: () => this.quote(),
      代码块: () => this.blockCode(),
      有序列表: () => this.ol(),
      无序列表: () => this.ul(),
      上传图片: notSupportYet,
      插入视频: notSupportYet,
      插入公式: notSupportYet,
      插入分割线: () => this.hr(),
      清除格式: notSupportYet
    }

    type TMapAction = keyof typeof map

    const toolbarSelector = toolbarPrefixes[type] + ' .Editable-toolbar > button[aria-label]'
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
          const btn = (event.target as Element).closest('.QuestionAsk-sectionHeaderRight > button')
          if (btn) {
            // 第二个是图片，第三个是视频
            const i = Array.prototype.indexOf.call((btn.parentElement as HTMLElement).children, btn)
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
    // endregion

    // region 删除草稿后清空编辑器的内容
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
    // endregion
  }

  // 自动撑高 textarea 的高度
  // https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
  resize() {
    const { textarea } = this
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

function notSupportYet() {
  window.alert('暂不支持')
}
