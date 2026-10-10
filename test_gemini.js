const https = require('https');

const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JfadrOED6rMGu3bkyvBDjcWut85ByvjQzUkNc8XTohtQ';

const requestPayload = JSON.stringify({
  contents: [{
    parts: [{
      text: "You are an elite creative advertising copywriter for Facebook & Instagram Ads in India. Generate high-converting campaign metadata for prompt: 'Handcrafted Chikmagalur Filter Coffee'. Return ONLY JSON with keys: campaignName, brandName, tagline, headline, bodyText, interests (array of strings), ageRange, location, destinationUrl."
    }]
  }],
  generationConfig: {
    responseMimeType: "application/json"
  }
});

const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestPayload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (e) => {
  console.error('HTTPS Error:', e);
});

req.write(requestPayload);
req.end();
