import noop from '../utils/noop'
import testElement from '../utils/test-element'
import inj from '../utils/inject-script'

inj(() => {
  function send() {
    setTimeout(() => {
      window.postMessage(
        {
          from: 'article'
        },
        '*'
      )
    }, 0)
  }
  const { replaceState, pushState } = history
  history.replaceState = function(...args: any[]) {
    send()
    return replaceState.apply(this, args)
  }
  history.pushState = function(...args: any[]) {
    send()
    return pushState.apply(this, args)
  }
})

const editorContainer = '.Input.Editable'
const editPostReg = /^\/p\/\d+\/edit$/

export default function(onEditorShow: (container: Element) => void) {
  window.addEventListener('message', event => {
    if (event.source !== window) return
    const { data } = event
    if (!data || data.from !== 'article') return
    detect()
  })

  detect()

  function detect() {
    const { pathname } = window.location
    if (pathname === '/write' || editPostReg.test(pathname)) {
      testElement(editorContainer).then(el => {
        onEditorShow(el)
      }, noop)
    }
  }
}
