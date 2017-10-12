export type TAdapter = () => Promise<HTMLDivElement>

export const CSS_SELECTOR = '.Dropzone.RichText'

export const detectEditor = function (): Promise<HTMLDivElement> {
  return new Promise((res, rej) => {
    const editor = document.querySelector(CSS_SELECTOR) as (HTMLDivElement | null)
    if (editor) {
      res(editor)
    } else {
      rej(new Error('没有找到知乎编辑器。'))
    }
  })
}
