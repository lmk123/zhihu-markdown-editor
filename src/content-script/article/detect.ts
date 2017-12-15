import noop from '../utils/noop'
import testElement from '../utils/test-element'

const editorContainer = '.Input.Editable'
const editPostReg = /^\/p\/\d+\/edit$/

export default function (onEditorShow: (container: Element) => void) {
  // TODO: 这段代码不能在内容脚本里 hack，无效
  const { pushState, replaceState } = window.history

  window.history.pushState = function () {
    pushState.apply(this, arguments)
    detect()
  }

  window.history.replaceState = function () {
    replaceState.apply(this, arguments)
    detect()
  }

  detect()

  function detect () {
    console.log('detect')
    const { pathname } = window.location
    if (pathname === '/write' || editPostReg.test(pathname)) {
      testElement(editorContainer).then(el => {
        onEditorShow(el)
      }, noop)
    }
  }
}
