import { readFileSync, writeFileSync } from 'fs'
import { PNG } from 'pngjs'

function rotateCW(png) {
  // 90° clockwise: new_row = old_col, new_col = (oldHeight-1) - old_row
  const out = new PNG({ width: png.height, height: png.width })
  out.data = Buffer.alloc(out.width * out.height * 4)
  for (let r = 0; r < png.height; r++) {
    for (let c = 0; c < png.width; c++) {
      const si = (r * png.width + c) * 4
      const nr = c
      const nc = png.height - 1 - r
      const di = (nr * out.width + nc) * 4
      out.data[di]   = png.data[si]
      out.data[di+1] = png.data[si+1]
      out.data[di+2] = png.data[si+2]
      out.data[di+3] = png.data[si+3]
    }
  }
  return out
}

function tint(src, r, g, b) {
  const png = PNG.sync.read(readFileSync(src))
  const rotated = rotateCW(png)
  for (let i = 0; i < rotated.data.length; i += 4) {
    const brightness = rotated.data[i] * 0.299 + rotated.data[i+1] * 0.587 + rotated.data[i+2] * 0.114
    const alpha = Math.round((1 - brightness / 255) * 255)
    rotated.data[i]   = r
    rotated.data[i+1] = g
    rotated.data[i+2] = b
    rotated.data[i+3] = alpha
  }
  return PNG.sync.write(rotated)
}

writeFileSync('brand_assets/logo-white.png', tint('brand_assets/logo.png', 255, 255, 255))
writeFileSync('brand_assets/logo-dim.png',   tint('brand_assets/logo.png', 168, 152, 128))

// GERD wordmark — already landscape, no rotation needed
function tintFlat(src, r, g, b) {
  const png = PNG.sync.read(readFileSync(src))
  for (let i = 0; i < png.data.length; i += 4) {
    const brightness = png.data[i] * 0.299 + png.data[i+1] * 0.587 + png.data[i+2] * 0.114
    const alpha = Math.round((1 - brightness / 255) * 255)
    png.data[i]   = r
    png.data[i+1] = g
    png.data[i+2] = b
    png.data[i+3] = alpha
  }
  return PNG.sync.write(png)
}

writeFileSync('brand_assets/GERD_WHITE.png', tintFlat('brand_assets/GERD_BLACK.png', 255, 255, 255))
console.log('logo-white.png, logo-dim.png, GERD_WHITE.png written')
