import testElement from '../share/test-element'

const editorContainer = '.Input.Editable'
const editPostReg = /^\/p\/\d+\/edit$/

export default function (onEditorShow: (container: Element) => void) {
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
    const { pathname } = new URL(location.href)
    if (pathname === '/write' || editPostReg.test(pathname)) {
      testElement(editorContainer).then(el => {
        onEditorShow(el)
      })
    }
  }
}
