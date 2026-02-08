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
  'EMERGENCY CONTACTS',
  'OUTBOUND FLIGHT',
  'RETURN FLIGHT',
  'HOTELS',
  'DAILY ACTIVITIES',
  'Redemption tips',
]

const TIMELINE_HEADINGS = ['OUTBOUND FLIGHT', 'RETURN FLIGHT', 'HOTELS', 'DAILY ACTIVITIES', 'TRIP ITINERARY']
const DAY_LINE = /^Day\s+\d+$/i

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

    const timelineLineX = PAGE.margin + 1.5
    const timelineIndent = 6
    const timelineContentWidth = PAGE.contentWidth - timelineIndent
    const isTimelineSection = (text) => TIMELINE_HEADINGS.some((h) => text.toUpperCase() === h.toUpperCase())
    const isEmergency = (text) => text.toUpperCase() === 'EMERGENCY CONTACTS'

    // ---- Content blocks ----
    const blocks = getContentBlocks(content)
    for (let b = 0; b < blocks.length; b++) {
      const block = blocks[b]
      if (block.type === 'heading') {
        checkPage(18)
        y += sectionGap
        const isTimeline = isTimelineSection(block.text)
        const emergency = isEmergency(block.text)

        if (isTimeline) {
          const sectionStartY = y
          doc.setFillColor(...BRAND.primary)
          doc.circle(timelineLineX, y + 2, 1.2, 'F')
          doc.setFillColor(241, 245, 249)
          doc.rect(PAGE.margin, y - 4, PAGE.width - PAGE.margin, 10, 'F')
          doc.setFillColor(...BRAND.primary)
          doc.rect(0, y - 4, 3, 10, 'F')
          doc.setTextColor(...BRAND.primaryDark)
          doc.setFontSize(11)
          doc.setFont('times', 'bold')
          doc.text(block.text, PAGE.margin + 4, y + 2)
          doc.setFont('helvetica', 'normal')
          y += 6 + headingGap
          const bodyBlock = blocks[b + 1]
          if (bodyBlock?.type === 'body') {
            doc.setFontSize(10)
            doc.setTextColor(...BRAND.dark)
            const bulletWidth = timelineContentWidth - 5
            for (const line of bodyBlock.lines) {
              const isDay = DAY_LINE.test(line.trim())
              if (isDay) {
                checkPage(12)
                doc.setFillColor(224, 242, 254)
                doc.rect(PAGE.margin + timelineIndent - 2, y - 3.5, timelineContentWidth + 2, 7, 'F')
                doc.setFillColor(...BRAND.accent)
                doc.rect(PAGE.margin + timelineIndent, y - 3, 1.5, 6, 'F')
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(10)
                doc.setTextColor(...BRAND.primaryDark)
                doc.text(line.trim(), PAGE.margin + timelineIndent + 3, y + 1)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(...BRAND.dark)
                y += lineHeight + 2
                continue
              }
              const isBullet = /^[-•]\s*/.test(line) || /^\d+\.\s+/.test(line)
              const text = /^[-•]\s*/.test(line) ? line : line.replace(/^(\d+\.\s+)/, '• ')
              const wrapped = doc.splitTextToSize(text, bulletWidth)
              for (const part of wrapped) {
                checkPage(lineHeight)
                doc.text(part, PAGE.margin + timelineIndent + (isBullet ? 4 : 0), y)
                y += lineHeight
              }
            }
            doc.setDrawColor(...BRAND.primary)
            doc.setLineWidth(0.3)
            doc.line(timelineLineX, sectionStartY + 4, timelineLineX, y + 2)
            y += 3
            b++
          } else {
            doc.setDrawColor(...BRAND.primary)
            doc.setLineWidth(0.3)
            doc.line(timelineLineX, sectionStartY + 4, timelineLineX, y + 4)
            y += 2
          }
          continue
        }

        if (emergency) {
          doc.setFillColor(254, 226, 226)
          doc.rect(0, y - 4, PAGE.width, 10, 'F')
          doc.setFillColor(220, 38, 38)
          doc.rect(0, y - 4, 3, 10, 'F')
          doc.setTextColor(127, 29, 29)
        } else {
          doc.setFillColor(241, 245, 249)
          doc.rect(0, y - 4, PAGE.width, 10, 'F')
          doc.setFillColor(...BRAND.accent)
          doc.rect(0, y - 4, 3, 10, 'F')
          doc.setTextColor(...BRAND.primaryDark)
        }
        doc.setFontSize(emergency ? 12 : 12)
        doc.setFont('times', 'bold')
        doc.text(block.text, PAGE.margin + 2, y + 2)
        doc.setFont('helvetica', 'normal')
        y += 6 + headingGap
        continue
      }
      if (block.type === 'body') {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(...BRAND.dark)
        const bulletIndent = 5
        const bulletWidth = PAGE.contentWidth - bulletIndent
        for (const line of block.lines) {
          const isBullet = /^[-•]\s*/.test(line) || /^\d+\.\s+/.test(line)
          const text = /^[-•]\s*/.test(line) ? line : line.replace(/^(\d+\.\s+)/, '• ')
          const wrapped = doc.splitTextToSize(text, isBullet ? bulletWidth : PAGE.contentWidth)
          for (const part of wrapped) {
            checkPage(lineHeight)
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
