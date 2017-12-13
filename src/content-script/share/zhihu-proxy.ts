import inj from './inject-script'

inj(() => {
  const formMap = {
    answer: 'form.AnswerForm',
    question: '.QuestionAsk form'
  }

  type TType = keyof typeof formMap

  function getInstance(type: TType) {
    const formEle = document.querySelector(formMap[type])
    if (formEle) {
      const reactKey = Object.keys(formEle).find(key =>
        key.startsWith('__reactInternalInstance$')
      )
      if (reactKey) {
        return (formEle as { [prop: string]: any })[reactKey]._currentElement
          ._owner._instance
      }
    }
  }

  type TMethods = {
    [method: string]:
      | ((type: TType, ...args: any[]) => any | Promise<any>)
      | undefined
  }

  const methods: TMethods = {
    getDraft(type: TType) {
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

    hackDraft(type: TType, draft: string) {
      const instance = getInstance(type)
      if (instance) {
        const returnDraft = function() {
          return draft
        }
        if (type === 'answer') {
          instance.editable.toHTML = returnDraft
        } else if (type === 'question') {
          instance.state.detail.toHTML = returnDraft
        }
      }
    },

    saveDraft(type: TType, draft: string) {
      const instance = getInstance(type)
      if (instance) {
        instance.updateDraft(draft)
      }
    }
  }

  window.addEventListener('message', event => {
    if (event.source !== window) return
    const { data } = event
    if (!data || data.from !== 'content-script') return

    const func = methods[data.method]
    if (func) {
      Promise.resolve(func(data.type, ...data.params)).then(result => {
        window.postMessage(
          {
            from: 'proxy',
            id: data.id,
            result
          },
          '*'
        )
      })
    }
  })
})

let seed = 0

interface IWaitingResponse {
  [id: string]: (result: any) => void
}

const waitingResponseMessages: IWaitingResponse = {}

window.addEventListener('message', function(event) {
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

export default function(
  method: string,
  type: string,
  ...params: any[]
): Promise<string> {
  return new Promise(resolve => {
    const msgId = type + '-' + seed++

    waitingResponseMessages[msgId] = resolve

    window.postMessage(
      {
        from: 'content-script',
        id: msgId,
        method,
        type,
        params
      },
      '*'
    )
  })
}
