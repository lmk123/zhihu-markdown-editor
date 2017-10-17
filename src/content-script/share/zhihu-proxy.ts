import inj from './inject-script'

inj(() => {
  window.addEventListener('message', event => {
    if (event.source !== window) return
    const { data } = event
    if (!data || data.from !== 'content-script') return

    Promise.resolve(methods[data.method](data.type, ...data.params)).then(result => {
      window.postMessage({
        from: 'proxy',
        id: data.id,
        result
      }, '*')
    })
  })

  type TMethods = {
    [method: string]: (...args: any[]) => any | Promise<any>
  }

  const methods: TMethods = {
    getDraft (type: string) {
      const instance = getInstance(type)
      if (instance) {
        if (type === 'answer') {
          return instance.state.draft
        } else if (type === 'question') {
          return instance.props.detail
        }
      }
    },

    hackDraft (type: string, draft: string) {
      const instance = getInstance(type)
      if (instance) {
        const returnDraft = function () {
          return draft
        }
        if (type === 'answer') {
          // 提交时会从这个方法里读取编辑器当前的 HTML，这里直接把这个方法给替换掉
          instance.editable.toHTML = returnDraft
        } else if (type === 'question') {
          instance.state.detail.toHTML = returnDraft
        }
      }
    },

    saveDraft (type: string, draft: string) {
      const instance = getInstance(type)
      if (instance) {
        instance.updateDraft(draft)
      }
    }
  }

  const formMap: { [type: string]: string } = {
    answer: 'form.AnswerForm',
    question: '.QuestionAsk form'
  }

  function getInstance (type: string) {
    // 无论是问题还是答案，react 实例都挂在它们最近的 form 父元素上
    const formEle = document.querySelector(formMap[type])
    if (formEle) {
      const reactKey = Object.keys(formEle).find(key => key.startsWith('__reactInternalInstance$'))
      if (reactKey) {
        return (formEle as { [prop: string]: any } )[reactKey]._currentElement._owner._instance
      }
    }
  }
}, 'zhihu-proxy')

let seed = 0

type TWaitingResponse = {
  [id: string]: (result: any) => void
}

const waitingResponseMessages: TWaitingResponse = {}

window.addEventListener('message', function handler (event) {
  if (event.source !== window) return
  const { data } = event
  if (!data || data.from !== 'proxy') return
  const { id } = data
  const resolve = waitingResponseMessages[id]
  if (resolve) {
    delete waitingResponseMessages[id]
    resolve(data.result)
  }
})

export default function (method: string, type: string, ...params: any[]) {
  return new Promise(resolve => {
    const msgId = type + '-' + seed++

    waitingResponseMessages[msgId] = resolve

    window.postMessage({
      from: 'content-script',
      id: msgId,
      method,
      type,
      params
    }, '*')
  })
}
