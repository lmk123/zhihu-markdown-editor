import inj from './inject-script'

inj(() => {
  const formMap = {
    answer: 'form.AnswerForm',
    question: '.QuestionAsk form',
    article: '.Layout-main.av-card > div:last-child'
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

  function getArticleId() {
    const match = location.pathname.match(/^\/p\/(\d+)(\/edit)?$/)
    return match && match[1]
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
          return instance.state.draft || instance.props.defaultValue
        } else if (type === 'question') {
          return instance.props.detail
        } else if (type === 'article') {
          return instance.props.content
        }
      }
    },

    hackDraft(type: TType, draft: string) {
      const instance = getInstance(type)
      if (instance) {
        if (type === 'article') {
          instance.state.content = draft
        } else {
          const returnDraft = function() {
            return draft
          }
          if (type === 'answer') {
            instance.editable.toHTML = returnDraft
          } else if (type === 'question') {
            instance.state.detail.toHTML = returnDraft
          }
        }
      }
    },

    saveDraft(type: TType, draft: string) {
      const instance = getInstance(type)
      if (instance) {
        if (type === 'article') {
          instance.props.updateDraft(getArticleId(), { content: draft })
        } else {
          instance.updateDraft(draft)
        }
      }
    },

    replaceURL(type: string, url: string) {
      window.history.replaceState({}, '', url)
    }
  }

  window.addEventListener('message', event => {
    if (event.source !== window) return
    const { data } = event
    if (!data || data.from !== 'content-script') return

    const func = methods[data.method]
    if (func) {
      Promise.resolve(func(data.type, ...data.params)).then(
        result => {
          window.postMessage(
            {
              from: 'proxy',
              id: data.id,
              result
            },
            '*'
          )
        },
        err => {
          console.error(err)
        }
      )
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
