import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.resolve('./database/uploaded.sqlite')

export async function POST(req: NextRequest) {
  if (!fs.existsSync(dbPath))
    return NextResponse.json({ error: 'No database uploaded yet.' }, { status: 404 })

  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string')
      return NextResponse.json({ error: 'Invalid query.' }, { status: 400 })

    const db = new Database(dbPath)
    const trimmed = query.trim().toLowerCase()

    if (trimmed.startsWith('select')) {
      const stmt = db.prepare(query)
      const rows = stmt.all()
    
      if (rows.length === 0) 
        return NextResponse.json({ type: 'select', columns: [], rows: [] })
    
      const columns = Object.keys(rows[0] as any)
      const result = rows.map((r: any) => columns.map(col => r[col]))
    
      return NextResponse.json({ type: 'select', columns, rows: result })
    } else {
      const info = db.prepare(query).run()
      return NextResponse.json({
        type: 'write',
        message: 'Query executed successfully',
        changes: info.changes,
        lastInsertRowid: info.lastInsertRowid
      })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
