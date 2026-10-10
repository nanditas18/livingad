const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial empty data files if not existing
if (!fs.existsSync(CAMPAIGNS_FILE)) {
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

if (!fs.existsSync(SETTINGS_FILE)) {
  const initialSettings = {
    monthlyBudgetCap: 50000.00,
    enforcedStartupState: "PAUSED",
    supportedPlatforms: ["Facebook Ads", "Instagram Ads"],
    currency: "INR",
    currencySymbol: "₹"
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2), 'utf-8');
}

// Helper functions for reading/writing data
function readCampaigns() {
  try {
    const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading campaigns file:', err);
    return [];
  }
}

function writeCampaigns(campaigns) {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing campaigns file:', err);
    return false;
  }
}

function readSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading settings file:', err);
    return { monthlyBudgetCap: 50000.00, currency: "INR", currencySymbol: "₹" };
  }
}

function writeSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing settings file:', err);
    return false;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ==================== API ROUTES ====================

// 1. Get all campaigns (Starts empty)
app.get('/api/campaigns', (req, res) => {
  const campaigns = readCampaigns();
  res.json({ success: true, count: campaigns.length, data: campaigns });
});

// 2. Get single campaign
app.get('/api/campaigns/:id', (req, res) => {
  const campaigns = readCampaigns();
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }
  res.json({ success: true, data: campaign });
});

// 3. Create a new campaign (always starts PAUSED for budget safety)
app.post('/api/campaigns', (req, res) => {
  const {
    name,
    brandName,
    platform = 'facebook',
    ageRange = '25-38',
    location = 'All India (Pan-India)',
    interests = [],
    dailyBudget = 1000.00,
    headline,
    bodyText,
    destinationUrl,
    visualThemeIndex = 0
  } = req.body;

  if (!name || !headline || !destinationUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'Campaign name, headline, and destination URL are required.' 
    });
  }

  const campaigns = readCampaigns();
  const newCampaign = {
    id: 'cmp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    name: name.trim(),
    brandName: (brandName || name).trim(),
    platform: (platform === 'instagram' ? 'instagram' : 'facebook'),
    ageRange,
    location,
    interests: Array.isArray(interests) ? interests : [],
    dailyBudget: parseFloat(dailyBudget) || 1000.00,
    headline: headline.trim(),
    bodyText: (bodyText || '').trim(),
    destinationUrl: destinationUrl.trim(),
    status: 'PAUSED', // Safety policy: Always starts PAUSED
    visualThemeIndex: visualThemeIndex || 0,
    isUserApproved: true,
    impressions: 0,
    clicks: 0,
    ctr: 0.0,
    spend: 0.00,
    conversions: 0,
    createdAt: new Date().toISOString()
  };

  campaigns.unshift(newCampaign);
  writeCampaigns(campaigns);

  res.status(201).json({ success: true, data: newCampaign });
});

// 4. Update campaign details
app.put('/api/campaigns/:id', (req, res) => {
  const campaigns = readCampaigns();
  const index = campaigns.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const existing = campaigns[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id, // Immutable ID
    platform: req.body.platform === 'instagram' ? 'instagram' : 'facebook',
    dailyBudget: req.body.dailyBudget !== undefined ? parseFloat(req.body.dailyBudget) || 0 : existing.dailyBudget,
    updatedAt: new Date().toISOString()
  };

  campaigns[index] = updated;
  writeCampaigns(campaigns);

  res.json({ success: true, data: updated });
});

// 5. Toggle campaign status (PAUSED <-> LIVE)
app.patch('/api/campaigns/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['PAUSED', 'LIVE'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Status must be PAUSED or LIVE' });
  }

  const campaigns = readCampaigns();
  const index = campaigns.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  campaigns[index].status = status;
  // If moving to LIVE, simulate realistic live metrics in INR if impressions are still 0
  if (status === 'LIVE' && campaigns[index].impressions === 0) {
    campaigns[index].impressions = Math.floor(Math.random() * 1200) + 450;
    campaigns[index].clicks = Math.floor(campaigns[index].impressions * 0.038);
    campaigns[index].ctr = parseFloat(((campaigns[index].clicks / campaigns[index].impressions) * 100).toFixed(2));
    campaigns[index].spend = parseFloat((campaigns[index].clicks * 8.50).toFixed(2));
    campaigns[index].conversions = Math.max(1, Math.floor(campaigns[index].clicks * 0.06));
  }

  campaigns[index].updatedAt = new Date().toISOString();
  writeCampaigns(campaigns);

  res.json({ success: true, data: campaigns[index] });
});

// 6. Adjust budget limit
app.patch('/api/campaigns/:id/budget', (req, res) => {
  const { dailyBudget } = req.body;
  const budgetNum = parseFloat(dailyBudget);
  if (isNaN(budgetNum) || budgetNum <= 0) {
    return res.status(400).json({ success: false, error: 'Daily budget must be greater than ₹0' });
  }

  const campaigns = readCampaigns();
  const index = campaigns.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  campaigns[index].dailyBudget = budgetNum;
  campaigns[index].updatedAt = new Date().toISOString();
  writeCampaigns(campaigns);

  res.json({ success: true, data: campaigns[index] });
});

// 7. Delete campaign
app.delete('/api/campaigns/:id', (req, res) => {
  const campaigns = readCampaigns();
  const filtered = campaigns.filter(c => c.id !== req.params.id);
  if (filtered.length === campaigns.length) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  writeCampaigns(filtered);
  res.json({ success: true, message: 'Campaign deleted successfully' });
});

// 8. AI Campaign Generation API (Powered by Google Gemini API)
app.post('/api/ai/generate', async (req, res) => {
  const { prompt = '', platform = 'facebook' } = req.body;
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JfadrOED6rMGu3bkyvBDjcWut85ByvjQzUkNc8XTohtQ';

  const systemInstruction = `You are a world-class creative director, brand strategist, and performance copywriter for Meta Ads (Facebook & Instagram) in India.
Your mission is to generate punchy, high-converting, premium-sounding campaign names, brand names, memorable taglines, headlines, engaging body copy with emojis, and highly targeted Indian demographic parameters.
The campaign name and tagline MUST sound exceptionally good, memorable, and modern.
Locations must be Indian cities/states/metros (e.g. All India, Tier 1 Metros, Bengaluru, Mumbai, Delhi NCR, Hyderabad, etc.).
Currency must always be referenced in Rupees (₹ INR).
Return ONLY a valid JSON object matching this exact schema:
{
  "campaignName": "string - catchy, professional campaign name",
  "brandName": "string - memorable, high-class brand name",
  "tagline": "string - punchy, rhythmic, premium tagline",
  "headline": "string - high CTR ad headline with offer",
  "bodyText": "string - persuasive 2-3 paragraph ad copy with emojis and clear CTA",
  "interests": ["string", "string", "string", "string", "string"],
  "ageRange": "string (e.g. '22-38' or '25-45')",
  "location": "string - specific Indian metros or Pan-India",
  "destinationUrl": "string - valid https URL ending with .in or /offer"
}`;

  try {
    const payload = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${systemInstruction}\n\nUser Request / Product Idea: "${cleanPrompt}"\nPlatform: ${platform === 'instagram' ? 'Instagram' : 'Facebook'}`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await new Promise((resolve, reject) => {
      const https = require('https');
      const req = https.request(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => resolve({ statusCode: resp.statusCode, body: data }));
      });
      req.on('error', reject);
      req.setTimeout(12000, () => {
        req.destroy();
        reject(new Error('Gemini API timeout'));
      });
      req.write(payload);
      req.end();
    });

    if (apiResponse.statusCode === 200) {
      const parsed = JSON.parse(apiResponse.body);
      const textContent = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textContent) {
        const aiJson = JSON.parse(textContent);
        return res.json({
          success: true,
          data: {
            campaignName: aiJson.campaignName || `${aiJson.brandName} Pan-India Growth`,
            brandName: aiJson.brandName || "Bharat Studio",
            tagline: aiJson.tagline || "Fresh Ideas. Smart Marketing.",
            headline: aiJson.headline || "Special Offer - Shop Online Today",
            bodyText: aiJson.bodyText || `Experience top quality ${cleanPrompt}. Delivered across India.`,
            interests: Array.isArray(aiJson.interests) && aiJson.interests.length > 0 ? aiJson.interests : ["Online Shopping India", "Digital Payments"],
            ageRange: aiJson.ageRange || "25-38",
            location: aiJson.location || "All India (Pan-India)",
            dailyBudget: 1000.00,
            destinationUrl: aiJson.destinationUrl || `https://${(aiJson.brandName || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '')}.in/offer`,
            platform: platform === 'instagram' ? 'instagram' : 'facebook'
          }
        });
      }
    }
  } catch (err) {
    console.error('Gemini API error, falling back to smart heuristic generator:', err.message);
  }

  // High-quality smart heuristic fallback
  let brandName = "Bharat Studio";
  let tagline = "Fresh Ideas. Smart Marketing.";
  let campaignName = "Pan-India Launch Campaign";
  let headline = `Special Offer for ${cleanPrompt}`;
  let bodyText = `Discover the finest ${cleanPrompt} crafted with premium quality. Order online with fast delivery across India.`;
  let suggestedInterests = ["Online Shopping India", "Digital Payments", "Lifestyle India"];
  let ageRange = "25-38";
  let location = "All India (Pan-India)";

  const lower = cleanPrompt.toLowerCase();
  if (lower.includes('coffee') || lower.includes('filter coffee') || lower.includes('beverage') || lower.includes('cafe')) {
    brandName = "Malnad Estate Roasters";
    tagline = "Rooted in the Western Ghats. Steeped in Tradition.";
    campaignName = "Chikmagalur Artisanal Kaapi Experience";
    headline = "Freshly Ground Chikmagalur Filter Coffee – 20% Off";
    bodyText = "Experience the authentic aroma of shade-grown, freshly roasted Chikmagalur coffee beans. Handcrafted in small batches with zero preservatives. Delivered fresh across India with free brass dabara on orders above ₹499.";
    suggestedInterests = ["Specialty Coffee", "South Indian Filter Coffee", "Cafe Culture", "Bangalore Foodies", "Third Wave Coffee"];
    ageRange = "22-42";
    location = "Tier 1 Metros (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata)";
  } else if (lower.includes('saas') || lower.includes('software') || lower.includes('app') || lower.includes('ai') || lower.includes('tech') || lower.includes('crm')) {
    brandName = "FlowDesk India";
    tagline = "Empowering Indian Startups to Scale Faster.";
    campaignName = "Next-Gen AI Business Automation";
    headline = "Automate 10+ Hours of Business Operations Weekly";
    bodyText = "Next-generation intelligent CRM & automation tailored for Indian startups and growing SMBs. Seamless UPI & GST billing integration. Start free today.";
    suggestedInterests = ["Indian Startups", "SaaS India", "Digital India", "Business Operations", "Fintech India"];
    ageRange = "25-45";
    location = "Tier 1 Metros (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata)";
  } else if (lower.includes('skin') || lower.includes('beauty') || lower.includes('ayurved') || lower.includes('cosmetic')) {
    brandName = "Vedika Ayurveda";
    tagline = "Ancient Himalayan Botanicals. Modern Radiance.";
    campaignName = "Pure Ayurvedic Glow Ritual";
    headline = "Pure Ayurvedic Glow with Kumkumadi & Kashmiri Saffron";
    bodyText = "100% natural, toxin-free Ayurvedic skincare crafted with pure Himalayan herbs. Certified toxin-free. Enjoy Free Pan-India Delivery on orders above ₹499.";
    suggestedInterests = ["Ayurveda", "Natural Skincare", "Organic Beauty", "Herbal Wellness", "Clean Living India"];
    ageRange = "20-42";
    location = "All India (Pan-India)";
  } else if (lower.includes('fitness') || lower.includes('gym') || lower.includes('workout') || lower.includes('yoga')) {
    brandName = "FitBharat Club";
    tagline = "Stronger Everyday, Pure Desi Power.";
    campaignName = "30-Day Indian Transformation Challenge";
    headline = "Achieve Your Dream Fitness in 30 Days";
    bodyText = "Custom home & gym workout plans with certified Indian nutrition guides. Join over 50,000 active Indian fitness enthusiasts.";
    suggestedInterests = ["Fitness & Gym", "Healthy Living India", "Yoga", "Athletics", "Indian Fitness"];
    ageRange = "18-35";
    location = "Tier 1 Metros (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata)";
  } else {
    const words = cleanPrompt.split(' ').filter(w => w.length > 2);
    if (words.length > 0) {
      brandName = words[0].charAt(0).toUpperCase() + words[0].slice(1) + " Living";
      campaignName = `${brandName} Exclusive India Launch`;
      tagline = `Elevate your ${cleanPrompt} experience.`;
    }
  }

  res.json({
    success: true,
    data: {
      campaignName,
      brandName,
      tagline,
      headline,
      bodyText,
      platform: platform === 'instagram' ? 'instagram' : 'facebook',
      interests: suggestedInterests,
      ageRange,
      location,
      dailyBudget: 1000.00,
      destinationUrl: `https://${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in/offer`
    }
  });
});

// 9. Get & Update Global Settings
app.get('/api/settings', (req, res) => {
  const settings = readSettings();
  res.json({ success: true, data: settings });
});

app.put('/api/settings', (req, res) => {
  const current = readSettings();
  const updated = { ...current, ...req.body };
  writeSettings(updated);
  res.json({ success: true, data: updated });
});

// Start server with port fallback
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Neosophical Lab Server running at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
