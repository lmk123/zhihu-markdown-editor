/**
 * 插入一段代码或者一个函数到宿主页面中。
 * @example
 *  injectScript('alert("hi")')
 *  injectScript(function () { alert('hi') })
 */
export default function (code: string | (() => void)) {
  let codeString: string
  if (typeof code === 'function') {
    codeString = code.toString()
  } else {
    codeString = `function(){${code}}`
  }
  const script = document.createElement('script')
  script.textContent = `(${codeString})()`
  document.head.appendChild(script)
}
