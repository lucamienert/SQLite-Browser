import { NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.resolve('./database/uploaded.sqlite')

export async function GET() {
  if (!fs.existsSync(dbPath))
    return NextResponse.json([], { status: 200 })

  try {
    const db = new Database(dbPath)

    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `).all()

    const result = tables.map((t: any) => {
      const name = t.name
      const columns = db.prepare(`PRAGMA table_info(${name})`).all().map((col: any) => col.name)
      const rows = db.prepare(`SELECT * FROM ${name} LIMIT 100`).all()

      return {
        name,
        columns,
        rows: rows.map((row: any) => columns.map((col: any) => row[col]))
      }
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
