/**
 * 不断测试某个元素是否存在
 */
export default function (selector: string, context: Element | Document = document, interval = 100, retry = 20): Promise<Element> {
  return new Promise((resolve, reject) => {
    let count = 0

    isExist()

    function isExist () {
      const el = context.querySelector(selector)
      if (el) {
        resolve(el)
      } else {
        window.setTimeout(() => {
          count += 1
          if (count >= retry) {
            reject()
            return
          }
          isExist()
        }, interval)
      }
    }
  })
}
