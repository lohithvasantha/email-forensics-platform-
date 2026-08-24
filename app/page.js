'use client';
import { useState } from 'react';

export default function Home() {
  const [bodyText, setBodyText] = useState('');
  const [rawHeaders, setRawHeaders] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bodyText, rawHeaders })
    });
    const data = await res.json();
    if (data.success) setResult(data.analysis);
    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🛡️ AI Email Threat & Forensic Intelligence Platform</h1>
      <p>Analyze suspicious emails, extract header IP locations, and perform threat scoring.</p>
      
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
        <div>
          <label><b>Raw Email Headers (For GeoIP Analysis):</b></label>
          <textarea 
            rows={4} 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            placeholder="Received: from mail.example.com (198.51.100.1)..."
            value={rawHeaders}
            onChange={(e) => setRawHeaders(e.target.value)}
          />
        </div>

        <div>
          <label><b>Email Body Content:</b></label>
          <textarea 
            rows={6} 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            placeholder="Paste email text here..."
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
          />
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          style={{ padding: '0.75rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Analyzing...' : 'Run Forensic Intelligence'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Forensic Report</h2>
          <p><b>Threat Level:</b> <span style={{ color: result.threatLevel === 'HIGH' ? 'red' : 'green' }}>{result.threatLevel} ({result.riskScore}/100)</span></p>
          <p><b>Suspicious Indicators:</b> {result.suspiciousKeywords.join(', ') || 'None'}</p>
          <p><b>Detected IP:</b> {result.extractedIp}</p>
          <p><b>Origin Location:</b> {result.geoLocation.city}, {result.geoLocation.country} ({result.geoLocation.org})</p>
          <p><b>Extracted Links:</b> {result.urlsFound.length}</p>
        </div>
      )}
    </main>
  );
}
