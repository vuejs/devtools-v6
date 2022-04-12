export const parseURL = (resourceQuery) => {
  const options = {}

  if (typeof resourceQuery === 'string' && resourceQuery !== '') {
    const searchParams = resourceQuery.substr(1).split('&')

    for (let i = 0; i < searchParams.length; i++) {
      const pair = searchParams[i].split('=')

      options[pair[0]] = decodeURIComponent(pair[1])
    }
  }

  return options
}

export const makeUrl = (baseUrl: string, query: unknown = {}) => {
  let fullUrl = baseUrl

  const keys = Object.keys(query)
  for (const [i, key] of keys.entries()) {
    if (i === 0) {
      if (fullUrl.indexOf('?') === -1) {
        fullUrl += '?'
      }
    } else {
      fullUrl += '&'
    }
    fullUrl += `${key}=${encodeURIComponent(query[key])}`
  }
  return fullUrl
}

export const getWSProtocolByHttpProtocol = (httpProtocol: string) =>
  ({
    https: 'wss',
    http: 'ws',
  }[httpProtocol] || 'ws')
