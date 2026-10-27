import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApaarService, College, ReviewCase } from '../../services/apaar.service';

@Component({
  selector: 'app-aicte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="aicte-container">
      <!-- Super Admin Header -->
      <div class="header-card gov-card">
        <div class="header-left">
          <div class="avatar-badge">🛡️</div>
          <div>
            <h1>AICTE Central Super Admin Dashboard</h1>
            <p>Department of Higher Education • AICTE Regulation Bureau • National Monitoring Portal</p>
          </div>
        </div>

        <div class="header-actions">
          <button (click)="downloadExcel()" class="gov-btn-saffron">
            📊 Export National Compliance Report (.csv)
          </button>
          <button (click)="printReport()" class="gov-btn-primary">
            🖨️ Export PDF Report
          </button>
        </div>
      </div>

      <div *ngIf="exportToast" class="export-toast">
        {{ exportToast }}
      </div>

      <!-- National KPI Ribbon (Card Reduction: 1 aligned ribbon instead of 4 floating cards) -->
      <div class="metric-ribbon">
        <div class="metric-cell">
          <span class="cell-label">Approved Institutions</span>
          <div class="cell-value">9,840</div>
          <span class="cell-sub text-green">● All 28 States & UTs Active</span>
        </div>
        <div class="metric-cell">
          <span class="cell-label">National Enrolments</span>
          <div class="cell-value text-blue">34.6 L</div>
          <span class="cell-sub text-amber">Sanctioned: 34.2 L (+1.1%)</span>
        </div>
        <div class="metric-cell">
          <span class="cell-label">APAAR Verified Records</span>
          <div class="cell-value text-green">31.1 L</div>
          <span class="cell-sub text-green">89.8% Synced with DigiLocker</span>
        </div>
        <div class="metric-cell">
          <span class="cell-label">Duplicates Intercepted</span>
          <div class="cell-value text-red">14,210</div>
          <span class="cell-sub text-red">Anomaly Engine Flags</span>
        </div>
      </div>

      <!-- State-Wise Official Bar Chart (Preserved from Repo 2) -->
      <div class="state-card gov-card">
        <div class="chart-header">
          <div>
            <h3>Pan-India State-Wise APAAR Verification Progress</h3>
            <p class="sub-text">Comparative student verification statistics across major technical education states</p>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-badge total-badge"></span> Total Sanctioned Enrolments</span>
            <span class="legend-item"><span class="legend-badge verified-badge"></span> Verified APAAR Records</span>
          </div>
        </div>

        <div class="bar-chart-wrapper">
          <div class="y-axis">
            <span>600k</span>
            <span>450k</span>
            <span>300k</span>
            <span>150k</span>
            <span>0</span>
          </div>

          <div class="chart-plot">
            <div class="grid-line" style="bottom: 100%;"></div>
            <div class="grid-line" style="bottom: 75%;"></div>
            <div class="grid-line" style="bottom: 50%;"></div>
            <div class="grid-line" style="bottom: 25%;"></div>
            <div class="grid-line baseline" style="bottom: 0%;"></div>

            <div class="columns-container">
              <div *ngFor="let s of stateData" class="state-column-group">
                <div class="dual-bars">
                  <div
                    class="standing-bar total-bar"
                    [style.height.%]="(s.total / maxStateVal * 100)"
                    [title]="s.state + ' Total Enrolment: ' + (s.total | number)"
                  ></div>
                  <div
                    class="standing-bar verified-bar"
                    [style.height.%]="(s.verified / maxStateVal * 100)"
                    [title]="s.state + ' Verified: ' + (s.verified | number) + ' (' + (s.verified / s.total * 100).toFixed(1) + '%)'"
                  ></div>
                </div>
                <div class="x-axis-info">
                  <span class="state-name">{{ s.state }}</span>
                  <span class="state-sync">{{ (s.verified / s.total * 100).toFixed(1) }}% Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AICTE Exception & Review Queue (Repo 1 Feature Integration) -->
      <div class="review-queue-card gov-card">
        <div class="section-top-header">
          <div>
            <h3>AICTE Regulatory Exception Review Queue</h3>
            <p class="sub-text">Intake overruns, cross-institution duplicate admissions, and student disputes requiring mandatory administrative notes</p>
          </div>
          <div class="queue-status-badge">
            {{ openReviewCount }} Pending Decision
          </div>
        </div>

        <div class="table-container">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Type & Severity</th>
                <th>Institution</th>
                <th>APAAR / Subject</th>
                <th>Conflict Details</th>
                <th>Created</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of reviewCases">
                <td class="font-mono text-bold">{{ c.id }}</td>
                <td>
                  <span class="severity-pill" [ngClass]="c.severity.toLowerCase()">{{ c.severity }}</span>
                  <div class="case-type-sub">{{ c.caseType.replace('_', ' ') }}</div>
                </td>
                <td>
                  <strong>{{ c.institutionName }}</strong>
                  <div class="code-sub">{{ c.institutionId }}</div>
                </td>
                <td>
                  <span class="font-mono">{{ c.apaarId }}</span>
                  <div><small>{{ c.studentName }}</small></div>
                </td>
                <td class="details-col">{{ c.details }}</td>
                <td class="date-col">{{ c.createdAt | slice:0:10 }}</td>
                <td>
                  <span class="status-pill" [ngClass]="c.status === 'APPROVED' ? 'status-verified' : c.status === 'REJECTED' ? 'status-duplicate' : 'status-pending'">
                    {{ c.status }}
                  </span>
                </td>
                <td>
                  <button *ngIf="c.status === 'OPEN'" (click)="openDecisionModal(c)" class="gov-btn-primary small-btn">
                    Decide
                  </button>
                  <span *ngIf="c.status !== 'OPEN'" class="decided-text">
                    Decided by {{ c.decidedBy || 'AICTE Officer' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Master College Registry Table (Preserved from Repo 2 with Real Data) -->
      <div class="table-card gov-card">
        <div class="table-header">
          <div>
            <h3>College-Wise Intake Compliance & Verification Master Table</h3>
            <p class="sub-text">AICTE regulatory oversight of approved intake versus actual student enrolment</p>
          </div>
          <div class="filter-row">
            <input
              type="text"
              [(ngModel)]="searchCollege"
              (input)="filterColleges()"
              placeholder="Search College or Code..."
              class="search-college-input"
            />
          </div>
        </div>

        <div class="table-container">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>College Name & State</th>
                <th>Approved Intake</th>
                <th>Actual Enrolment</th>
                <th>Intake Variance</th>
                <th>Supernumerary (TFW)</th>
                <th>NRI / FN</th>
                <th>Verification %</th>
                <th>Integrity Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredColleges">
                <td class="font-mono text-bold">{{ c.code }}</td>
                <td>
                  <strong>{{ c.name }}</strong>
                  <div class="code-sub">{{ c.city }}, {{ c.state }}</div>
                </td>
                <td class="text-center">{{ c.approvedIntake }}</td>
                <td class="text-center font-bold text-navy">{{ c.actualEnrolment }}</td>
                <td class="text-center">
                  <span *ngIf="c.actualEnrolment > c.approvedIntake" class="variance-badge over">
                    +{{ c.actualEnrolment - c.approvedIntake }} (Over-intake)
                  </span>
                  <span *ngIf="c.actualEnrolment <= c.approvedIntake" class="variance-badge ok">
                    Compliant
                  </span>
                </td>
                <td class="text-center text-purple">{{ c.supernumeraryQuota }} Seats</td>
                <td class="text-center text-amber">{{ c.nriCount }} NRI / {{ c.fnCount }} FN</td>
                <td class="text-center font-bold text-green">
                  {{ (c.verifiedCount / c.actualEnrolment * 100).toFixed(1) }}%
                </td>
                <td class="text-center font-mono font-bold" [ngClass]="(c.integrityScore || 100) >= 90 ? 'text-green' : 'text-amber'">
                  {{ c.integrityScore || 90.0 }}/100
                </td>
                <td class="text-center">
                  <span class="status-pill" [ngClass]="c.actualEnrolment > c.approvedIntake ? 'status-duplicate' : 'status-verified'">
                    {{ c.actualEnrolment > c.approvedIntake ? 'Under Audit' : 'Approved' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Anomaly Stream & Tamper-Evident Audit Ledger (Structured 2-Column Row) -->
      <div class="logs-grid">
        <!-- Kafka Duplicate Anomaly Stream -->
        <div class="log-box gov-card">
          <div class="box-head">
            <h3>🚨 Kafka Duplicate Anomaly Stream</h3>
            <span class="stream-pill">TOPIC: aicte.apaar.duplicate-events</span>
          </div>
          <div class="log-entries">
            <div class="log-item critical">
              <strong>FRD-2026-081 (CRITICAL)</strong>
              <p>Mohammad Farhan Akhtar (100000000005) active at Delhi Inst of Tech and UP Council of Tech simultaneously.</p>
              <small>Action: Notice Issued • Streamed via Spring Kafka</small>
            </div>
            <div class="log-item high">
              <strong>FRD-2026-082 (HIGH)</strong>
              <p>Delhi Inst of Engineering & Tech exceeded approved intake by 40 seats without TFW clearance.</p>
              <small>Action: Audit Scheduled</small>
            </div>
            <div class="log-item critical">
              <strong>FRD-2026-083 (CRITICAL)</strong>
              <p>Ananya Banerjee (100000000012) dual admission logged in Delhi and Karnataka portals.</p>
              <small>Action: Seat Blocked</small>
            </div>
          </div>
        </div>

        <!-- Cryptographic Audit Ledger with Live Chain Verification -->
        <div class="log-box gov-card">
          <div class="box-head">
            <div>
              <h3>📜 Cryptographic Audit Ledger</h3>
              <small class="text-green" *ngIf="chainStatus">{{ chainStatus }}</small>
            </div>
            <button (click)="verifyChain()" class="chain-verify-btn">
              🔍 Recompute & Verify SHA-256 Chain
            </button>
          </div>
          <div class="log-entries">
            <div *ngFor="let log of auditLogs" class="log-item normal">
              <div class="log-meta">
                <span>{{ log.timestamp | slice:0:19 }}</span>
                <strong>{{ log.action }}</strong>
              </div>
              <p>{{ log.details }}</p>
              <div class="hash-row font-mono">
                <span>Hash: {{ log.currentHash | slice:0:18 }}...</span>
                <small>Actor: {{ log.actor }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Decision Modal -->
      <div *ngIf="activeModalCase" class="modal-overlay" (click)="activeModalCase = null">
        <div class="decision-modal gov-card" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h3>Administrative Case Decision: #{{ activeModalCase.id }}</h3>
            <button (click)="activeModalCase = null" class="close-btn">✕</button>
          </div>
          <p class="modal-sub">Subject: <strong>{{ activeModalCase.studentName }}</strong> ({{ activeModalCase.apaarId }})</p>
          <p class="case-desc">{{ activeModalCase.details }}</p>

          <div class="field">
            <label>STATUTORY RATIONALE NOTE (MANDATORY)</label>
            <textarea
              [(ngModel)]="decisionNote"
              rows="3"
              class="note-textarea"
              placeholder="Enter official regulatory justification note..."
            ></textarea>
          </div>

          <div class="decision-actions">
            <button (click)="submitDecision('REJECTED')" class="btn-reject" [disabled]="!decisionNote.trim()">
              Reject Enrolment / Seat
            </button>
            <button (click)="submitDecision('APPROVED')" class="gov-btn-primary" [disabled]="!decisionNote.trim()">
              Approve / Ratify
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .aicte-container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
    .header-card { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .avatar-badge { width: 44px; height: 44px; background: #0F2C61; color: #fff; font-size: 22px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .header-left h1 { font-size: 19px; margin: 0; color: #0F2C61; font-weight: 700; }
    .header-left p { font-size: 11px; margin: 2px 0 0; color: #64748B; }
    .header-actions { display: flex; gap: 10px; }
    .export-toast { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; padding: 10px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }

    .text-blue { color: #2563EB; }
    .text-green { color: #15803D; }
    .text-amber { color: #D97706; }
    .text-red { color: #B91C1C; }
    .text-purple { color: #7C3AED; }
    .text-navy { color: #0F2C61; }

    /* State Chart */
    .state-card { padding: 22px; margin-bottom: 24px; }
    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    .chart-header h3 { font-size: 15px; color: #0F2C61; margin: 0 0 3px; font-weight: 700; }
    .sub-text { font-size: 11px; color: #64748B; margin: 0; }
    .chart-legend { display: flex; gap: 14px; font-size: 11px; font-weight: 600; color: #475569; align-items: center; }
    .legend-item { display: flex; align-items: center; gap: 5px; }
    .legend-badge { width: 10px; height: 10px; border-radius: 2px; }
    .total-badge { background: #0F2C61; }
    .verified-badge { background: #16A34A; }

    .bar-chart-wrapper { display: flex; height: 200px; gap: 10px; margin-top: 10px; position: relative; }
    .y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 10px; color: #94A3B8; text-align: right; width: 35px; padding-bottom: 24px; }
    .chart-plot { flex: 1; position: relative; height: 100%; border-bottom: 1px solid #CBD5E1; }
    .grid-line { position: absolute; left: 0; right: 0; height: 1px; background: #F1F5F9; }
    .baseline { background: #CBD5E1; }
    .columns-container { position: absolute; inset: 0; display: flex; justify-content: space-around; align-items: flex-end; padding-bottom: 24px; }
    .state-column-group { display: flex; flex-direction: column; align-items: center; width: 44px; height: 100%; justify-content: flex-end; }
    .dual-bars { display: flex; gap: 3px; align-items: flex-end; height: 100%; }
    .standing-bar { width: 14px; border-radius: 2px 2px 0 0; }
    .total-bar { background: #0F2C61; }
    .verified-bar { background: #16A34A; }
    .x-axis-info { position: absolute; bottom: 0; display: flex; flex-direction: column; align-items: center; width: 60px; text-align: center; }
    .state-name { font-size: 10px; font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 55px; }
    .state-sync { font-size: 9px; color: #16A34A; font-weight: 700; }

    /* Review Queue */
    .review-queue-card { padding: 20px; margin-bottom: 24px; border-left: 4px solid #D97706; }
    .section-top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .section-top-header h3 { font-size: 15px; color: #0F2C61; margin: 0; font-weight: 700; }
    .queue-status-badge { background: #FEF3C7; color: #92400E; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; border: 1px solid #FDE68A; }
    .severity-pill { font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px; }
    .severity-pill.critical { background: #FEE2E2; color: #991B1B; }
    .severity-pill.high { background: #FEF3C7; color: #92400E; }
    .severity-pill.medium { background: #EFF6FF; color: #1E3A8A; }
    .case-type-sub { font-size: 9px; color: #64748B; margin-top: 2px; }
    .code-sub { font-size: 10px; color: #64748B; font-family: monospace; }
    .details-col { font-size: 11px; color: #334155; max-width: 250px; }
    .date-col { font-size: 11px; color: #64748B; font-family: monospace; }
    .decided-text { font-size: 10px; color: #64748B; }

    /* Master Table */
    .table-card { padding: 20px; margin-bottom: 24px; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
    .table-header h3 { font-size: 15px; color: #0F2C61; margin: 0 0 2px; font-weight: 700; }
    .search-college-input { width: 260px; padding: 7px 10px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 12px; outline: none; }
    .search-college-input:focus { border-color: #0F2C61; }
    .variance-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .variance-badge.over { background: #FEE2E2; color: #991B1B; }
    .variance-badge.ok { background: #DCFCE7; color: #15803D; }

    /* Logs Grid */
    .logs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media(max-width: 800px) { .logs-grid { grid-template-columns: 1fr; } }
    .log-box { padding: 18px 20px; }
    .box-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; }
    .box-head h3 { font-size: 13px; font-weight: 700; color: #0F2C61; margin: 0; }
    .stream-pill { font-size: 9px; font-family: monospace; background: #F1F5F9; padding: 2px 6px; border-radius: 4px; color: #475569; }
    .chain-verify-btn { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E3A8A; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer; }
    .chain-verify-btn:hover { background: #DBEAFE; }
    .log-entries { display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; }
    .log-item { padding: 10px 12px; border-radius: 6px; font-size: 11px; }
    .log-item.critical { background: #FFF5F5; border-left: 3px solid #E53E3E; }
    .log-item.high { background: #FFFBEB; border-left: 3px solid #D97706; }
    .log-item.normal { background: #F8FAFC; border: 1px solid #E2E8F0; }
    .log-meta { display: flex; justify-content: space-between; margin-bottom: 3px; font-weight: 600; color: #475569; }
    .log-item p { margin: 2px 0 4px; color: #1E293B; }
    .hash-row { display: flex; justify-content: space-between; font-size: 9px; color: #94A3B8; }

    /* Decision Modal */
    .decision-modal { max-width: 480px; width: 100%; padding: 22px; }
    .modal-head { display: flex; justify-content: space-between; align-items: center; }
    .modal-head h3 { font-size: 15px; color: #0F2C61; margin: 0; font-weight: 700; }
    .modal-sub { font-size: 12px; color: #475569; margin: 4px 0 10px; }
    .case-desc { font-size: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px; border-radius: 6px; color: #334155; margin-bottom: 12px; }
    .field label { display: block; font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 4px; }
    .note-textarea { width: 100%; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px; font-size: 12px; outline: none; }
    .decision-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
    .btn-reject { background: #B91C1C; color: #fff; border: none; border-radius: 4px; padding: 7px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #64748B; }
  `]
})
export class AicteComponent implements OnInit {
  colleges: College[] = [];
  filteredColleges: College[] = [];
  searchCollege: string = '';
  exportToast: string = '';
  auditLogs: any[] = [];
  reviewCases: ReviewCase[] = [];
  openReviewCount: number = 0;
  chainStatus: string = '';

  stateData: any[] = [];
  maxStateVal: number = 600000;

  activeModalCase: ReviewCase | null = null;
  decisionNote: string = '';

  constructor(private apaarService: ApaarService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apaarService.getAllColleges().subscribe(res => {
      if (res && res.data) {
        this.colleges = res.data;
        this.filterColleges();
      }
      this.cdr.detectChanges();
    });

    this.apaarService.getStateData().subscribe(res => {
      if (res && res.data) {
        this.stateData = res.data;
        this.maxStateVal = res.maxVal || 600000;
      }
      this.cdr.detectChanges();
    });

    this.apaarService.getAuditLogs().subscribe(res => {
      if (res && res.data) {
        this.auditLogs = res.data;
      }
      this.cdr.detectChanges();
    });

    this.apaarService.getReviewCases('ALL').subscribe(res => {
      if (res && res.data) {
        this.reviewCases = res.data;
        this.openReviewCount = res.openCount || 0;
      }
      this.cdr.detectChanges();
    });
  }

  filterColleges() {
    if (!this.searchCollege.trim()) {
      this.filteredColleges = this.colleges;
    } else {
      const q = this.searchCollege.toLowerCase().trim();
      this.filteredColleges = this.colleges.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      );
    }
    this.cdr.detectChanges();
  }

  downloadExcel() {
    this.apaarService.downloadExcelReport().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AICTE_National_Compliance_Report_2026.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      this.exportToast = '✅ Official National Compliance Report exported successfully.';
      setTimeout(() => this.exportToast = '', 4000);
      this.cdr.detectChanges();
    });
  }

  printReport() {
    window.print();
  }

  verifyChain() {
    this.apaarService.verifyAuditChain().subscribe(res => {
      if (res && res.verification) {
        const v = res.verification;
        if (v.valid) {
          this.chainStatus = `✅ SHA-256 Chain Verified: ${v.totalBlocks} Blocks Tamper-Free`;
          alert(`Cryptographic Verification Successful:\n- Total Chain Blocks: ${v.totalBlocks}\n- Head Hash: ${v.headHash}\n- Result: Audit ledger is intact and verified against genesis block.`);
        } else {
          this.chainStatus = `❌ Tampering Detected at Block #${v.brokenIndex}`;
          alert(`Ledger Alert:\n${v.reason}`);
        }
      }
      this.cdr.detectChanges();
    });
  }

  openDecisionModal(c: ReviewCase) {
    this.activeModalCase = c;
    this.decisionNote = '';
  }

  submitDecision(decision: string) {
    if (!this.activeModalCase || !this.decisionNote.trim()) return;

    this.apaarService.decideReviewCase(
      this.activeModalCase.id,
      decision,
      this.decisionNote.trim()
    ).subscribe(res => {
      alert(`Decision Recorded: Case #${this.activeModalCase?.id} is now ${decision}.`);
      this.activeModalCase = null;
      this.loadData();
    });
  }
}
