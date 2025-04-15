import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.resolve('./database/uploaded.sqlite')

  if (!fs.existsSync(filePath))
    return NextResponse.json({ error: 'No database to download' }, { status: 404 })

  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Disposition': 'attachment; filename=exported.sqlite',
      'Content-Type': 'application/octet-stream',
    },
  })
}
