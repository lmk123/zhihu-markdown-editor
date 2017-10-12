import zhuanlan from './zhuanlan'
import question from './question'
import { TAdapter } from './meta'

const adapters: { [type: string]: TAdapter } = {
  zhuanlan,
  question
}

export default function (type: string) {
  const adapter = adapters[type]
  if (adapter) {
    return adapter()
  } else {
    return Promise.reject(new Error('未知的知乎页面类型。'))
  }
}
