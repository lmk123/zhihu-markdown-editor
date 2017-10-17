import inj from './inject-script'

inj(() => {
  window.addEventListener('message', event => {
    if (event.source !== window) return
    const { data } = event
    if (!data || data.from !== 'content-script') return

    Promise.resolve(methods[data.method](...data.params)).then(result => {
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
        return instance.state.draft
      }
    },

    hackDraft (type: string, draft: string) {
      const instance = getInstance(type)
      if (instance) {
        // 提交时会从这个方法里读取编辑器当前的 HTML，这里直接把这个方法给替换掉
        instance.editable.toHTML = function () {
          return draft
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

  function getInstance (type: string) {
    if (type === 'answer') {
      const formEle = document.querySelector('form.AnswerForm')
      if (formEle) {
        const reactKey = Object.keys(formEle).find(key => key.startsWith('__reactInternalInstance$'))
        if (reactKey) {
          return (formEle as { [prop: string]: any } )[reactKey]._currentElement._owner._instance
        }
      }
    }
  }
})

let seed = 0

type TWaitingResponse = {
  [id: number]: (result: any) => void
}

const waitingResponseMessages: TWaitingResponse = {}

window.addEventListener('message', function handler (event) {
  const { data } = event
  if (!data || data.from !== 'proxy') return
  const { id } = data
  const resolve = waitingResponseMessages[id]
  if (resolve) {
    delete waitingResponseMessages[id]
    resolve(data.result)
  }
})

export default function (method: string, ...params: any[]) {
  return new Promise(resolve => {
    const msgId = seed++

    waitingResponseMessages[msgId] = resolve

    window.postMessage({
      from: 'content-script',
      id: msgId,
      method,
      params
    }, '*')
  })
}
