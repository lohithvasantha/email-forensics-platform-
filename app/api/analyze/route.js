import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { bodyText, rawHeaders } = await request.json();

    // 1. Threat Detection (Heuristic Engine)
    const phishingKeywords = ['urgent', 'verify account', 'suspended', 'wire transfer', 'password reset', 'bank'];
    const lowerBody = (bodyText || '').toLowerCase();
    const detectedKeywords = phishingKeywords.filter(kw => lowerBody.includes(kw));
    
    let riskScore = detectedKeywords.length * 20;
    
    // Check for suspicious URL links
    const urlPattern = /https?:\/\/[^\s]+/g;
    const extractedUrls = bodyText.match(urlPattern) || [];
    if (extractedUrls.length > 0) riskScore += 15;

    // 2. IP Extraction from Headers
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const foundIps = (rawHeaders || '').match(ipPattern) || [];
    // Filter out common internal/private IPs
    const publicIps = foundIps.filter(ip => 
      !ip.startsWith('10.') && 
      !ip.startsWith('192.168.') && 
      !ip.startsWith('127.')
    );

    const targetIp = publicIps[0] || '8.8.8.8'; // Fallback for demonstration

    // 3. GeoLocation Fetching (ipapi API)
    let geoData = {};
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${targetIp}`);
      geoData = await geoRes.json();
    } catch (e) {
      geoData = { country: 'Unknown', city: 'Unknown', isp: 'Unknown' };
    }

    const threatLevel = riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW';

    return NextResponse.json({
      success: true,
      analysis: {
        threatLevel,
        riskScore: Math.min(riskScore, 100),
        suspiciousKeywords: detectedKeywords,
        urlsFound: extractedUrls,
        extractedIp: targetIp,
        geoLocation: {
          country: geoData.country || 'Unknown',
          city: geoData.city || 'Unknown',
          org: geoData.isp || 'Unknown',
          lat: geoData.lat || 0,
          lon: geoData.lon || 0
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
