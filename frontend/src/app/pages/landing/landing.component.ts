import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="landing-container">
      <!-- AICTE Header Banner -->
      <section class="hero-section">
        <div class="hero-inner">
          <div class="pill-badge">
            <span class="live-dot"></span>
            <span class="sih-tag">SIH26263 • REGULATION BUREAU</span>
            <span>Approval Process & Academic Data Synchronization 2026-2027</span>
          </div>

          <h1 class="hero-title">One Nation, One Student ID</h1>
          <h2 class="hero-subtitle">APAAR Verification Platform for AICTE-Approved Institutions</h2>
          <p class="hero-desc">
            National e-Governance architecture powered by <strong>DigiLocker & National Academic Depository (NAD)</strong> to audit approved intake, manage Supernumerary and NRI quotas, and intercept cross-institution duplicate admissions.
          </p>

          <!-- 3 Portals Horizontal Service Strip (Restrained, Structured, Non-Boxy) -->
          <div class="portals-strip">
            <div class="portal-entry" (click)="navigate('/student')">
              <div class="portal-icon">🎓</div>
              <div class="portal-info">
                <h3>Student Portal</h3>
                <p>Direct APAAR ID verification, view ABC credits, and print digital academic pass.</p>
              </div>
              <div class="entry-arrow">Launch Portal ➔</div>
            </div>

            <div class="portal-entry" (click)="navigate('/college')">
              <div class="portal-icon amber-icon">🏛️</div>
              <div class="portal-info">
                <h3>College Admin</h3>
                <p>Manage enrolments, upload batches, audit intake capacity, and resolve duplicate flags.</p>
              </div>
              <div class="entry-arrow text-amber">Manage Enrolments ➔</div>
            </div>

            <div class="portal-entry" (click)="navigate('/aicte')">
              <div class="portal-icon green-icon">🛡️</div>
              <div class="portal-info">
                <h3>AICTE Super Admin</h3>
                <p>Pan-India state analytics, excess enrolment alerts, Kafka logs, and Excel reports.</p>
              </div>
              <div class="entry-arrow text-green">National Dashboard ➔</div>
            </div>
          </div>

          <!-- Quick Search Box -->
          <div class="search-box-card gov-card">
            <form (ngSubmit)="searchApaar()" class="search-form">
              <input
                type="text"
                [(ngModel)]="searchId"
                name="searchId"
                placeholder="Enter 12-digit APAAR ID (e.g. 123456789012 or APAAR12345678)..."
                class="search-input"
              />
              <button type="submit" class="gov-btn-saffron">Verify Now</button>
            </form>
            <div class="demo-pills">
              <span>Quick Test Presets:</span>
              <button type="button" (click)="setDemo('123456789012')">Verified: <strong>123456789012</strong></button>
              <button type="button" (click)="setDemo('100000000013')">Pending: <strong>100000000013</strong></button>
              <button type="button" (click)="setDemo('100000000005')">Duplicate: <strong>100000000005</strong></button>
              <button type="button" (click)="setDemo('100000000012')">Duplicate #2: <strong>100000000012</strong></button>
              <button type="button" (click)="setDemo('APAAR12345678')">Legacy: <strong>APAAR12345678</strong></button>
            </div>
          </div>
        </div>
      </section>

      <!-- Institutional Notice Board (Clean Institutional Layout) -->
      <section class="notice-section">
        <div class="notice-inner">
          <div class="notice-col-left gov-card">
            <div class="notice-header">
              <h3>AICTE Approval Process & Student Record Directives 2026-2027</h3>
              <span class="clause-tag">APH Clause 8.4</span>
            </div>
            <div class="notice-items">
              <div class="notice-item">
                <div class="item-text">
                  <h4>Mandatory APAAR ID Integration for All Admitted Students</h4>
                  <p>Institutions must validate every student's 12-digit APAAR ID prior to admission confirmation.</p>
                </div>
                <button class="gov-btn-outline small-btn" (click)="navigate('/college')">Upload Gateway</button>
              </div>
              <div class="notice-item">
                <div class="item-text">
                  <h4>Approved Intake vs Actual Enrolment Verification</h4>
                  <p>Automated real-time reconciliation to detect and prevent unauthorized admissions exceeding sanctioned intake.</p>
                </div>
                <button class="gov-btn-outline small-btn" (click)="navigate('/college')">Intake Audit</button>
              </div>
              <div class="notice-item">
                <div class="item-text">
                  <h4>Supernumerary Seats (TFW), NRI & Foreign National (FN) Tracking</h4>
                  <p>Demarcation of regular vs supernumerary categories to guarantee statutory compliance under regulation guidelines.</p>
                </div>
                <button class="gov-btn-outline small-btn" (click)="navigate('/aicte')">Inspect Quotas</button>
              </div>
            </div>
          </div>

          <div class="notice-col-right gov-card">
            <div class="notice-header">
              <h3>AICTE Technical Support & Facilitation</h3>
            </div>
            <div class="support-panel support-amber">
              <h4>Helpline for APAAR ID Integration:</h4>
              <p class="phone-num">📞 (011) 29581333, 29581338, 29581342</p>
              <p class="sub-text">Available 09:30 AM to 06:00 PM (Mon-Fri)</p>
            </div>
            <div class="support-panel support-blue">
              <h4>Live Video Support Facilitation:</h4>
              <p class="sub-text">Connect with AICTE Technical Officers for live onboarding and bulk upload guidance.</p>
              <button class="gov-btn-primary full-btn" (click)="alertSupport()">Open Live Video Session</button>
            </div>
          </div>
        </div>
      </section>

      <!-- National Statistics Ribbon (Card Reduction: Unified Ribbon with Hairline Dividers) -->
      <section class="stats-section">
        <div class="stats-inner">
          <div class="metric-ribbon">
            <div class="metric-cell">
              <span class="cell-label">Approved Institutions</span>
              <div class="cell-value">9,840</div>
              <span class="cell-sub text-green">● 100% Onboarded Pan-India</span>
            </div>
            <div class="metric-cell">
              <span class="cell-label">Total Enrolled Students</span>
              <div class="cell-value">34.2 Lakh</div>
              <span class="cell-sub text-navy">AY 2026-27 Intake Baseline</span>
            </div>
            <div class="metric-cell">
              <span class="cell-label">APAAR Verified Records</span>
              <div class="cell-value text-green">92.4%</div>
              <span class="cell-sub text-green">DigiLocker & NAD Synced</span>
            </div>
            <div class="metric-cell">
              <span class="cell-label">Duplicates Intercepted</span>
              <div class="cell-value text-red">14,210</div>
              <span class="cell-sub text-red">Ghost Seats Blocked</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-container { min-height: 100vh; }
    .hero-section { background: linear-gradient(to bottom, #EFF6FF, #F8FAFC); padding: 48px 20px 40px; text-align: center; border-bottom: 1px solid #E2E8F0; }
    .hero-inner { max-width: 1100px; margin: 0 auto; }
    .pill-badge { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; padding: 5px 14px; border-radius: 50px; font-size: 12px; font-weight: 600; color: #0F2C61; border: 1px solid #BFDBFE; margin-bottom: 20px; }
    .live-dot { width: 7px; height: 7px; background: #16A34A; border-radius: 50%; }
    .sih-tag { background: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; }
    .hero-title { font-size: 38px; font-weight: 800; color: #0F2C61; margin: 0; letter-spacing: -0.02em; }
    .hero-subtitle { font-size: 22px; font-weight: 700; color: #D97706; margin: 8px 0 16px; }
    .hero-desc { font-size: 14px; color: #475569; max-width: 820px; margin: 0 auto 32px; line-height: 1.6; }

    /* Portals Horizontal Strip (Card Reduction: Single connected strip) */
    .portals-strip { display: flex; gap: 16px; margin-bottom: 30px; text-align: left; }
    @media(max-width: 850px) { .portals-strip { flex-direction: column; } }
    .portal-entry { flex: 1; background: #ffffff; border: 1px solid #CBD5E1; border-radius: 8px; padding: 18px 20px; cursor: pointer; transition: all 0.15s ease; display: flex; flex-direction: column; justify-content: space-between; }
    .portal-entry:hover { border-color: #0F2C61; background: #F8FAFC; transform: translateY(-2px); }
    .portal-icon { font-size: 24px; margin-bottom: 8px; }
    .portal-info h3 { font-size: 16px; font-weight: 700; color: #0F2C61; margin: 0 0 6px; }
    .portal-info p { font-size: 12px; color: #64748B; margin: 0 0 12px; line-height: 1.4; }
    .entry-arrow { font-size: 12px; font-weight: 700; color: #0F2C61; border-top: 1px solid #F1F5F9; padding-top: 10px; }
    .text-amber { color: #D97706; }
    .text-green { color: #15803D; }
    .text-red { color: #B91C1C; }
    .text-navy { color: #0F2C61; }

    /* Search Box */
    .search-box-card { max-width: 680px; margin: 0 auto; padding: 20px; }
    .search-form { display: flex; gap: 10px; }
    .search-input { flex: 1; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 6px; font-family: monospace; font-size: 13px; outline: none; }
    .search-input:focus { border-color: #0F2C61; }
    .demo-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; font-size: 11px; align-items: center; justify-content: center; }
    .demo-pills button { background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 4px; padding: 3px 8px; cursor: pointer; font-size: 11px; color: #334155; }
    .demo-pills button:hover { background: #E2E8F0; }

    /* Notice Section */
    .notice-section { padding: 36px 20px; max-width: 1100px; margin: 0 auto; }
    .notice-inner { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    @media(max-width: 768px) { .notice-inner { grid-template-columns: 1fr; } }
    .notice-col-left, .notice-col-right { padding: 22px; }
    .notice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 16px; }
    .notice-header h3 { font-size: 15px; font-weight: 700; color: #0F2C61; margin: 0; }
    .clause-tag { background: #EFF6FF; color: #1E3A8A; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; border: 1px solid #BFDBFE; }
    .notice-items { display: flex; flex-direction: column; gap: 10px; }
    .notice-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border: 1px solid #E2E8F0; border-radius: 6px; background: #FAFAFA; gap: 12px; }
    .item-text h4 { font-size: 13px; font-weight: 700; color: #0F2C61; margin: 0 0 3px; }
    .item-text p { font-size: 12px; color: #64748B; margin: 0; line-height: 1.4; }
    .small-btn { padding: 5px 10px; font-size: 11px; white-space: nowrap; }

    .support-panel { padding: 14px; border-radius: 6px; margin-bottom: 12px; }
    .support-amber { background: #FFFBEB; border: 1px solid #FEF3C7; }
    .support-blue { background: #EFF6FF; border: 1px solid #DBEAFE; }
    .support-panel h4 { font-size: 12px; font-weight: 700; margin: 0 0 4px; color: #1E293B; }
    .phone-num { font-family: monospace; font-weight: 700; font-size: 12px; margin: 4px 0; color: #0F2C61; }
    .sub-text { font-size: 11px; color: #64748B; margin: 0 0 8px; }
    .full-btn { width: 100%; justify-content: center; }

    /* Stats Section */
    .stats-section { max-width: 1100px; margin: 0 auto 36px; padding: 0 20px; }
    .stats-inner { width: 100%; }
  `]
})
export class LandingComponent {
  searchId: string = '';

  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigateByUrl(path);
  }

  setDemo(id: string) {
    this.searchId = id;
    this.searchApaar();
  }

  searchApaar() {
    if (this.searchId.trim()) {
      this.router.navigate(['/student'], { queryParams: { id: this.searchId.trim() } });
    }
  }

  alertSupport() {
    alert('Connecting to AICTE Live Video Support Facilitation Desk...');
  }
}
