import * as toMarkdown from 'to-markdown'

const { indexOf } = Array.prototype

const options = {
  gfm: true,
  converters: [
    {
      // 默认的情况下会给无序/有序列表的符号后面加上三个空格。这里改为只加一个。
      filter: 'li',
      replacement (innerHTML: string, node: HTMLLIElement) {
        const { parentElement } = node

        if (parentElement) {
          const { tagName } = parentElement

          if (tagName === 'UL') {
            return '- ' + innerHTML
          }

          if (tagName === 'OL') {
            const i = indexOf.call(parentElement.children, node) + 1
            return `${i}. ${innerHTML}`
          }
        }

        return node.outerHTML
      }
    },
    {
      filter: 'pre',
      replacement (innerHTML: string, node: HTMLPreElement) {
        return '```' + node.lang + '\n' + innerHTML + '\n```'
      }
    }
  ]
}

export default function (html: string) {
  return toMarkdown(html, options)
}
