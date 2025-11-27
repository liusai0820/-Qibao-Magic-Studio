import { HttpsProxyAgent } from 'https-proxy-agent'

export function getProxyAgent() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  if (proxyUrl) {
    return new HttpsProxyAgent(proxyUrl)
  }
  return undefined
}
