import puppeteer from 'puppeteer'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('.', import.meta.url))
const DIR  = join(ROOT, 'temporary screenshots')
if (!existsSync(DIR)) mkdirSync(DIR)

const url    = process.argv[2] || 'http://localhost:3000'
const label  = process.argv[3] ? `-${process.argv[3]}` : ''
const n      = readdirSync(DIR).filter(f => f.startsWith('screenshot-')).length + 1
const out    = join(DIR, `screenshot-${n}${label}.png`)

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
await new Promise(r => setTimeout(r, 5000)) // allow WebGL smoke to fade in
await page.screenshot({ path: out, fullPage: true })
await browser.close()

console.log(`screenshot-${n}${label}.png`)
