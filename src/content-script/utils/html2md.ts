import * as toMarkdown from 'to-markdown'

const { indexOf } = Array.prototype

const options = {
  gfm: true,
  converters: [
    {
      // 默认的情况下会给无序/有序列表的符号后面加上三个空格。这里改为只加一个。
      filter: 'li',
      replacement(innerHTML: string, node: HTMLLIElement) {
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
      replacement(innerHTML: string, node: HTMLPreElement) {
        return '```' + node.lang + '\n' + innerHTML + '\n```'
      }
    }
  ]
}

export default function(html: string, raw?: boolean) {
  if (raw) {
    html = normal(html)
  }
  return toMarkdown(html, options)
}

const linkReg = /href="https:\/\/link\.zhihu\.com\/\?target=([^"]+)"/g
const codeBlockReg = /<div class="highlight"><pre><code class="language-([^"]+?)">([\s\S]*?)<\/code><\/pre><\/div>/g
const htmlReg = /<\/?[^>]+?>/g

function normal(html: string) {
  // 去掉知乎的链接前缀
  html = html.replace(linkReg, (match, link) => {
    return `href="${decodeURIComponent(link)}"`
  })
  // 去掉代码块的 html 结构体
  html = html.replace(codeBlockReg, (match, lang, code) => {
    code = code.replace(htmlReg, '')
    if (code.endsWith('\n')) {
      code = code.slice(0, -1)
    }
    return `<pre lang="${lang}">${code}</pre>`
  })
  return html
}
