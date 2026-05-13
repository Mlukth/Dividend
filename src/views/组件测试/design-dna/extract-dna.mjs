/**
 * Design DNA Extractor
 * 用法: node extract-dna.mjs <url>
 * 输出: 结构化设计 token JSON，自动保存到 sites/ 目录
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITES_DIR = join(__dirname, 'sites')
if (!existsSync(SITES_DIR)) mkdirSync(SITES_DIR, { recursive: true })

// ── 工具函数 ──────────────────────────────────────────────
function parseHex(c) { return parseInt(c.slice(1), 16) }
function isLight(hex) { const r = (parseHex(hex) >> 16) & 0xff; const g = (parseHex(hex) >> 8) & 0xff; const b = parseHex(hex) & 0xff; return (0.299 * r + 0.587 * g + 0.114 * b) > 128 }
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
function freq(arr) { const m = new Map(); for (const v of arr) m.set(v, (m.get(v) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]) }

// ── CSS 值提取器 ──────────────────────────────────────────
function extractColors(css) {
  const hex = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => m[0].toLowerCase())
  const rgb = [...css.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)].map(m => {
    const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3])
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
  })
  const all = [...new Set([...hex, ...rgb])]
  const darks = all.filter(c => c.length === 7 && !isLight(c))
  const lights = all.filter(c => c.length === 7 && isLight(c))
  // 找出现最多的颜色作为主色
  const topColors = freq(all).slice(0, 10).map(([c]) => c)
  return {
    uniqueCount: all.length,
    topColors,
    likelyBg: freq(darks).slice(0, 3).map(([c]) => c),
    likelyText: freq(lights).slice(0, 3).map(([c]) => c),
    accentCandidates: all.filter(c => c.length === 7 && !isLight(c) && parseHex(c.slice(1,3)) > 100 || parseHex(c.slice(3,5)) > 100 || parseHex(c.slice(5,7)) > 100).slice(0, 5),
  }
}

function extractTypography(css, html) {
  const fonts = [...css.matchAll(/font-family:\s*([^;}]+)/gi)].map(m => m[1].trim().replace(/['"]/g, ''))
  const sizes = [...css.matchAll(/font-size:\s*([\d.]+)(px|rem|em)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))
  const weights = [...css.matchAll(/font-weight:\s*(\d+)/gi)].map(m => parseInt(m[1]))
  const lineHeights = [...css.matchAll(/line-height:\s*([\d.]+)/gi)].map(m => parseFloat(m[1]))
  const letterSpacings = [...css.matchAll(/letter-spacing:\s*([\d.-]+)(px|em)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))
  const googleFonts = [...html.matchAll(/fonts\.googleapis\.com\/css\?family=([^&"'<>]+)/gi)].map(m => m[1].replace(/\+/g, ' '))
  const fontFaceFonts = [...css.matchAll(/@font-face\s*\{[^}]*font-family:\s*["']?([^"'};\n]+)/gi)].map(m => m[1].trim())

  return {
    declaredFonts: [...new Set(fonts)].slice(0, 10),
    googleFonts: [...new Set(googleFonts)],
    customFonts: [...new Set(fontFaceFonts)],
    sizeRange: sizes.length ? { min: Math.min(...sizes.map(s => s.val)), max: Math.max(...sizes.map(s => s.val)), unit: sizes[0].unit } : null,
    weightRange: weights.length ? { values: [...new Set(weights)].sort((a, b) => a - b) } : null,
    lineHeightRange: lineHeights.length ? { min: Math.min(...lineHeights), max: Math.max(...lineHeights) } : null,
    letterSpacingSamples: letterSpacings.slice(0, 10),
  }
}

function extractSpacing(css) {
  const paddings = [...css.matchAll(/padding(?:-top|-right|-bottom|-left)?:\s*([\d.]+)(px|rem)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))
  const margins = [...css.matchAll(/margin(?:-top|-right|-bottom|-left)?:\s*([\d.]+)(px|rem)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))
  const gaps = [...css.matchAll(/gap:\s*([\d.]+)(px|rem)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))

  const pxValues = [...paddings, ...margins, ...gaps].filter(s => s.unit === 'px').map(s => s.val)
  const commonPx = freq(pxValues.map(v => Math.round(v / 4) * 4)).slice(0, 8).map(([v]) => parseInt(v))

  return {
    paddingSamples: freq(paddings.map(p => p.val)).slice(0, 6).map(([v, c]) => ({ value: v, count: c })),
    marginSamples: freq(margins.map(p => p.val)).slice(0, 6).map(([v, c]) => ({ value: v, count: c })),
    commonGaps: freq(gaps.map(p => p.val)).slice(0, 5).map(([v, c]) => ({ value: v, count: c })),
    spacingScale: commonPx,
  }
}

function extractBorders(css) {
  const radii = [...css.matchAll(/border-radius:\s*([\d.]+)(px|rem)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))
  const widths = [...css.matchAll(/border(?:-top|-right|-bottom|-left)?-width:\s*([\d.]+)px/gi)].map(m => parseInt(m[1]))
  const style = [...css.matchAll(/border-style:\s*(\w+)/gi)].map(m => m[1])

  return {
    radiusCommon: freq(radii.map(r => r.val)).slice(0, 5).map(([v, c]) => ({ value: v, count: c })),
    borderWidths: freq(widths).slice(0, 5).map(([v, c]) => ({ value: v, count: c })),
    borderStyle: freq(style).slice(0, 3).map(([v, c]) => ({ value: v, count: c })),
  }
}

function extractShadows(css) {
  const boxShadows = [...css.matchAll(/box-shadow:\s*([^;}]+)/gi)].map(m => m[1].trim())
  const textShadows = [...css.matchAll(/text-shadow:\s*([^;}]+)/gi)].map(m => m[1].trim())
  return { boxShadowSamples: boxShadows.slice(0, 8), textShadowSamples: textShadows.slice(0, 4) }
}

function extractAnimations(css) {
  const durations = [...css.matchAll(/transition-duration:\s*([\d.]+)(s|ms)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))
  const easings = [...css.matchAll(/transition-timing-function:\s*([^;}]+)/gi)].map(m => m[1].trim())
  const animNames = [...css.matchAll(/animation-name:\s*([^;}]+)/gi)].map(m => m[1].trim())
  const transforms = [...css.matchAll(/transform:\s*([^;}]+)/gi)].map(m => m[1].trim())

  return {
    transitionDurations: durations.slice(0, 10),
    customEasings: [...new Set(easings)].filter(e => e.includes('cubic-bezier')).slice(0, 5),
    animationNames: [...new Set(animNames)].filter(n => n !== 'none').slice(0, 10),
    transformSamples: transforms.slice(0, 10),
  }
}

function extractLayout(css) {
  const maxWidths = [...css.matchAll(/max-width:\s*([\d.]+)(px|rem)/gi)].map(m => ({ val: parseFloat(m[1]), unit: m[2] }))
  const displayFlex = (css.match(/display:\s*flex/g) || []).length
  const displayGrid = (css.match(/display:\s*grid/g) || []).length
  const columns = [...css.matchAll(/grid-template-columns:\s*([^;}]+)/gi)].map(m => m[1].trim())

  return {
    maxWidths: maxWidths.slice(0, 5),
    flexUsage: displayFlex,
    gridUsage: displayGrid,
    gridColumns: columns.slice(0, 5),
  }
}

function inferMood(colors, typo, anim) {
  const moods = []
  const topBg = colors.likelyBg[0] || '#000'
  if (!isLight(topBg) || parseHex(topBg) < 0x333333) moods.push('dark')
  else if (isLight(topBg)) moods.push('light')

  if (typo.customFonts.length >= 3) moods.push('editorial')
  if (typo.googleFonts.length > 0) moods.push('modern-web')
  if (anim.customEasings.length > 0) moods.push('animation-polished')
  if ((colors.palette || []).length < 10) moods.push('minimalist')
  if (colors.accentCandidates?.some(c => parseHex(c.slice(1,3)) > 0xcc)) moods.push('high-energy')

  return moods
}

// ── 主提取函数 ────────────────────────────────────────────
async function extractDNA(url) {
  console.log(`\n🔍 正在提取: ${url}`)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)

  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'DesignDNA-Extractor/1.0' } })
    const html = await res.text()
    clearTimeout(timer)

    // 提取外部 CSS
    const cssUrls = [...html.matchAll(/<link[^>]*href="([^"]+\.css[^"]*)"[^>]*>/gi)].map(m => m[1])
    const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1])

    console.log(`  HTML: ${(html.length / 1024).toFixed(0)}KB | CSS files: ${cssUrls.length} | Inline styles: ${inlineStyles.length}`)

    // 读取 CSS 文件（最多取前3个，避免超时）
    let allCss = inlineStyles.join('\n')
    for (const href of cssUrls.slice(0, 3)) {
      try {
        const cssUrl = href.startsWith('http') ? href : new URL(href, url).href
        const cssRes = await fetch(cssUrl, { signal: AbortSignal.timeout(8000) })
        const cssText = await cssRes.text()
        allCss += '\n' + cssText
        console.log(`  ✓ CSS: ${cssUrl.slice(0, 80)}... (${(cssText.length / 1024).toFixed(0)}KB)`)
      } catch { /* skip */ }
    }

    // 分析
    const colors = extractColors(allCss)
    const typography = extractTypography(allCss, html)
    const spacing = extractSpacing(allCss)
    const borders = extractBorders(allCss)
    const shadows = extractShadows(allCss)
    const animation = extractAnimations(allCss)
    const layout = extractLayout(allCss)
    const mood = inferMood(colors, typography, animation)

    const result = {
      url,
      extractedAt: new Date().toISOString(),
      sourceInfo: { htmlSizeKB: +(html.length / 1024).toFixed(1), cssFiles: cssUrls.length, inlineStyleBlocks: inlineStyles.length },
      designTokens: { colors, typography, spacing, borders, shadows, animation, layout },
      mood,
    }

    // 保存
    const host = new URL(url).hostname.replace(/^www\./, '')
    const filename = host + '.json'
    const filepath = join(SITES_DIR, filename)
    writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf-8')
    console.log(`  💾 已保存: ${filename}\n`)

    return result
  } catch (e) {
    clearTimeout(timer)
    console.error(`  ❌ 失败: ${e.message}`)
    return { url, error: e.message }
  }
}

// ── CLI ────────────────────────────────────────────────────
const url = process.argv[2]
if (!url) {
  console.log('用法: node extract-dna.mjs <url>')
  console.log('示例: node extract-dna.mjs https://animejs.com/')
  process.exit(1)
}

extractDNA(url).then(result => {
  console.log('── 提取摘要 ──')
  console.log('色调:', result.mood?.join(', ') || 'N/A')
  console.log('字体:', result.designTokens?.typography?.customFonts?.join(', ') || result.designTokens?.typography?.declaredFonts?.slice(0, 3).join(', ') || 'N/A')
  console.log('主色:', result.designTokens?.colors?.topColors?.slice(0, 5).join(', ') || 'N/A')
  console.log('间距尺度:', result.designTokens?.spacing?.spacingScale?.join(', ') || 'N/A')
  console.log('圆角:', result.designTokens?.borders?.radiusCommon?.map(r => r.value).join(', ') || 'N/A')
  console.log('动画缓动:', result.designTokens?.animation?.customEasings?.join(', ') || 'N/A')
  console.log('')
})
