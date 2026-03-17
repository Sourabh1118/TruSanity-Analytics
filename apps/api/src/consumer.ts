/**
 * Netra Analytics — Kafka → ClickHouse Consumer
 *
 * Reads events from the 'netra.events' Kafka topic and batch-inserts them
 * into the ClickHouse `netra.events` MergeTree table via the HTTP interface.
 */

import { Kafka } from 'kafkajs'

// ── Config ───────────────────────────────────────────────────────────────────
const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9094']
const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL ?? 'http://localhost:8123'
const TOPIC = 'netra.events'
const BATCH_SIZE = 100
const FLUSH_INTERVAL = 2000

// ── Kafka Consumer ───────────────────────────────────────────────────────────
const kafka = new Kafka({ clientId: 'netra-consumer', brokers: KAFKA_BROKERS })
const consumer = kafka.consumer({ groupId: 'clickhouse_ingestion_node' })

let batch: object[] = []
let flushTimer: NodeJS.Timeout | null = null

// ── ClickHouse Insert ────────────────────────────────────────────────────────
async function flushToCH(rows: any[]): Promise<void> {
    if (rows.length === 0) return
    const ndjson = rows.map(r => {
        // ClickHouse DateTime format: 'YYYY-MM-DD HH:MM:SS' (no milliseconds, no Z)
        if (r.timestamp) r.timestamp = r.timestamp.split('.')[0].replace('T', ' ')
        return JSON.stringify(r)
    }).join('\n')
    const url = `${CLICKHOUSE_URL}/?query=${encodeURIComponent(
        'INSERT INTO netra.events FORMAT JSONEachRow'
    )}`

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: ndjson,
        })
        if (!res.ok) {
            console.error(`[consumer] ClickHouse insert failed: ${await res.text()}`)
        } else {
            console.log(`[consumer] ✅ Inserted ${rows.length} events into ClickHouse`)
        }
    } catch (e) {
        console.error(`[consumer] ClickHouse fetch failed:`, e)
    }
}

async function scheduledFlush() {
    if (batch.length === 0) return
    const toFlush = batch
    batch = []
    await flushToCH(toFlush)
}

function resetTimer() {
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = setTimeout(scheduledFlush, FLUSH_INTERVAL)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
    await consumer.connect()
    console.log('[consumer] Connected to Kafka')

    await consumer.subscribe({ topic: TOPIC, fromBeginning: false })
    console.log(`[consumer] Subscribed to ${TOPIC}`)

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return
            try {
                batch.push(JSON.parse(message.value.toString()))
                if (batch.length >= BATCH_SIZE) {
                    if (flushTimer) clearTimeout(flushTimer)
                    const toFlush = batch
                    batch = []
                    await flushToCH(toFlush)
                } else {
                    resetTimer()
                }
            } catch (e) {
                console.error('[consumer] Failed to parse message', e)
            }
        },
    })
}

// Graceful shutdown
async function shutdown() {
    console.log('[consumer] Shutting down…')
    if (flushTimer) clearTimeout(flushTimer)
    await scheduledFlush()
    await consumer.disconnect()
    process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

run().catch(err => {
    console.error('[consumer] Fatal error', err)
    process.exit(1)
})
