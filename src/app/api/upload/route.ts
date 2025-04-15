import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import fs from 'fs'

export async function POST(req: Request) {
  const data = await req.formData()
  const file = data.get('file') as File

  if (!file) 
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  const dirPath = path.resolve('./database')
  const filePath = path.join(dirPath, 'uploaded.sqlite')

  if (!fs.existsSync(dirPath))
    await mkdir(dirPath, { recursive: true })

  await writeFile(filePath, buffer)

  return NextResponse.json({ message: 'Database uploaded' })
}
