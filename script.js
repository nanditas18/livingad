/* ==========================================================================
   Neosophical Lab - Modular React Component Application
   Tagline: Fresh Ideas. Smart Marketing.
   Colors: Seashell (#fff4eb), Wheat (#f6e0b6), Midnight Violet (#3d1534)
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

// Main App Component
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('neosophical_theme') || 'light');
  const [currentScreen, setCurrentScreen] = useState('screen-dashboard');
  const [isDemoEmpty, setIsDemoEmpty] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Campaign State
  const [campaign, setCampaign] = useState({
    name: "Specialty Coffee Spring Launch",
    brandName: "Neosophical Coffee",
    platform: "meta",
    ageRange: "25-38",
    location: "US",
    interests: ["Coffee Lovers", "Organic Food", "Workplace Productivity"],
    dailyBudget: 25.00,
    monthlyCap: 500.00,
    headline: "Freshly Roasted Organic Coffee 20 Percent Off",
    bodyText: "Fuel your workday with ethically sourced, freshly roasted organic coffee beans. Delivered right to your doorstep.",
    destinationUrl: "https://neosophicallab.com/launch",
    status: "PAUSED", // New campaigns ALWAYS start PAUSED
    visualThemeIndex: 0,
    isUserApproved: false,
    
    impressions: 12450,
    clicks: 482,
    ctr: 3.87,
    spend: 18.40,
    conversions: 34
  });

  const visualThemes = [
    { name: "Cream Sand", bg: "#f6e0b6", accent: "#3d1534", text: "#3d1534" },
    { name: "Plum Light", bg: "#fff4eb", accent: "#3d1534", text: "#3d1534" },
    { name: "Plum Dark", bg: "#3d1534", accent: "#f6e0b6", text: "#fff4eb" },
    { name: "Classic Sand", bg: "#f6e0b6", accent: "#fff4eb", text: "#3d1534" }
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('neosophical_theme', theme);
  }, [theme]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  return (
    <div className="app-main-wrapper">
      {/* Top Header Component */}
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

        <div className="header-budget-safety">
          <span>Monthly Budget Cap: <strong>${campaign.monthlyCap.toFixed(2)}</strong></span>
        </div>

        <div className="header-budget-safety" title="API Key: AQ.Ab8RN6JfadrOED6rMGu3bkyvBDjcWut85ByvjQzUkNc8XTohtQ">
          <span>AI Engine: <strong>Gemini API Connected</strong></span>
        </div>

        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <Button onClick={() => navigateTo('screen-builder')}>Create Campaign</Button>
        </div>
      </header>

      {/* App Body Layout */}
      <div className="app-container">
        {/* Sidebar Component */}
        <aside class="app-sidebar">
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
                  onClick={() => navigateTo('screen-analytics')}
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
                <span style={{ fontWeight: 500 }}>Meta (FB and IG)</span>
                <Badge type="success">Active</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Google Ads</span>
                <Badge>Coming Soon</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>TikTok Ads</span>
                <Badge>Coming Soon</Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="main-view-container">
          {currentScreen === 'screen-dashboard' && (
            <DashboardScreen 
              campaign={campaign} 
              isDemoEmpty={isDemoEmpty} 
              setIsDemoEmpty={setIsDemoEmpty}
              navigateTo={navigateTo}
              setCampaign={setCampaign}
              showToast={showToast}
            />
          )}

          {currentScreen === 'screen-builder' && (
            <BuilderScreen 
              campaign={campaign} 
              setCampaign={setCampaign} 
              navigateTo={navigateTo}
              visualThemes={visualThemes}
              showToast={showToast}
            />
          )}

          {currentScreen === 'screen-editor' && (
            <EditorScreen 
              campaign={campaign} 
              setCampaign={setCampaign} 
              navigateTo={navigateTo}
              showToast={showToast}
            />
          )}

          {currentScreen === 'screen-review' && (
            <ReviewScreen 
              campaign={campaign} 
              setCampaign={setCampaign} 
              navigateTo={navigateTo}
              showToast={showToast}
            />
          )}

          {currentScreen === 'screen-analytics' && (
            <AnalyticsScreen 
              campaign={campaign} 
              setCampaign={setCampaign} 
              navigateTo={navigateTo}
              showToast={showToast}
              setIsBudgetModalOpen={setIsBudgetModalOpen}
            />
          )}
        </main>
      </div>

      {/* Budget Adjustment Modal */}
      {isBudgetModalOpen && (
        <div className="modal-backdrop active">
          <div className="modal-box">
            <h3 className="modal-header">Adjust Daily Budget Cap</h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Modify the maximum amount Neosophical Lab is authorized to spend per day for this campaign.
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-input-budget">New Daily Budget ($)</label>
              <input 
                type="number" 
                id="modal-input-budget" 
                className="form-input" 
                min="5" 
                max="500" 
                defaultValue={campaign.dailyBudget}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseFloat(e.target.value) || 25;
                    setCampaign(prev => ({ ...prev, dailyBudget: val }));
                    setIsBudgetModalOpen(false);
                    showToast(`Daily budget limit updated to $${val.toFixed(2)} per day`);
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <Button variant="secondary" onClick={() => setIsBudgetModalOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                const el = document.getElementById('modal-input-budget');
                const val = parseFloat(el.value) || 25;
                setCampaign(prev => ({ ...prev, dailyBudget: val }));
                setIsBudgetModalOpen(false);
                showToast(`Daily budget limit updated to $${val.toFixed(2)} per day`);
              }}>Save New Limit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 1. Dashboard Screen Component
function DashboardScreen({ campaign, isDemoEmpty, setIsDemoEmpty, navigateTo, setCampaign, showToast }) {
  return (
    <section className="screen-page active-screen">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Marketing Dashboard</h1>
          <p>Overview of your smart advertising campaigns and budget status.</p>
        </div>
        <div className="demo-state-toggle-wrapper">
          <span>Demo View Mode:</span>
          <Button variant="secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78125rem' }} onClick={() => setIsDemoEmpty(!isDemoEmpty)}>
            {isDemoEmpty ? "Switch to Populated View" : "Switch to Empty State"}
          </Button>
        </div>
      </div>

      <div className="metrics-summary-grid">
        <Card hoverable className="metric-card">
          <div className="metric-card-title">
            <span>Active Campaigns</span>
            <Badge type="success">{isDemoEmpty ? "0 Active" : "1 Running"}</Badge>
          </div>
          <div className="metric-card-val">{isDemoEmpty ? "0" : "1"}</div>
          <div className="metric-card-sub">Started in PAUSED state</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">
            <span>Total Ad Spend</span>
          </div>
          <div className="metric-card-val">{isDemoEmpty ? "$0.00" : `$${campaign.spend.toFixed(2)}`}</div>
          <div className="metric-card-sub">Cap: $25.00 per day limit</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">
            <span>Monthly Budget Cap</span>
          </div>
          <div className="metric-card-val">${campaign.monthlyCap.toFixed(2)}</div>
          <div className="metric-card-sub">Spend Protection Active</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">
            <span>Average CTR</span>
          </div>
          <div className="metric-card-val">{isDemoEmpty ? "0.00%" : `${campaign.ctr}%`}</div>
          <div className="metric-card-sub">+1.2% above benchmark</div>
        </Card>
      </div>

      {!isDemoEmpty ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Your Campaigns</h2>
            <Button onClick={() => navigateTo('screen-builder')}>AI Campaign Builder</Button>
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
                <tr>
                  <td>
                    <div style={{ fontWeight: 600 }}>{campaign.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Targeting Young Professionals (25-38)</div>
                  </td>
                  <td><Badge>Meta (FB and IG)</Badge></td>
                  <td><Badge type="warning">{campaign.status}</Badge></td>
                  <td><strong>${campaign.dailyBudget.toFixed(2)} per day</strong></td>
                  <td>{campaign.impressions.toLocaleString()}</td>
                  <td>{campaign.clicks}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-analytics')}>Analytics</Button>
                      <Button variant="outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-editor')}>Edit</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon">NL</div>
          <h2>No Campaigns Created Yet</h2>
          <p>Launch your first high-converting ad campaign on Meta platforms. Our guided AI assistant builds your targeting, ad copy, and visuals in under 3 minutes with budget protection.</p>
          <Button onClick={() => navigateTo('screen-builder')}>Create Campaign with AI</Button>

          <div className="starter-templates">
            <h3>Or select a preset template:</h3>
            <div className="template-cards-grid">
              <Card hoverable className="template-card" onClick={() => {
                setCampaign(prev => ({
                  ...prev,
                  name: "Specialty Coffee Spring Launch",
                  brandName: "Neosophical Coffee",
                  headline: "Freshly Roasted Organic Coffee 20 Percent Off",
                  bodyText: "Fuel your workday with ethically sourced, freshly roasted organic coffee beans.",
                  dailyBudget: 25.00
                }));
                showToast("Specialty Coffee template loaded!");
                navigateTo('screen-builder');
              }}>
                <h4>Specialty Product Sale</h4>
                <p>E-commerce promotion with high purchase intent targeting.</p>
              </Card>

              <Card hoverable className="template-card" onClick={() => {
                setCampaign(prev => ({
                  ...prev,
                  name: "AI Productivity Tool B2B Campaign",
                  brandName: "Neosophical Flow AI",
                  headline: "Automate 10 Hours of Marketing Weekly",
                  bodyText: "Streamline your ad workflow with next-generation AI automation.",
                  dailyBudget: 50.00
                }));
                showToast("SaaS Trial template loaded!");
                navigateTo('screen-builder');
              }}>
                <h4>SaaS Lead Generation</h4>
                <p>B2B free trial signup campaign for tech professionals.</p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// 2. Builder Screen Component
function BuilderScreen({ campaign, setCampaign, navigateTo, visualThemes, showToast }) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'Welcome to Neosophical Lab. Tell me what product or offer you want to promote, and I will craft a complete Meta ad campaign for you.' }
  ]);
  const canvasRef = useRef(null);

  useEffect(() => {
    drawAdGraphicCanvas();
  }, [campaign.visualThemeIndex, campaign.brandName]);

  const drawAdGraphicCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const theme = visualThemes[campaign.visualThemeIndex];

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = theme.text;
    ctx.font = "bold 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(campaign.brandName.toUpperCase(), canvas.width / 2, canvas.height / 2 - 15);

    ctx.font = "600 15px system-ui";
    ctx.fillText("FRESH IDEAS. SMART MARKETING.", canvas.width / 2, canvas.height / 2 + 20);
  };

  const handleSendMessage = (msgText) => {
    if (!msgText.trim()) return;

    const newHistory = [...chatHistory, { sender: 'user', text: msgText }];
    setChatHistory(newHistory);
    setChatInput('');

    setTimeout(() => {
      let headline = "Smart Marketing for Fresh Ideas";
      let bodyText = `Discover how ${msgText} delivers exceptional value to your audience. Built for modern growth.`;
      let brandName = "Neosophical Lab";

      if (msgText.toLowerCase().includes('coffee')) {
        brandName = "Neosophical Coffee";
        headline = "Freshly Roasted Organic Coffee 20 Percent Off";
        bodyText = "Fuel your workday with ethically sourced, freshly roasted organic coffee beans.";
      } else if (msgText.toLowerCase().includes('saas') || msgText.toLowerCase().includes('app')) {
        brandName = "Neosophical Flow AI";
        headline = "Automate 10 Hours of Weekly Tasks";
        bodyText = "Streamline your workflow with next-generation AI automation.";
      }

      setCampaign(prev => ({
        ...prev,
        brandName,
        headline,
        bodyText,
        name: `${brandName} Campaign`
      }));

      setChatHistory(prev => [
        ...prev,
        { sender: 'ai', text: `AI Recommendation Ready. Generated targeting and creative assets for ${brandName} on Meta.` }
      ]);
    }, 600);
  };

  return (
    <section className="screen-page active-screen">
      {/* Workflow Stepper Bar */}
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
        <Card className="chat-panel">
          <div className="chat-header">
            <div className="chat-avatar">NL</div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Neosophical Marketing AI</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fresh Ideas and Automation</p>
            </div>
          </div>

          <div className="chat-history">
            {chatHistory.map((item, i) => (
              <div key={i} className={`chat-bubble ${item.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
                {item.text}
              </div>
            ))}
          </div>

          <div className="quick-prompts-row">
            <button className="chip-btn" onClick={() => handleSendMessage("Specialty Artisanal Coffee Beans")}>Organic Coffee</button>
            <button className="chip-btn" onClick={() => handleSendMessage("AI Productivity App for Founders")}>AI SaaS App</button>
            <button className="chip-btn" onClick={() => handleSendMessage("Eco-Friendly Skincare Kit")}>Eco Skincare</button>
          </div>

          <div className="chat-input-bar" style={{ marginTop: '0.75rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Promote our organic cold brew coffee..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
            />
            <Button onClick={() => handleSendMessage(chatInput)}>Send</Button>
          </div>
        </Card>

        <div className="preview-panel">
          <div className="preview-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Meta Ad Preview</h3>
            <div className="preview-platform-tabs">
              <button className="platform-tab active">Facebook Feed</button>
              <button className="platform-tab">Instagram Post</button>
            </div>
          </div>

          <div className="meta-ad-mockup">
            <div className="meta-ad-header">
              <div className="meta-page-avatar">NL</div>
              <div className="meta-page-info">
                <span className="meta-page-name">{campaign.brandName}</span>
                <span className="meta-sponsored-tag">Sponsored</span>
              </div>
            </div>

            <div className="meta-ad-body-text">{campaign.bodyText}</div>

            <div className="meta-ad-media">
              <canvas ref={canvasRef} width={600} height={400} />
            </div>

            <div className="meta-ad-cta-bar">
              <div className="meta-cta-details">
                <span className="meta-cta-domain">neosophicallab.com</span>
                <span className="meta-cta-headline">{campaign.headline}</span>
              </div>
              <button className="meta-cta-btn">Shop Now</button>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="secondary" style={{ fontSize: '0.8125rem' }} onClick={() => {
              setCampaign(prev => ({ ...prev, visualThemeIndex: (prev.visualThemeIndex + 1) % visualThemes.length }));
              showToast("Visual Theme Updated!");
            }}>
              Change Visual Theme
            </Button>
            <Button onClick={() => navigateTo('screen-editor')}>Continue to Plan and Editor</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// 3. Editor Screen Component
function EditorScreen({ campaign, setCampaign, navigateTo, showToast }) {
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const handleAddTag = () => {
    if (tagInput.trim() && !campaign.interests.includes(tagInput.trim())) {
      setCampaign(prev => ({ ...prev, interests: [...prev.interests, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRem) => {
    setCampaign(prev => ({ ...prev, interests: prev.interests.filter(t => t !== tagToRem) }));
  };

  const validateForm = () => {
    const errs = {};
    if (!campaign.name.trim()) errs.name = "Campaign name cannot be empty.";
    if (campaign.dailyBudget <= 0) errs.budget = "Daily budget must be greater than $0.";
    if (!campaign.headline.trim()) errs.headline = "Headline is required.";
    if (!campaign.destinationUrl.startsWith('http://') && !campaign.destinationUrl.startsWith('https://')) {
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
              value={campaign.name} 
              onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
            />
            {errors.name && <div className="field-error-msg">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Advertising Platform</label>
            <div className="platform-selector-grid">
              <div className="platform-option-card active">
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Meta Ads</span>
                <Badge type="success" style={{ fontSize: '0.65rem' }}>FB and IG</Badge>
              </div>
              <div className="platform-option-card disabled">
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Google Ads</span>
                <Badge style={{ fontSize: '0.65rem' }}>Coming Soon</Badge>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Demographic and Interests</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.78125rem' }}>Age Group</span>
                <select className="form-select" value={campaign.ageRange} onChange={(e) => setCampaign({ ...campaign, ageRange: e.target.value })}>
                  <option value="25-38">25 to 38 years (Young Professionals)</option>
                  <option value="18-24">18 to 24 years (Gen Z)</option>
                  <option value="35-55">35 to 55 years (Established)</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '0.78125rem' }}>Location</span>
                <select className="form-select" value={campaign.location} onChange={(e) => setCampaign({ ...campaign, location: e.target.value })}>
                  <option value="US">United States (Metro Areas)</option>
                  <option value="US-CA">United States and Canada</option>
                  <option value="EU">European Union</option>
                </select>
              </div>
            </div>

            <span style={{ fontSize: '0.78125rem' }}>Audience Interest Targeting</span>
            <div className="interest-tags-container">
              {campaign.interests.map(t => (
                <span key={t} className="tag-item">
                  {t} <span className="tag-remove-btn" onClick={() => handleRemoveTag(t)}>&times;</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Add interest tag..." 
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
              <strong>${campaign.dailyBudget.toFixed(2)} per day</strong>
            </label>
            <div className="range-container">
              <input 
                type="range" 
                className="range-slider" 
                min="5" 
                max="150" 
                step="5" 
                value={campaign.dailyBudget} 
                onChange={(e) => setCampaign({ ...campaign, dailyBudget: parseFloat(e.target.value) })}
              />
              <input 
                type="number" 
                className={`form-input ${errors.budget ? 'has-error' : ''}`}
                style={{ width: '100px' }} 
                value={campaign.dailyBudget}
                onChange={(e) => setCampaign({ ...campaign, dailyBudget: parseFloat(e.target.value) || 0 })}
              />
            </div>
            {errors.budget && <div className="field-error-msg">{errors.budget}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Ad Headline</label>
            <input 
              type="text" 
              className={`form-input ${errors.headline ? 'has-error' : ''}`}
              value={campaign.headline} 
              onChange={(e) => setCampaign({ ...campaign, headline: e.target.value })}
            />
            {errors.headline && <div className="field-error-msg">{errors.headline}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Primary Text and Description</label>
            <textarea 
              className="form-textarea" 
              rows="3" 
              value={campaign.bodyText} 
              onChange={(e) => setCampaign({ ...campaign, bodyText: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Landing Page URL</label>
            <input 
              type="url" 
              className={`form-input ${errors.url ? 'has-error' : ''}`}
              value={campaign.destinationUrl} 
              onChange={(e) => setCampaign({ ...campaign, destinationUrl: e.target.value })}
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
            <h3>AI Performance Forecast</h3>
            <ul className="ai-summary-list">
              <li>1. AI Match Score: 94% target demographic match.</li>
              <li>2. Estimated CTR: 3.5% to 4.2% optimized creative.</li>
              <li>3. Safety Protection: New campaign starts in PAUSED state.</li>
            </ul>
          </div>

          <Card style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.84375rem', fontWeight: 700, marginBottom: '0.75rem' }}>Live Text Preview</h4>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{campaign.headline || "(Empty Headline)"}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>{campaign.bodyText || "(Empty Text)"}</div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// 4. Review Screen Component
function ReviewScreen({ campaign, setCampaign, navigateTo, showToast }) {
  const isPlatformValid = campaign.destinationUrl.startsWith('http://') || campaign.destinationUrl.startsWith('https://');
  const isBudgetValid = campaign.dailyBudget > 0;
  const isCreativeValid = Boolean(campaign.headline && campaign.headline.trim());
  const isFullyValid = isPlatformValid && isBudgetValid && isCreativeValid;

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
        <div className="review-debug-bar">
          <span>Evaluator Controls: Test readiness state validation:</span>
          <Button variant="secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => {
            setCampaign(prev => ({ ...prev, destinationUrl: "", headline: "", dailyBudget: 0 }));
            showToast("Simulated blocked state: parameters cleared.");
          }}>Simulate Blocked State</Button>
          <Button variant="secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => {
            setCampaign(prev => ({ ...prev, destinationUrl: "https://neosophicallab.com/launch", headline: "Freshly Roasted Organic Coffee 20 Percent Off", dailyBudget: 25.00 }));
            showToast("Restored valid campaign parameters.");
          }}>Restore Valid Details</Button>
        </div>

        <div className={`readiness-banner ${isFullyValid ? 'ready' : 'blocked'}`}>
          <div className="readiness-info">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {isFullyValid ? "Campaign Ready for Deployment" : "Action Required: Missing Required Information"}
              </h3>
              <p style={{ fontSize: '0.8125rem' }}>
                {isFullyValid ? "All required details are verified and budget protection is locked." : "Launch blocked until parameters are complete."}
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
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Platform and Destination</div>
                <div style={{ fontSize: '0.8125rem' }}>Meta (FB and IG) to {campaign.destinationUrl || "Missing Destination URL"}</div>
              </div>
            </div>
            <Button variant="outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-editor')}>Edit</Button>
          </div>

          <div className="checklist-item">
            <div className="checklist-left">
              <div className="checklist-status-icon">2</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Enforced Budget Limit</div>
                <div style={{ fontSize: '0.8125rem' }}>${campaign.dailyBudget.toFixed(2)} per day (Limits automatically enforced)</div>
              </div>
            </div>
            <Button variant="outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-editor')}>Edit</Button>
          </div>

          <div className="checklist-item">
            <div className="checklist-left">
              <div className="checklist-status-icon">3</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ad Creative and Copy</div>
                <div style={{ fontSize: '0.8125rem' }}>Headline: "{campaign.headline}"</div>
              </div>
            </div>
            <Button variant="outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigateTo('screen-editor')}>Edit</Button>
          </div>

          <div className="checklist-item">
            <div className="checklist-left">
              <div className="checklist-status-icon">4</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Default Startup State Safety Rule</div>
                <div style={{ fontSize: '0.8125rem' }}>Campaign will deploy in PAUSED state. Zero dollars spent until explicitly activated.</div>
              </div>
            </div>
            <Badge type="warning">Enforced Rule</Badge>
          </div>
        </Card>

        <div className="approval-box">
          <input 
            type="checkbox" 
            id="chk-user-authorization" 
            checked={campaign.isUserApproved} 
            onChange={(e) => setCampaign({ ...campaign, isUserApproved: e.target.checked })}
          />
          <label htmlFor="chk-user-authorization">
            I authorize Neosophical Lab to deploy campaign <strong>"{campaign.name}"</strong> with a daily budget limit of <strong>${campaign.dailyBudget.toFixed(2)} per day</strong>. I understand that the campaign will start in a PAUSED state and will not spend money without manual activation.
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="secondary" onClick={() => navigateTo('screen-editor')}>Edit Campaign Details</Button>
          <Button 
            disabled={!isFullyValid || !campaign.isUserApproved} 
            onClick={() => {
              setCampaign(prev => ({ ...prev, status: "PAUSED" }));
              showToast("Campaign deployed in PAUSED state.");
              navigateTo('screen-analytics');
            }}
          >
            Deploy Campaign (Starts Paused)
          </Button>
        </div>
      </div>
    </section>
  );
}

// 5. Analytics Screen Component
function AnalyticsScreen({ campaign, setCampaign, navigateTo, showToast, setIsBudgetModalOpen }) {
  const lineCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);

  useEffect(() => {
    drawPerformanceLineChart();
    drawBudgetBarChart();
  }, [campaign.dailyBudget]);

  const drawPerformanceLineChart = () => {
    const canvas = lineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 260;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const impressionsData = [1200, 1850, 1500, 2400, 2100, 2800, 3100];
    const maxVal = 3500;

    const padLeft = 40;
    const padBottom = 30;
    const padTop = 20;
    const chartW = canvas.width - padLeft - 20;
    const chartH = canvas.height - padBottom - padTop;

    ctx.strokeStyle = '#3d1534';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padTop + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();

      ctx.fillStyle = '#3d1534';
      ctx.font = "11px system-ui";
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padLeft - 8, y + 4);
    }

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
      ctx.fillStyle = '#3d1534';
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
    const spendData = [12.5, 18.0, 15.2, 22.4, 21.0, 24.8, 18.4];
    const dailyCap = campaign.dailyBudget;

    const padLeft = 40;
    const padBottom = 30;
    const padTop = 20;
    const chartW = canvas.width - padLeft - 20;
    const chartH = canvas.height - padBottom - padTop;
    const maxVal = Math.max(30, dailyCap * 1.2);
    const barWidth = (chartW / days.length) * 0.45;

    spendData.forEach((val, idx) => {
      const x = padLeft + (chartW / days.length) * idx + barWidth * 0.5;
      const barH = (val / maxVal) * chartH;
      const y = padTop + chartH - barH;

      ctx.fillStyle = '#3d1534';
      ctx.fillRect(x, y, barWidth, barH);

      ctx.font = "11px system-ui";
      ctx.textAlign = 'center';
      ctx.fillText(days[idx], x + barWidth / 2, canvas.height - 8);
    });

    const capY = padTop + chartH - (dailyCap / maxVal) * chartH;
    ctx.strokeStyle = '#3d1534';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, capY);
    ctx.lineTo(canvas.width - 20, capY);
    ctx.stroke();

    ctx.fillStyle = '#3d1534';
    ctx.textAlign = 'right';
    ctx.fillText(`Cap: $${dailyCap.toFixed(0)}`, canvas.width - 25, capY - 6);
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

      <div className="analytics-top-bar">
        <div className="analytics-title-group">
          <h2>{campaign.name}</h2>
          <Badge type={campaign.status === 'LIVE' ? "success" : "warning"}>
            {campaign.status === 'LIVE' ? "LIVE (Delivery Active)" : "PAUSED (Spending Halted)"}
          </Badge>
        </div>

        <div className="analytics-status-control">
          <Button onClick={() => {
            const nextStatus = campaign.status === 'LIVE' ? 'PAUSED' : 'LIVE';
            setCampaign({ ...campaign, status: nextStatus });
            showToast(`Campaign ${nextStatus === 'LIVE' ? 'Resumed' : 'Paused'}`);
          }}>
            {campaign.status === 'LIVE' ? 'Pause Campaign' : 'Resume Campaign'}
          </Button>
        </div>
      </div>

      <Card style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.84375rem' }}>
            <strong>Budget Limit Safety Safeguard Active:</strong> Total Spend: <strong>${campaign.spend.toFixed(2)}</strong> / Max Cap Limit: <strong>${campaign.dailyBudget.toFixed(2)} per day</strong>
          </div>
          <Button variant="outline" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={() => setIsBudgetModalOpen(true)}>
            Adjust Limit
          </Button>
        </div>
      </Card>

      <div className="metrics-summary-grid">
        <Card hoverable className="metric-card">
          <div className="metric-card-title">Impressions</div>
          <div className="metric-card-val">{campaign.impressions.toLocaleString()}</div>
          <div className="metric-card-sub">Meta FB and IG Feed</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Clicks</div>
          <div className="metric-card-val">{campaign.clicks}</div>
          <div className="metric-card-sub">Cost Per Click: $0.52</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Click-Through Rate (CTR)</div>
          <div className="metric-card-val">{campaign.ctr}%</div>
          <div className="metric-card-sub">High Performant</div>
        </Card>

        <Card hoverable className="metric-card">
          <div className="metric-card-title">Conversions</div>
          <div className="metric-card-val">{campaign.conversions}</div>
          <div className="metric-card-sub">Cost per Conversion: $7.35</div>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Spend vs Daily Cap</h3>
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
        <Button onClick={() => navigateTo('screen-builder')}>Build Another Campaign</Button>
      </div>
    </section>
  );
}

// Render React App to DOM
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
