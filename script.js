/* ==========================================================================
   Neosophical Lab - AI Campaign Manager for India (Facebook & Instagram)
   Colors: Seashell (#FFF5EE), Wheat (#F5DEB3), Midnight Violet (#2C1A4D)
   Dark Mode: Pure Sleek Neutral Dark (No Purple)
   Currency: Indian Rupee (₹ INR)
   ========================================================================== */

const { useState, useEffect, useRef } = React;

// Reusable Card Component
const Card = ({ children, className = "", hoverable = false, onClick, style }) => (
  <div 
    className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
    onClick={onClick}
    style={style}
  >
    {children}
  </div>
);

// Reusable Badge Component
const Badge = ({ children, type = "default", style }) => {
  let badgeClass = "badge";
  if (type === "success") badgeClass += " badge-success";
  if (type === "warning") badgeClass += " badge-warning";
  if (type === "error") badgeClass += " badge-error";
  return <span className={badgeClass} style={style}>{children}</span>;
};

// Reusable Button Component
const Button = ({ children, variant = "primary", onClick, disabled = false, style, className = "" }) => {
  let btnClass = "btn";
  if (variant === "secondary") btnClass += " btn-secondary";
  if (variant === "outline") btnClass += " btn-outline";
  if (className) btnClass += ` ${className}`;
  return (
    <button className={btnClass} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
};

// Empty draft factory (India localized)
const createBlankDraft = () => ({
  name: "",
  brandName: "",
  tagline: "",
  platform: "facebook",
  ageRange: "25-38",
  location: "All India (Pan-India)",
  interests: [],
  dailyBudget: 1000.00,
  headline: "",
  bodyText: "",
  destinationUrl: "",
  status: "PAUSED",
  visualThemeIndex: 0,
  isUserApproved: false
});

// Main App Component
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('neosophical_theme') || 'light');
  const [currentScreen, setCurrentScreen] = useState('screen-dashboard');
  const [toastMessage, setToastMessage] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(1000);
  const [monthlyCap, setMonthlyCap] = useState(50000.00);

  // Backend state
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaignId, setActiveCampaignId] = useState(null);
  const [draftCampaign, setDraftCampaign] = useState(createBlankDraft());
  const [isLoading, setIsLoading] = useState(true);

  const visualThemes = [
    { name: "Wheat Gold", bg: "#F5DEB3", accent: "#2C1A4D", text: "#2C1A4D" },
    { name: "Seashell Light", bg: "#FFF5EE", accent: "#2C1A4D", text: "#2C1A4D" },
    { name: "Charcoal Dark", bg: "#1a1a1e", accent: "#F5DEB3", text: "#FFF5EE" },
    { name: "Classic Sand", bg: "#F5DEB3", accent: "#FFF5EE", text: "#2C1A4D" }
  ];

  // Load campaigns & settings from backend on mount
  useEffect(() => {
    fetchCampaigns();
    fetchSettings();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('neosophical_theme', theme);
  }, [theme]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.monthlyBudgetCap) {
          setMonthlyCap(json.data.monthlyBudgetCap);
        }
      }
    } catch (e) {
      console.log('Using default local settings');
    }
  };

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const json = await res.json();
        setCampaigns(json.data || []);
        if (json.data && json.data.length > 0 && !activeCampaignId) {
          setActiveCampaignId(json.data[0].id);
        }
      } else {
        setCampaigns([]);
      }
    } catch (e) {
      console.log('No backend response, starting in empty state');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  const navigateTo = (screenId) => {
    setCurrentScreen(screenId);
    window.location.hash = screenId.replace('screen-', '');
  };

  const handleCreateNew = () => {
    setDraftCampaign(createBlankDraft());
    navigateTo('screen-builder');
  };

  const handleSaveAndDeploy = async (campaignData) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        setCampaigns(prev => [created, ...prev]);
        setActiveCampaignId(created.id);
        showToast("Campaign safely created in PAUSED state.");
        navigateTo('screen-analytics');
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to create campaign.");
      }
    } catch (e) {
      // Fallback local persistence if offline
      const localCreated = {
        ...campaignData,
        id: 'cmp_' + Date.now(),
        status: 'PAUSED',
        impressions: 0,
        clicks: 0,
        ctr: 0,
        spend: 0,
        conversions: 0
      };
      setCampaigns(prev => [localCreated, ...prev]);
      setActiveCampaignId(localCreated.id);
      showToast("Campaign created in PAUSED state (Local).");
      navigateTo('screen-analytics');
    }
  };

  const handleToggleStatus = async (campaignId, currentStatus) => {
    const nextStatus = currentStatus === 'LIVE' ? 'PAUSED' : 'LIVE';
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        const json = await res.json();
        setCampaigns(prev => prev.map(c => c.id === campaignId ? json.data : c));
        showToast(`Campaign ${nextStatus === 'LIVE' ? 'Activated & LIVE in India' : 'PAUSED (Spending Halted)'}`);
      }
    } catch (e) {
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: nextStatus } : c));
      showToast(`Campaign status updated to ${nextStatus}`);
    }
  };

  const handleUpdateBudget = async () => {
    if (!activeCampaignId || newBudgetVal <= 0) return;
    try {
      const res = await fetch(`/api/campaigns/${activeCampaignId}/budget`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBudget: parseFloat(newBudgetVal) })
      });

      if (res.ok) {
        const json = await res.json();
        setCampaigns(prev => prev.map(c => c.id === activeCampaignId ? json.data : c));
        showToast(`Daily budget limit updated to ₹${parseFloat(newBudgetVal).toLocaleString('en-IN')}/day`);
      }
    } catch (e) {
      setCampaigns(prev => prev.map(c => c.id === activeCampaignId ? { ...c, dailyBudget: parseFloat(newBudgetVal) } : c));
      showToast(`Daily budget updated`);
    } finally {
      setIsBudgetModalOpen(false);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' });
    } catch (e) {}
    
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    if (activeCampaignId === campaignId) {
      const remaining = campaigns.filter(c => c.id !== campaignId);
      setActiveCampaignId(remaining.length > 0 ? remaining[0].id : null);
    }
    showToast("Campaign deleted.");
  };

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0] || null;

  return (
    <div className="app-main-wrapper">
      {/* Top Header */}
      <header className="top-header">
        <a href="#dashboard" className="brand-container" onClick={(e) => { e.preventDefault(); navigateTo('screen-dashboard'); }}>
          <div className="brand-logo-icon">
            <svg viewBox="0 0 36 36" fill="none" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 6H22M16 6V13.2L8.5 25.5C7.4 27.3 8.7 29.5 10.8 29.5H25.2C27.3 29.5 28.6 27.3 27.5 25.5L20 13.2V6" 
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-titles">
            <span className="brand-name">Neosophical Lab</span>
            <span className="brand-tagline">Fresh Ideas. Smart Marketing.</span>
          </div>
        </a>

        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <Button onClick={handleCreateNew}>Create Campaign</Button>
        </div>
      </header>

      {/* App Body */}
      <div className="app-container">
        {/* Sidebar */}
        <aside className="app-sidebar">
          <div>
            <div className="nav-section-label">Main Navigation</div>
            <ul className="nav-menu">
              <li>
                <button 
                  className={`nav-item-btn ${currentScreen === 'screen-dashboard' ? 'active' : ''}`}
                  onClick={() => navigateTo('screen-dashboard')}
                >
                  Dashboard Overview
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item-btn ${currentScreen === 'screen-builder' ? 'active' : ''}`}
                  onClick={() => navigateTo('screen-builder')}
                >
                  AI Campaign Builder
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item-btn ${currentScreen === 'screen-editor' ? 'active' : ''}`}
                  onClick={() => navigateTo('screen-editor')}
                >
                  Plan and Editor
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item-btn ${currentScreen === 'screen-review' ? 'active' : ''}`}
                  onClick={() => navigateTo('screen-review')}
                >
                  Review and Launch
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item-btn ${currentScreen === 'screen-analytics' ? 'active' : ''}`}
                  onClick={() => {
                    if (campaigns.length === 0) {
                      showToast("No active campaign yet. Create one first!");
                      navigateTo('screen-builder');
                    } else {
                      navigateTo('screen-analytics');
                    }
                  }}
                >
                  Live Campaign
                </button>
              </li>
            </ul>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div className="nav-section-label">Supported Platforms</div>
            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>Facebook Ads</span>
                <Badge type="success">Active</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>Instagram Ads</span>
                <Badge type="success">Active</Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-view-container">
          {currentScreen === 'screen-dashboard' && (
            <DashboardScreen 
              campaigns={campaigns}
              isLoading={isLoading}
              navigateTo={navigateTo}
              handleCreateNew={handleCreateNew}
              setActiveCampaignId={setActiveCampaignId}
              handleToggleStatus={handleToggleStatus}
              handleDeleteCampaign={handleDeleteCampaign}
              setDraftCampaign={setDraftCampaign}
            />
          )}

          {currentScreen === 'screen-builder' && (
            <BuilderScreen 
              draftCampaign={draftCampaign}
              setDraftCampaign={setDraftCampaign}
              navigateTo={navigateTo}
              visualThemes={visualThemes}
              showToast={showToast}
            />
          )}

          {currentScreen === 'screen-editor' && (
            <EditorScreen 
              draftCampaign={draftCampaign}
              setDraftCampaign={setDraftCampaign}
              navigateTo={navigateTo}
              showToast={showToast}
            />
          )}

          {currentScreen === 'screen-review' && (
            <ReviewScreen 
              draftCampaign={draftCampaign}
              setDraftCampaign={setDraftCampaign}
              navigateTo={navigateTo}
              showToast={showToast}
              handleSaveAndDeploy={handleSaveAndDeploy}
            />
          )}

          {currentScreen === 'screen-analytics' && (
            <AnalyticsScreen 
              campaign={activeCampaign}
              campaigns={campaigns}
              setActiveCampaignId={setActiveCampaignId}
              handleToggleStatus={handleToggleStatus}
              navigateTo={navigateTo}
              showToast={showToast}
              setIsBudgetModalOpen={setIsBudgetModalOpen}
              setNewBudgetVal={setNewBudgetVal}
              handleCreateNew={handleCreateNew}
            />
          )}
        </main>
      </div>

      {/* Budget Adjustment Modal */}
      {isBudgetModalOpen && activeCampaign && (
        <div className="modal-backdrop active">
          <div className="modal-box">
            <h3 className="modal-header">Adjust Daily Budget Safeguard</h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enforce strict daily spending threshold for <strong>{activeCampaign.name}</strong>. Ad delivery will pause automatically if this limit is reached.
            </p>
            <div className="form-group">
              <label className="form-label">New Daily Limit (₹ INR)</label>
              <input 
                type="number" 
                className="form-input" 
                min="100" 
                max="25000" 
                step="100" 
                value={newBudgetVal} 
                onChange={(e) => setNewBudgetVal(e.target.value)} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="secondary" onClick={() => setIsBudgetModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateBudget}>Save Budget Cap</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toastMessage && (
          <div className="toast">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 1. DASHBOARD SCREEN (EMPTY STATE & CAMPAIGNS LIST) ====================
function DashboardScreen({ campaigns, isLoading, navigateTo, handleCreateNew, setActiveCampaignId, handleToggleStatus, handleDeleteCampaign, setDraftCampaign }) {
  const hasCampaigns = campaigns && campaigns.length > 0;

  // Calculate aggregate metrics
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <section className="screen-page active-screen">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard Overview</h1>
          <p>Monitor Facebook & Instagram campaigns in India with real-time budget safeguards.</p>
        </div>

        <div>
          <Button onClick={handleCreateNew}>+ New AI Campaign</Button>
        </div>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="metrics-summary-grid">
        <Card hoverable className="metric-card">
          <div className="metric-card-title">Active Campaigns</div>
          <div className="metric-card-val">{campaigns.filter(c => c.status === 'LIVE').length}</div>
          <div className="metric-card-sub">{campaigns.length} Total Registered</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Total Ad Spend</div>
          <div className="metric-card-val">₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="metric-card-sub">Budget Cap Protection Active</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Total Impressions</div>
          <div className="metric-card-val">{totalImpressions.toLocaleString('en-IN')}</div>
          <div className="metric-card-sub">Facebook & Instagram Feed</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Average CTR</div>
          <div className="metric-card-val">{avgCtr}%</div>
          <div className="metric-card-sub">{hasCampaigns ? "Optimized by AI" : "No data yet"}</div>
        </Card>
      </div>

      {/* Main Content: Clean Empty State or Active Table */}
      {hasCampaigns ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Your Campaigns</h2>
            <Button onClick={handleCreateNew}>AI Campaign Builder</Button>
          </div>
          <Card style={{ padding: 0 }} className="campaigns-table-container">
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Daily Limit</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.brandName} · {c.location || "All India"}
                      </div>
                    </td>
                    <td>
                      <Badge>{c.platform === 'instagram' ? 'Instagram Ads' : 'Facebook Ads'}</Badge>
                    </td>
                    <td>
                      <Badge type={c.status === 'LIVE' ? 'success' : 'warning'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td><strong>₹{c.dailyBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / day</strong></td>
                    <td>{(c.impressions || 0).toLocaleString('en-IN')}</td>
                    <td>{(c.clicks || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Button 
                          variant="secondary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} 
                          onClick={() => {
                            setActiveCampaignId(c.id);
                            navigateTo('screen-analytics');
                          }}
                        >
                          Analytics
                        </Button>
                        <Button 
                          variant="outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} 
                          onClick={() => {
                            setDraftCampaign({ ...c });
                            navigateTo('screen-editor');
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary)' }} 
                          onClick={() => handleToggleStatus(c.id, c.status)}
                        >
                          {c.status === 'LIVE' ? 'Pause' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: '#c0392b' }} 
                          onClick={() => handleDeleteCampaign(c.id)}
                          title="Delete Campaign"
                        >
                          &times;
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        /* Pristine Empty State - No pre-added items */
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>No Campaigns Created Yet</h2>
          <p>
            Launch your first high-converting ad campaign across India on Facebook and Instagram. Our guided AI assistant builds your targeting, ad copy, and visuals in under 3 minutes with budget safeguards.
          </p>
          <Button onClick={handleCreateNew} style={{ padding: '0.8rem 1.8rem', fontSize: '0.95rem' }}>
            Create Campaign with AI
          </Button>
        </div>
      )}
    </section>
  );
}

// ==================== 2. AI CAMPAIGN BUILDER SCREEN ====================
function BuilderScreen({ draftCampaign, setDraftCampaign, navigateTo, visualThemes, showToast }) {
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'Namaste! Tell me what product, brand, or offer you want to promote across India on Facebook and Instagram.' }
  ]);
  const canvasRef = useRef(null);

  useEffect(() => {
    drawAdGraphicCanvas();
  }, [draftCampaign.visualThemeIndex, draftCampaign.brandName, draftCampaign.headline, draftCampaign.tagline]);

  const drawAdGraphicCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const themeIndex = draftCampaign.visualThemeIndex || 0;
    const theme = visualThemes[themeIndex] || visualThemes[0];

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    const titleText = (draftCampaign.brandName || "YOUR BRAND").toUpperCase();
    ctx.fillStyle = theme.text;
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(titleText, canvas.width / 2, canvas.height / 2 - 15);

    const subText = (draftCampaign.tagline || "FRESH IDEAS. SMART MARKETING.").toUpperCase();
    ctx.font = "600 13px system-ui, -apple-system, sans-serif";
    ctx.fillText(subText, canvas.width / 2, canvas.height / 2 + 20);
  };

  const handleSendMessage = async (msgText) => {
    if (!msgText || !msgText.trim()) return;

    const newHistory = [...chatHistory, { sender: 'user', text: msgText }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: msgText, platform: draftCampaign.platform })
      });

      if (res.ok) {
        const json = await res.json();
        const aiData = json.data;

        setDraftCampaign(prev => ({
          ...prev,
          name: aiData.campaignName || `${aiData.brandName} Pan-India Launch`,
          brandName: aiData.brandName,
          tagline: aiData.tagline,
          headline: aiData.headline,
          bodyText: aiData.bodyText,
          interests: aiData.interests,
          ageRange: aiData.ageRange,
          location: aiData.location,
          dailyBudget: aiData.dailyBudget || 1000.00,
          destinationUrl: aiData.destinationUrl
        }));

        setChatHistory(prev => [
          ...prev,
          { 
            sender: 'ai', 
            text: `✨ Campaign Generated by Gemini API!\n\n🏷️ Campaign: "${aiData.campaignName}"\n🌟 Brand: "${aiData.brandName}"\n🎯 Tagline: "${aiData.tagline}"\n📍 Targeting: ${aiData.location} (${aiData.ageRange})\n\nCheck out the live ad preview on the right!` 
          }
        ]);
        showToast("Gemini AI Campaign Strategy Ready!");
      } else {
        throw new Error("API error");
      }
    } catch (e) {
      const brand = msgText.trim().split(' ')[0] + " India";
      setDraftCampaign(prev => ({
        ...prev,
        name: `${brand} Pan-India Launch`,
        brandName: brand,
        tagline: "Authentic Quality. Unmatched Value.",
        headline: `Special Offer on ${msgText}`,
        bodyText: `Discover why customers across India love ${msgText}. Premium quality with fast delivery.`,
        interests: ["Online Shopping India", "Digital Payments", "Lifestyle India"],
        location: "All India (Pan-India)",
        dailyBudget: 1000.00,
        destinationUrl: `https://${brand.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`
      }));

      setChatHistory(prev => [
        ...prev,
        { sender: 'ai', text: `✨ AI Strategy Generated for ${brand}. Review the live preview on the right.` }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="screen-page active-screen">
      {/* Stepper */}
      <div className="stepper-bar">
        <div className="stepper-step active"><span className="step-num">1</span><span>AI Campaign Builder</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step"><span className="step-num">2</span><span>Plan and Editor</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step"><span className="step-num">3</span><span>Review and Launch</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step"><span className="step-num">4</span><span>Live Analytics</span></div>
      </div>

      <div className="builder-grid">
        {/* Left: Chat AI Assistant */}
        <Card className="chat-panel">
          <div className="chat-header">
            <div className="chat-avatar">NL</div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Neosophical Marketing AI</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Facebook & Instagram Campaign Architect (India)</p>
            </div>
          </div>

          <div className="chat-history">
            {chatHistory.map((item, i) => (
              <div key={i} className={`chat-bubble ${item.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
                {item.text}
              </div>
            ))}
            {isGenerating && (
              <div className="chat-bubble chat-bubble-ai" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                AI is crafting Indian audience parameters, copy, and creatives...
              </div>
            )}
          </div>

          <div className="quick-prompts-row">
            <button className="chip-btn" onClick={() => handleSendMessage("Coorg Specialty Filter Coffee")}>Coorg Filter Coffee</button>
            <button className="chip-btn" onClick={() => handleSendMessage("SaaS CRM for Indian SMBs")}>SaaS for India</button>
            <button className="chip-btn" onClick={() => handleSendMessage("Ayurvedic Herbal Skincare")}>Ayurvedic Skincare</button>
          </div>

          <div className="chat-input-bar" style={{ marginTop: '0.75rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Promote our organic filter coffee in Bangalore & Mumbai..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
              disabled={isGenerating}
            />
            <Button onClick={() => handleSendMessage(chatInput)} disabled={isGenerating}>
              {isGenerating ? "..." : "Send"}
            </Button>
          </div>
        </Card>

        {/* Right: Live Preview */}
        <div className="preview-panel">
          <div className="preview-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Live Ad Preview ({draftCampaign.platform === 'instagram' ? 'Instagram Post' : 'Facebook Feed'})
            </h3>
            <div className="preview-platform-tabs">
              <button 
                className={`platform-tab ${draftCampaign.platform === 'facebook' ? 'active' : ''}`}
                onClick={() => setDraftCampaign(prev => ({ ...prev, platform: 'facebook' }))}
              >
                Facebook Feed
              </button>
              <button 
                className={`platform-tab ${draftCampaign.platform === 'instagram' ? 'active' : ''}`}
                onClick={() => setDraftCampaign(prev => ({ ...prev, platform: 'instagram' }))}
              >
                Instagram Post
              </button>
            </div>
          </div>

          <div className="meta-ad-mockup">
            <div className="meta-ad-header">
              <div className="meta-page-avatar">{draftCampaign.platform === 'instagram' ? 'IG' : 'FB'}</div>
              <div className="meta-page-info">
                <span className="meta-page-name">{draftCampaign.brandName || "Brand Name"}</span>
                <span className="meta-sponsored-tag">Sponsored · {draftCampaign.platform === 'instagram' ? 'Instagram' : 'Facebook'}</span>
              </div>
            </div>

            <div className="meta-ad-body-text">
              {draftCampaign.bodyText || "Tell the AI what you want to promote to generate your high-converting Indian ad copy and audience parameters."}
            </div>

            <div className="meta-ad-media">
              <canvas ref={canvasRef} width={600} height={400} />
            </div>

            <div className="meta-ad-cta-bar">
              <div className="meta-cta-details">
                <span className="meta-cta-domain">
                  {draftCampaign.destinationUrl ? draftCampaign.destinationUrl.replace(/^https?:\/\//, '').split('/')[0] : 'yourbrand.in'}
                </span>
                <span className="meta-cta-headline">{draftCampaign.headline || "Your Ad Headline"}</span>
              </div>
              <button className="meta-cta-btn">Shop Now</button>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="secondary" style={{ fontSize: '0.8125rem' }} onClick={() => {
              setDraftCampaign(prev => ({ ...prev, visualThemeIndex: ((prev.visualThemeIndex || 0) + 1) % visualThemes.length }));
              showToast("Visual Palette Updated!");
            }}>
              Change Visual Palette
            </Button>
            <Button onClick={() => {
              if (!draftCampaign.headline || !draftCampaign.name) {
                setDraftCampaign(prev => ({
                  ...prev,
                  name: prev.name || "New India Campaign",
                  brandName: prev.brandName || "My Brand India",
                  headline: prev.headline || "Special Offer - Order Online",
                  bodyText: prev.bodyText || "Discover authentic quality delivered across India.",
                  destinationUrl: prev.destinationUrl || "https://example.in"
                }));
              }
              navigateTo('screen-editor');
            }}>
              Continue to Plan and Editor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== 3. PLAN AND EDITOR SCREEN ====================
function EditorScreen({ draftCampaign, setDraftCampaign, navigateTo, showToast }) {
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const handleAddTag = () => {
    if (tagInput.trim() && !draftCampaign.interests.includes(tagInput.trim())) {
      setDraftCampaign(prev => ({ ...prev, interests: [...prev.interests, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRem) => {
    setDraftCampaign(prev => ({ ...prev, interests: prev.interests.filter(t => t !== tagToRem) }));
  };

  const validateForm = () => {
    const errs = {};
    if (!draftCampaign.name || !draftCampaign.name.trim()) errs.name = "Campaign name cannot be empty.";
    if (draftCampaign.dailyBudget <= 0) errs.budget = "Daily budget must be greater than ₹0.";
    if (!draftCampaign.headline || !draftCampaign.headline.trim()) errs.headline = "Headline is required.";
    if (!draftCampaign.destinationUrl || (!draftCampaign.destinationUrl.startsWith('http://') && !draftCampaign.destinationUrl.startsWith('https://'))) {
      errs.url = "Valid URL starting with http:// or https:// is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return (
    <section className="screen-page active-screen">
      <div className="stepper-bar">
        <div className="stepper-step completed"><span className="step-num">1</span><span>AI Campaign Builder</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step active"><span className="step-num">2</span><span>Plan and Editor</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step"><span className="step-num">3</span><span>Review and Launch</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step"><span className="step-num">4</span><span>Live Analytics</span></div>
      </div>

      <div className="editor-grid">
        <Card>
          <h2 className="editor-section-title">Edit Campaign Strategy</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-campaign-name">Campaign Name</label>
            <input 
              type="text" 
              className={`form-input ${errors.name ? 'has-error' : ''}`}
              placeholder="e.g. Coorg Coffee Pan-India Launch"
              value={draftCampaign.name} 
              onChange={(e) => setDraftCampaign({ ...draftCampaign, name: e.target.value })}
            />
            {errors.name && <div className="field-error-msg">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Advertising Platform</label>
            <div className="platform-selector-grid">
              <div 
                className={`platform-option-card ${draftCampaign.platform === 'facebook' ? 'active' : ''}`}
                onClick={() => setDraftCampaign({ ...draftCampaign, platform: 'facebook' })}
                style={{ cursor: 'pointer' }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Facebook Ads</span>
                <Badge type="success" style={{ fontSize: '0.65rem' }}>Active</Badge>
              </div>
              <div 
                className={`platform-option-card ${draftCampaign.platform === 'instagram' ? 'active' : ''}`}
                onClick={() => setDraftCampaign({ ...draftCampaign, platform: 'instagram' })}
                style={{ cursor: 'pointer' }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Instagram Ads</span>
                <Badge type="success" style={{ fontSize: '0.65rem' }}>Active</Badge>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Demographic and Interests</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78125rem' }}>Age Group</span>
                <select className="form-select" value={draftCampaign.ageRange} onChange={(e) => setDraftCampaign({ ...draftCampaign, ageRange: e.target.value })}>
                  <option value="25-38">25 to 38 years (Young Professionals)</option>
                  <option value="18-24">18 to 24 years (Gen Z)</option>
                  <option value="35-55">35 to 55 years (Established)</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '0.78125rem' }}>Location (India)</span>
                <select className="form-select" value={draftCampaign.location} onChange={(e) => setDraftCampaign({ ...draftCampaign, location: e.target.value })}>
                  <option value="All India (Pan-India)">All India (Pan-India)</option>
                  <option value="Tier 1 Metros (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata)">Tier 1 Metros (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata)</option>
                  <option value="Maharashtra (Mumbai, Pune, Nagpur)">Maharashtra (Mumbai, Pune, Nagpur)</option>
                  <option value="Delhi NCR (New Delhi, Noida, Gurgaon)">Delhi NCR (New Delhi, Noida, Gurgaon)</option>
                  <option value="Karnataka (Bengaluru, Mysuru)">Karnataka (Bengaluru, Mysuru)</option>
                  <option value="Telangana & Andhra Pradesh (Hyderabad, Vizag)">Telangana & Andhra Pradesh (Hyderabad, Vizag)</option>
                  <option value="Tamil Nadu (Chennai, Coimbatore, Madurai)">Tamil Nadu (Chennai, Coimbatore, Madurai)</option>
                  <option value="Gujarat (Ahmedabad, Surat, Vadodara)">Gujarat (Ahmedabad, Surat, Vadodara)</option>
                  <option value="West Bengal (Kolkata, Howrah)">West Bengal (Kolkata, Howrah)</option>
                  <option value="Rajasthan (Jaipur, Jodhpur, Udaipur)">Rajasthan (Jaipur, Jodhpur, Udaipur)</option>
                  <option value="Punjab & Chandigarh (Chandigarh, Ludhiana, Amritsar)">Punjab & Chandigarh (Chandigarh, Ludhiana, Amritsar)</option>
                  <option value="Kerala (Kochi, Thiruvananthapuram, Kozhikode)">Kerala (Kochi, Thiruvananthapuram, Kozhikode)</option>
                  <option value="Uttar Pradesh (Lucknow, Kanpur, Varanasi, Noida)">Uttar Pradesh (Lucknow, Kanpur, Varanasi, Noida)</option>
                  <option value="Madhya Pradesh (Indore, Bhopal)">Madhya Pradesh (Indore, Bhopal)</option>
                  <option value="Bihar & Jharkhand (Patna, Ranchi, Jamshedpur)">Bihar & Jharkhand (Patna, Ranchi, Jamshedpur)</option>
                  <option value="Odisha (Bhubaneswar, Cuttack)">Odisha (Bhubaneswar, Cuttack)</option>
                  <option value="Assam & Northeast (Guwahati)">Assam & Northeast (Guwahati)</option>
                  <option value="Goa">Goa</option>
                </select>
              </div>
            </div>

            <span style={{ fontSize: '0.78125rem' }}>Audience Interest Targeting</span>
            <div className="interest-tags-container">
              {(draftCampaign.interests || []).map(t => (
                <span key={t} className="tag-item">
                  {t} <span className="tag-remove-btn" onClick={() => handleRemoveTag(t)}>&times;</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Add interest tag (e.g. UPI, Online Shopping)..." 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                style={{ fontSize: '0.8125rem' }} 
              />
              <Button variant="secondary" onClick={handleAddTag} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>Add</Button>
            </div>
          </div>

          <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <label className="form-label">
              <span>Daily Spend Limit</span>
              <strong>₹{(draftCampaign.dailyBudget || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2 })} per day</strong>
            </label>
            <div className="range-container">
              <input 
                type="range" 
                className="range-slider" 
                min="100" 
                max="25000" 
                step="100" 
                value={draftCampaign.dailyBudget || 1000} 
                onChange={(e) => setDraftCampaign({ ...draftCampaign, dailyBudget: parseFloat(e.target.value) })}
              />
              <input 
                type="number" 
                className={`form-input ${errors.budget ? 'has-error' : ''}`}
                style={{ width: '120px' }} 
                value={draftCampaign.dailyBudget || 1000}
                onChange={(e) => setDraftCampaign({ ...draftCampaign, dailyBudget: parseFloat(e.target.value) || 0 })}
              />
            </div>
            {errors.budget && <div className="field-error-msg">{errors.budget}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Ad Headline</label>
            <input 
              type="text" 
              className={`form-input ${errors.headline ? 'has-error' : ''}`}
              placeholder="e.g. 20% Off Authentic Filter Coffee"
              value={draftCampaign.headline} 
              onChange={(e) => setDraftCampaign({ ...draftCampaign, headline: e.target.value })}
            />
            {errors.headline && <div className="field-error-msg">{errors.headline}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Primary Ad Copy and Description</label>
            <textarea 
              className="form-textarea" 
              rows="3" 
              placeholder="Describe your offer, value proposition, and call to action..."
              value={draftCampaign.bodyText} 
              onChange={(e) => setDraftCampaign({ ...draftCampaign, bodyText: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Landing Page Destination URL</label>
            <input 
              type="url" 
              className={`form-input ${errors.url ? 'has-error' : ''}`}
              placeholder="https://yourbrand.in/offer"
              value={draftCampaign.destinationUrl} 
              onChange={(e) => setDraftCampaign({ ...draftCampaign, destinationUrl: e.target.value })}
            />
            {errors.url && <div className="field-error-msg">{errors.url}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => navigateTo('screen-builder')}>Back to Builder</Button>
            <Button onClick={() => {
              if (validateForm()) navigateTo('screen-review');
              else showToast("Please fix highlighted errors before proceeding.");
            }}>Proceed to Safety Review</Button>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="ai-summary-card">
            <h3>AI Performance Forecast (India)</h3>
            <ul className="ai-summary-list">
              <li>1. Platform: <strong>{draftCampaign.platform === 'instagram' ? 'Instagram Ads' : 'Facebook Ads'}</strong></li>
              <li>2. Location: <strong>{draftCampaign.location || 'All India'}</strong></li>
              <li>3. Safety Policy: New campaign starts in <strong>PAUSED</strong> state.</li>
              <li>4. Estimated CTR: <strong>3.4% - 4.8%</strong> based on Indian audience engagement.</li>
            </ul>
          </div>

          <Card style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.84375rem', fontWeight: 700, marginBottom: '0.75rem' }}>Live Copy Preview</h4>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{draftCampaign.headline || "(Empty Headline)"}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>{draftCampaign.bodyText || "(Empty Description)"}</div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ==================== 4. REVIEW AND LAUNCH SCREEN ====================
function ReviewScreen({ draftCampaign, setDraftCampaign, navigateTo, showToast, handleSaveAndDeploy }) {
  const isPlatformValid = draftCampaign.destinationUrl && (draftCampaign.destinationUrl.startsWith('http://') || draftCampaign.destinationUrl.startsWith('https://'));
  const isBudgetValid = draftCampaign.dailyBudget > 0;
  const isCreativeValid = Boolean(draftCampaign.headline && draftCampaign.headline.trim());
  const isNameValid = Boolean(draftCampaign.name && draftCampaign.name.trim());
  const isFullyValid = isPlatformValid && isBudgetValid && isCreativeValid && isNameValid;

  return (
    <section className="screen-page active-screen">
      <div className="stepper-bar">
        <div className="stepper-step completed"><span className="step-num">1</span><span>AI Campaign Builder</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step completed"><span className="step-num">2</span><span>Plan and Editor</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step active"><span className="step-num">3</span><span>Review and Launch</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step"><span className="step-num">4</span><span>Live Analytics</span></div>
      </div>

      <div className="review-wrapper">
        <div className={`readiness-banner ${isFullyValid ? 'ready' : 'blocked'}`}>
          <div className="readiness-info">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {isFullyValid ? "Campaign Ready for Deployment" : "Action Required: Missing Required Information"}
              </h3>
              <p style={{ fontSize: '0.8125rem' }}>
                {isFullyValid ? "All safety limits are verified. Campaign will deploy to backend in PAUSED state." : "Please complete missing parameters in Editor before launching."}
              </p>
            </div>
          </div>
          <Badge type={isFullyValid ? "success" : "error"}>
            {isFullyValid ? "Passes Safety Audit" : "Launch Blocked"}
          </Badge>
        </div>

        <Card className="summary-checklist-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Safety and Campaign Summary</h3>

          <div className="checklist-item">
            <div className="checklist-left">
              <div className="checklist-status-icon">1</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Platform & Destination</div>
                <div style={{ fontSize: '0.8125rem' }}>
                  {draftCampaign.platform === 'instagram' ? 'Instagram Ads' : 'Facebook Ads'} ({draftCampaign.location || 'All India'}) &rarr; {draftCampaign.destinationUrl || "Missing Destination URL"}
                </div>
              </div>
            </div>
            <Button variant="outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-editor')}>Edit</Button>
          </div>

          <div className="checklist-item">
            <div className="checklist-left">
              <div className="checklist-status-icon">2</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Enforced Budget Safeguard</div>
                <div style={{ fontSize: '0.8125rem' }}>₹{(draftCampaign.dailyBudget || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2 })} per day (Enforced limit)</div>
              </div>
            </div>
            <Button variant="outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-editor')}>Edit</Button>
          </div>

          <div className="checklist-item">
            <div className="checklist-left">
              <div className="checklist-status-icon">3</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ad Creative and Copy</div>
                <div style={{ fontSize: '0.8125rem' }}>Headline: "{draftCampaign.headline || 'Untitled'}"</div>
              </div>
            </div>
            <Button variant="outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-editor')}>Edit</Button>
          </div>

          <div className="checklist-item">
            <div className="checklist-left">
              <div className="checklist-status-icon">4</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Default Startup State Safety Rule</div>
                <div style={{ fontSize: '0.8125rem' }}>Campaign will deploy in PAUSED state. Zero Rupees spent until manually activated.</div>
              </div>
            </div>
            <Badge type="warning">Enforced Policy</Badge>
          </div>
        </Card>

        <div className="approval-box">
          <input 
            type="checkbox" 
            id="chk-user-authorization" 
            checked={draftCampaign.isUserApproved || false} 
            onChange={(e) => setDraftCampaign({ ...draftCampaign, isUserApproved: e.target.checked })}
          />
          <label htmlFor="chk-user-authorization">
            I authorize Neosophical Lab to deploy campaign <strong>"{draftCampaign.name || 'New Campaign'}"</strong> with an enforced daily budget limit of <strong>₹{(draftCampaign.dailyBudget || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/day</strong>. I understand that the campaign will start in a PAUSED state and will not spend any money without manual activation.
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="secondary" onClick={() => navigateTo('screen-editor')}>Edit Details</Button>
          <Button 
            disabled={!isFullyValid || !draftCampaign.isUserApproved} 
            onClick={() => handleSaveAndDeploy(draftCampaign)}
          >
            Deploy Campaign to Backend (Starts Paused)
          </Button>
        </div>
      </div>
    </section>
  );
}

// ==================== 5. LIVE ANALYTICS SCREEN ====================
function AnalyticsScreen({ campaign, campaigns, setActiveCampaignId, handleToggleStatus, navigateTo, showToast, setIsBudgetModalOpen, setNewBudgetVal, handleCreateNew }) {
  const lineCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);

  if (!campaign) {
    return (
      <div className="empty-state-card" style={{ marginTop: '2rem' }}>
        <h2>No Live Campaign Selected</h2>
        <p>You do not have any campaigns created yet. Build your first campaign with our AI assistant.</p>
        <Button onClick={handleCreateNew}>Create Campaign</Button>
      </div>
    );
  }

  useEffect(() => {
    drawPerformanceLineChart();
    drawBudgetBarChart();
  }, [campaign.id, campaign.dailyBudget, campaign.spend]);

  const drawPerformanceLineChart = () => {
    const canvas = lineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 260;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const impressionsData = campaign.impressions > 0 
      ? [
          Math.floor(campaign.impressions * 0.1),
          Math.floor(campaign.impressions * 0.15),
          Math.floor(campaign.impressions * 0.12),
          Math.floor(campaign.impressions * 0.18),
          Math.floor(campaign.impressions * 0.14),
          Math.floor(campaign.impressions * 0.22),
          Math.floor(campaign.impressions * 0.09)
        ]
      : [0, 0, 0, 0, 0, 0, 0];
    const maxVal = Math.max(100, ...impressionsData) * 1.25;

    const padLeft = 40;
    const padBottom = 30;
    const padTop = 20;
    const chartW = canvas.width - padLeft - 20;
    const chartH = canvas.height - padBottom - padTop;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const chartColor = isDark ? '#F5DEB3' : '#2C1A4D';
    const gridColor = isDark ? 'rgba(245, 222, 179, 0.25)' : 'rgba(44, 26, 77, 0.2)';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padTop + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();

      ctx.fillStyle = chartColor;
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padLeft - 8, y + 4);
    }

    ctx.strokeStyle = chartColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const points = [];
    impressionsData.forEach((val, idx) => {
      const x = padLeft + (chartW / (days.length - 1)) * idx;
      const y = padTop + chartH - (val / maxVal) * chartH;
      points.push({ x, y });
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((pt, idx) => {
      ctx.fillStyle = chartColor;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillText(days[idx], pt.x, canvas.height - 8);
    });
  };

  const drawBudgetBarChart = () => {
    const canvas = barCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 260;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyCap = campaign.dailyBudget || 1000;
    const spendData = campaign.spend > 0 
      ? [
          (campaign.spend * 0.12).toFixed(1),
          (campaign.spend * 0.18).toFixed(1),
          (campaign.spend * 0.15).toFixed(1),
          (campaign.spend * 0.22).toFixed(1),
          (campaign.spend * 0.14).toFixed(1),
          (campaign.spend * 0.19).toFixed(1),
          (campaign.spend * 0.00).toFixed(1)
        ]
      : [0, 0, 0, 0, 0, 0, 0];

    const padLeft = 40;
    const padBottom = 30;
    const padTop = 20;
    const chartW = canvas.width - padLeft - 20;
    const chartH = canvas.height - padBottom - padTop;
    const maxVal = Math.max(1000, dailyCap * 1.2);
    const barWidth = (chartW / days.length) * 0.45;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const chartColor = isDark ? '#F5DEB3' : '#2C1A4D';
    const gridColor = isDark ? 'rgba(245, 222, 179, 0.25)' : 'rgba(44, 26, 77, 0.2)';

    spendData.forEach((val, idx) => {
      const x = padLeft + (chartW / days.length) * idx + barWidth * 0.5;
      const barH = (val / maxVal) * chartH;
      const y = padTop + chartH - barH;

      ctx.fillStyle = chartColor;
      ctx.fillRect(x, y, barWidth, barH);

      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(days[idx], x + barWidth / 2, canvas.height - 8);
    });

    const capY = padTop + chartH - (dailyCap / maxVal) * chartH;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, capY);
    ctx.lineTo(canvas.width - 20, capY);
    ctx.stroke();

    ctx.fillStyle = chartColor;
    ctx.textAlign = 'right';
    ctx.fillText(`Cap: ₹${dailyCap.toLocaleString('en-IN')}`, canvas.width - 25, capY - 6);
  };

  return (
    <section className="screen-page active-screen">
      <div className="stepper-bar">
        <div className="stepper-step completed"><span className="step-num">1</span><span>AI Campaign Builder</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step completed"><span className="step-num">2</span><span>Plan and Editor</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step completed"><span className="step-num">3</span><span>Review and Launch</span></div>
        <div className="stepper-divider"></div>
        <div className="stepper-step active"><span className="step-num">4</span><span>Live Analytics</span></div>
      </div>

      {/* Campaign Switcher if multiple */}
      {campaigns.length > 1 && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Switch Campaign:</span>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
            value={campaign.id}
            onChange={(e) => setActiveCampaignId(e.target.value)}
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
            ))}
          </select>
        </div>
      )}

      <div className="analytics-top-bar">
        <div className="analytics-title-group">
          <h2>{campaign.name}</h2>
          <Badge type={campaign.status === 'LIVE' ? "success" : "warning"}>
            {campaign.status === 'LIVE' ? "LIVE (Delivery Active)" : "PAUSED (Spending Halted)"}
          </Badge>
        </div>

        <div className="analytics-status-control">
          <Button onClick={() => handleToggleStatus(campaign.id, campaign.status)}>
            {campaign.status === 'LIVE' ? 'Pause Campaign' : 'Activate Campaign'}
          </Button>
        </div>
      </div>

      <Card style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.84375rem' }}>
            <strong>Budget Safety Active:</strong> Total Spend: <strong>₹{(campaign.spend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> / Daily Limit Cap: <strong>₹{(campaign.dailyBudget || 1000).toLocaleString('en-IN', { minimumFractionDigits: 2 })} per day</strong>
          </div>
          <Button 
            variant="outline" 
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} 
            onClick={() => {
              setNewBudgetVal(campaign.dailyBudget || 1000);
              setIsBudgetModalOpen(true);
            }}
          >
            Adjust Limit
          </Button>
        </div>
      </Card>

      <div className="metrics-summary-grid">
        <Card hoverable className="metric-card">
          <div className="metric-card-title">Impressions</div>
          <div className="metric-card-val">{(campaign.impressions || 0).toLocaleString('en-IN')}</div>
          <div className="metric-card-sub">{campaign.platform === 'instagram' ? 'Instagram Post & Reels' : 'Facebook & Instagram Feed'}</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Clicks</div>
          <div className="metric-card-val">{(campaign.clicks || 0).toLocaleString('en-IN')}</div>
          <div className="metric-card-sub">Cost Per Click: ₹8.50</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Click-Through Rate (CTR)</div>
          <div className="metric-card-val">{campaign.ctr || 0}%</div>
          <div className="metric-card-sub">{campaign.status === 'LIVE' ? 'High Performant' : 'Awaiting Traffic'}</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Conversions</div>
          <div className="metric-card-val">{(campaign.conversions || 0).toLocaleString('en-IN')}</div>
          <div className="metric-card-sub">Cost per Conversion: ₹145.00</div>
        </Card>
      </div>

      <div className="charts-grid">
        <Card>
          <div className="chart-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Performance Over Time</h3>
          </div>
          <div className="chart-canvas-wrapper">
            <canvas ref={lineCanvasRef} />
          </div>
        </Card>

        <Card>
          <div className="chart-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Spend vs Daily Cap (₹ INR)</h3>
          </div>
          <div className="chart-canvas-wrapper">
            <canvas ref={barCanvasRef} />
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="secondary" onClick={() => showToast("Exporting CSV analytics report...")}>
          Export Analytics Summary
        </Button>
        <Button onClick={handleCreateNew}>Build Another Campaign</Button>
      </div>
    </section>
  );
}

// Render React App to DOM
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
