/**
 * 插入一段代码或者一个函数到宿主页面中。
 * 使用第二个参数作为 script 的 id，如果 id 相同则不会重新插入。
 * @example
 *  injectScript('alert("hi")', 'myscript')
 *  injectScript(function () { alert('hi') }, 'myscript')
 */
export default function (code: string | (() => void), id: string) {
  if (document.getElementById(id)) return
  let codeString: string
  if (typeof code === 'function') {
    codeString = code.toString()
  } else {
    codeString = `function(){${code}}`
  }
  const script = document.createElement('script')
  script.id = id
  script.textContent = `(${codeString})()`
  document.head.appendChild(script)
}
