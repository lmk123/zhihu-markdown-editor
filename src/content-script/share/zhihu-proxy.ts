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
          // 先获取草稿，如果没有则获取已经回答过的答案
          return instance.state.draft || instance.props.defaultValue
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
