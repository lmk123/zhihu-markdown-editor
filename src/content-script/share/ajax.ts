export type TAjaxOptions = {
  method?: string
  url: string,
  responseType?: XMLHttpRequestResponseType
  body?: any
}

export default function (options: string | TAjaxOptions) {
  return new Promise((resolve, reject) => {
    if (typeof options === 'string') {
      options = {
        url: options
      }
    }

    const xhr = new XMLHttpRequest()
    xhr.open(options.method || 'get', options.url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.responseType = options.responseType || 'json'
    xhr.onload = () => {
      resolve(xhr.response)
    }
    xhr.onerror = () => {
      reject()
    }
    xhr.send(options.body || null)
  })
}
