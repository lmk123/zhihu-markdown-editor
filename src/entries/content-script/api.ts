export function updateQuestionDraft (questionId: string, content: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('put', `/api/v4/questions/${questionId}/draft`)
    xhr.responseType = 'json'
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.addEventListener('load', () => {
      resolve(xhr.response)
    })
    xhr.addEventListener('error', () => {
      reject(new Error('保存草稿失败。'))
    })
    xhr.send(JSON.stringify({ content }))
  })
}
