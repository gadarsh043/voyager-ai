/**
 * Generate a beautiful PDF from trip document content and trigger download (no new tab).
 * Uses Voyager AI branding, colors, and typography.
 */
import { jsPDF } from 'jspdf'

const BRAND = {
  name: 'Voyager AI',
  primary: [37, 99, 235],      // blue-600
  primaryDark: [29, 78, 216],  // blue-700
  accent: [16, 185, 129],     // emerald-500
  muted: [100, 116, 139],     // slate-500
  dark: [30, 41, 59],         // slate-800
}

const PAGE = {
  margin: 18,
  width: 210,
  height: 297,
  contentWidth: 210 - 36,
}

const SECTION_HEADINGS = [
  'TRIP ITINERARY',
  'SUGGESTIONS',
  'CURRENCY USAGE',
  'MOBILE PLAN',
  'CARD BENEFITS',
  'LOCAL LANGUAGE CHEAT SHEET',
  'OUTBOUND FLIGHT',
  'RETURN FLIGHT',
  'HOTELS',
  'DAILY ACTIVITIES',
  'Redemption tips',
]

function getContentBlocks(content) {
  if (!content || typeof content !== 'string') return []
  const blocks = []
  const lines = content.split('\n')
  let i = 0
  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trim()
    if (line === '---' || line === '') {
      i++
      continue
    }
    const isSectionHeader =
      SECTION_HEADINGS.some((h) => line.toUpperCase() === h.toUpperCase()) ||
      (line.length > 2 && line.length < 80 && /^[A-Z][A-Z0-9\s–\-&]+$/.test(line))
    if (isSectionHeader) {
      blocks.push({ type: 'heading', text: line })
      i++
      continue
    }
    const bodyLines = []
    while (i < lines.length && lines[i].trim() !== '---') {
      const l = lines[i].trim()
      if (l === '') {
        i++
        if (bodyLines.length) break
        continue
      }
      bodyLines.push(l)
      i++
    }
    if (bodyLines.length) blocks.push({ type: 'body', lines: bodyLines })
  }
  return blocks
}

export function openTripDocumentPrintView(content) {
  if (!content || typeof content !== 'string') return false
  try {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    let y = PAGE.margin
    const lineHeight = 5.5
    const headingGap = 4
    const sectionGap = 8

    function checkPage(needed = 15) {
      if (y + needed > PAGE.height - PAGE.margin) {
        doc.addPage()
        y = PAGE.margin
      }
    }

    // ---- Voyager AI header ----
    doc.setFillColor(...BRAND.primary)
    doc.rect(0, 0, PAGE.width, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(BRAND.name, PAGE.margin, 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(226, 232, 240)
    doc.text('Your trip itinerary · Suggestions · Currency · Mobile · Card benefits · Language', PAGE.margin, 24)
    y = 34

    // ---- Content blocks ----
    const blocks = getContentBlocks(content)
    for (const block of blocks) {
      if (block.type === 'heading') {
        checkPage(18)
        y += sectionGap
        doc.setFillColor(241, 245, 249)
        doc.rect(0, y - 4, PAGE.width, 10, 'F')
        doc.setFillColor(...BRAND.accent)
        doc.rect(0, y - 4, 3, 10, 'F')
        doc.setTextColor(...BRAND.primaryDark)
        doc.setFontSize(12)
        doc.setFont('times', 'bold')
        doc.text(block.text, PAGE.margin + 2, y + 2)
        doc.setFont('helvetica', 'normal')
        y += 6 + headingGap
        continue
      }
      if (block.type === 'body') {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        const bulletIndent = 5
        const bulletWidth = PAGE.contentWidth - bulletIndent
        for (const line of block.lines) {
          const isBullet = /^[-•]\s*/.test(line) || /^\d+\.\s+/.test(line)
          const text = /^[-•]\s*/.test(line) ? line : line.replace(/^(\d+\.\s+)/, '• ')
          const wrapped = doc.splitTextToSize(text, isBullet ? bulletWidth : PAGE.contentWidth)
          for (const part of wrapped) {
            checkPage(lineHeight)
            doc.setTextColor(...(isBullet ? BRAND.dark : BRAND.dark))
            doc.text(part, PAGE.margin + (isBullet ? bulletIndent : 0), y)
            y += lineHeight
          }
        }
        y += 2
      }
    }

    // ---- Footer on last page ----
    const pageCount = doc.getNumberOfPages()
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p)
      doc.setFontSize(8)
      doc.setTextColor(...BRAND.muted)
      doc.text(
        `Voyager AI · Trip Itinerary · Page ${p} of ${pageCount}`,
        PAGE.width / 2,
        PAGE.height - 8,
        { align: 'center' }
      )
    }

    doc.save('Voyager-AI-Itinerary.pdf')
    return true
  } catch (e) {
    console.error('PDF generation failed', e)
    return false
  }
}
