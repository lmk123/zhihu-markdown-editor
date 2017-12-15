/**
 * 插入一段代码或者一个函数到宿主页面中。
 * @example
 *  injectScript('alert("hi")')
 *  injectScript(function () { alert('hi') })
 */
export default function(code: () => void) {
  const script = document.createElement('script')
  script.textContent = `(${code.toString()})()`
  document.head.appendChild(script)
}
