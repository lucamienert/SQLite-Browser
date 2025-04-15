'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table as UITable,
  TableHeader,
  TableRow,
  TableCell,
  TableBody
} from '@/components/ui/table'
import { motion } from 'framer-motion'

interface TableData {
  name: string
  columns: string[]
  rows: any[][]
}

type QueryResult =
  | {
      type: 'select'
      columns: string[]
      rows: any[][]
    }
  | {
      type: 'write'
      message: string
      changes: number
      lastInsertRowid: number
    }

export default function HomePage() {
  const [tables, setTables] = useState<TableData[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResult  | null>(null)

  useEffect(() => {
    fetch('/api/tables')
      .then(res => res.json())
      .then(setTables)
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) 
      return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      alert('Database imported!')
      window.location.reload()
    } else {
      alert('Failed to upload database.')
    }
  }

  const handleQuery = async () => {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    const result = await res.json()
    setQueryResult(result)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">SQLite DB Browser</h1>

      <div className="space-y-2">
        <label className="font-semibold">Import SQLite Database:</label>
        <Input type="file" accept=".sqlite,.db" onChange={handleUpload} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tables.map((table, index) => (
          <Card key={index} onClick={() => setSelectedTable(table.name)} className="cursor-pointer hover:shadow-md">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">{table.name}</h2>
              <p>{table.columns.length} columns, {table.rows.length} rows</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTable && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-xl font-semibold">Table: {selectedTable}</h2>
          <UITable>
            <TableHeader>
              <TableRow>
                {tables.find(t => t.name === selectedTable)?.columns.map((col) => (
                  <TableCell key={col} className="font-bold">{col}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.find(t => t.name === selectedTable)?.rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{String(cell)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        </motion.div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Run SQL Query</h2>
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="SELECT * FROM my_table..." />
        <Button onClick={handleQuery}>Run</Button>
        {queryResult && (
          <div className="overflow-auto border rounded p-2 bg-gray-100 mt-4">
            {queryResult.type === 'select' && queryResult.columns.length > 0 ? (
              <UITable>
                <TableHeader>
                  <TableRow>
                    {queryResult.columns.map((col, i) => (
                      <TableCell key={i} className="font-bold">{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queryResult.rows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>{String(cell)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
            ) : (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(queryResult, null, 2)}</pre>
            )}
          </div>
        )}

      </div>

      <div>
        <Button variant="outline" onClick={() => window.location.href = '/api/download'}>
          Export Database
        </Button>
      </div>
    </div>
  )
}
