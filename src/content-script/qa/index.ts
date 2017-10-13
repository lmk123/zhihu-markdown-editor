import detect from './detect'
import MDE from '../share/MarkDownEditor'

detect().then(info => {
  const mde = new MDE()
  ;(info.editor.parentElement as Element).appendChild(mde.textarea)
})
