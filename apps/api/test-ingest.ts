async function main() {
    const res = await fetch('http://localhost:3001/v1/ingest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer netra_test_key_123',
        },
        body: JSON.stringify({
            projectId: 'd5c3a6f0-642b-4240-83e8-3355f12a917e',
            events: [{
                name: 'test_event',
                session_id: 'sess_abc',
                anonymous_id: 'anon_123',
                properties: { email: 'user@example.com' },
            }],
        }),
    })

    const data = await res.json()
    console.log(`Status: ${res.status}`)
    console.log(data)

    // Fire it again to test Redis Cache Hit
    const res2 = await fetch('http://localhost:3001/v1/ingest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer netra_test_key_123',
        },
        body: JSON.stringify({
            projectId: 'd5c3a6f0-642b-4240-83e8-3355f12a917e',
            events: [{
                name: 'test_event_2',
                session_id: 'sess_abc',
                anonymous_id: 'anon_123'
            }],
        }),
    })
    const data2 = await res2.json()
    console.log(`Status 2: ${res2.status}`)
    console.log(data2)
}

main().catch(console.error)
