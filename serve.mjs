import { createServer } from 'http'
import { readFile }     from 'fs/promises'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const PORT = 3000

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.wav':  'audio/wav',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
}

createServer(async (req, res) => {
  let pathname = decodeURIComponent(req.url.split('?')[0])
  if (pathname === '/' || pathname === '') pathname = '/index.html'

  const file = join(ROOT, pathname)
  try {
    const data        = await readFile(file)
    const ext         = extname(file).toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'
    const fileSize    = data.length

    const rangeHeader = req.headers.range
    if (rangeHeader) {
      const [s, e]  = rangeHeader.replace(/bytes=/, '').split('-')
      const start   = parseInt(s, 10)
      const end     = e ? parseInt(e, 10) : fileSize - 1
      res.writeHead(206, {
        'Content-Type':   contentType,
        'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': end - start + 1,
        'Accept-Ranges':  'bytes',
      })
      res.end(data.slice(start, end + 1))
    } else {
      res.writeHead(200, {
        'Content-Type':   contentType,
        'Content-Length': fileSize,
        'Accept-Ranges':  'bytes',
      })
      res.end(data)
    }
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
