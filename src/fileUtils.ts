import mammoth from 'mammoth'
import { MAX_FILE_SIZE } from './constants'
import type { FileAttachment } from './types'

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'הקובץ גדול מדי (מקסימום 10MB)'
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['pdf', 'docx', 'txt'].includes(ext)) {
    return 'פורמט לא נתמך. ניתן להעלות PDF, DOCX או TXT'
  }
  return null
}

export async function processFile(file: File): Promise<FileAttachment> {
  const ext = file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'docx' | 'txt'

  if (ext === 'pdf') {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    // Chunked base64 conversion — avoids call stack overflow on large files
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    const base64 = btoa(binary)
    return {
      name: file.name,
      type: 'pdf',
      content: base64,
      mediaType: 'application/pdf',
    }
  }

  if (ext === 'docx') {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return {
      name: file.name,
      type: 'docx',
      content: result.value,
    }
  }

  // txt
  const text = await file.text()
  return {
    name: file.name,
    type: 'txt',
    content: text,
  }
}
