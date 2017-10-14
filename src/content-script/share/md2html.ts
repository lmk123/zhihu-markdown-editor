import * as marked from 'marked'

const nReg = /\n/g

const zhMarkedRenderer = new marked.Renderer()

const brStr = '<br>'
const brLength = brStr.length

function removeLastBr (str: string) {
  if (str.endsWith(brStr)) {
    return str.slice(0, -brLength)
  }
  return str
}

// 去掉标题的 id 属性
zhMarkedRenderer.heading = (text, level) => `<h${level}>${text}</h${level}>`

// 替换掉代码块
zhMarkedRenderer.code = (code, language = 'text') => `<pre lang="${language}">${removeLastBr(code.replace(nReg, brStr))}</pre>`

// 知乎是用 <br> 分隔引用块里面的段落的
zhMarkedRenderer.blockquote = quote => {
  // 去掉 p 标签的包裹
  quote = quote.replace(/<p>/g, '')
  quote = quote.replace(/<\/p>/g, brStr)
  // 换行符换成 <br>
  quote = quote.replace(nReg, brStr)

  return `<blockquote>${quote}</blockquote>`
}

zhMarkedRenderer.strong = text => `<b>${text}</b>`
zhMarkedRenderer.em = text => `<i>${text}</i>`

const options = {
  renderer: zhMarkedRenderer,
  tables: false,
  sanitize: true
}

export default function (markDown: string) {
  return marked(markDown, options).replace(nReg, '')
}
