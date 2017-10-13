import ajax from '../share/ajax'

export function getDraft (id: string) {
  return ajax(`/api/v4/questions/${id}/draft?include=question`)
    .then((res: { content: string }) => res.content)
}

export function saveDraft (id: string, content: string) {
  return ajax({
    method: 'put',
    url: `/api/v4/questions/${id}/draft?include=question`,
    body: JSON.stringify({ content })
  })
}

export function editAnswer (aid: string, content: string) {
  return ajax({
    method: 'put',
    url: `/api/v4/answers/${aid}`,
    body: JSON.stringify({ content })
  })
}
