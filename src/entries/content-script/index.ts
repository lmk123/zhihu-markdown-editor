// TODO 黑名单功能
// TODO 快捷键支持
import TinyMDE from 'tinymde'
import * as marked from 'marked'
import './style.scss'
import detectEditor from './detect-zh-editor'
import * as api from './api'

detectEditor(new URL(window.location.href).pathname === '/write' ? 'zhuanlan' : 'question')
  .then(editor => {
    const mde = new TinyMDE(textarea => {
      textarea.id = 'zhihu-md-tinymde'
      textarea.addEventListener('change', () => {
        console.log(textarea.value)
        api.updateQuestionDraft('64898551', marked(textarea.value))
      })
      ;(editor.parentElement as Element).appendChild(textarea)
    })

    function notSupportYet () {
      window.alert('暂不支持')
    }

    const map: { [name: string]: () => void } = {
      '粗体': () => mde.bold(),
      '斜体': () => mde.italic(),
      '标题': () => mde.heading(1),
      '引用块': () => mde.quote(),
      '代码块': () => mde.blockCode(),
      '有序列表': () => mde.ol(),
      '无序列表': () => mde.ul(),
      '上传图片': notSupportYet,
      '插入视频': notSupportYet,
      '插入公式': notSupportYet,
      '插入分割线': () => mde.hr(),
      '清除格式': notSupportYet
    }

    // 拦截工具条上的按钮功能
    document.addEventListener('click', (event: MouseEvent) => {
      const btn = (event.target as Element).closest('.Editable-toolbar > button[aria-label]')
      if (btn) {
        const label = btn.getAttribute('aria-label') as string
        const func = map[label]
        if (func) {
          event.stopPropagation()
          func()
        }
      }
    }, true)

    // 拦截「插入链接」的表单提交
    document.addEventListener('submit', (event) => {
      const target = event.target as Element
      if (target.matches('.LinkModal-form')) {
        event.preventDefault()
        event.stopPropagation()
        const inputs = target.querySelectorAll('.LinkModal-input input') as NodeListOf<HTMLInputElement>
        mde.link(inputs[1].value, inputs[0].value)

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
    }, true)
  })
