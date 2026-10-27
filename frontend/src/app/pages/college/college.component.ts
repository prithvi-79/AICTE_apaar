import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApaarService, Student, College, SeatPool } from '../../services/apaar.service';

@Component({
  selector: 'app-college',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="college-container">
      <!-- 1. Institutional Sign In / Register Screen -->
      <div *ngIf="!isAuthenticated" class="login-wrapper">
        <div class="login-card gov-card">
          <div class="login-emblem-wrap">
            <span class="login-emblem">🏛️</span>
          </div>

          <h2>College Admin Portal</h2>
          <p class="sub-text">AICTE Regulation Bureau • Academic Verification Platform</p>

          <!-- Navigation Tabs -->
          <div class="auth-tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab === 'signin'"
              (click)="activeTab = 'signin'; loginError = ''; pendingNotice = ''"
            >
              Institutional Sign In
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab === 'register'"
              (click)="activeTab = 'register'; loginError = ''; pendingNotice = ''"
            >
              Request Access / Register
            </button>
          </div>

          <!-- Tab 1: Institutional Sign In -->
          <div *ngIf="activeTab === 'signin'">
            <button type="button" class="google-auth-btn" (click)="openGoogleModal()">
              <svg class="google-svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div class="auth-divider">
              <span class="divider-line"></span>
              <span class="divider-label">OR INSTITUTIONAL CREDENTIALS</span>
              <span class="divider-line"></span>
            </div>

            <form (ngSubmit)="login()" class="login-form">
              <div class="field">
                <label>INSTITUTIONAL EMAIL</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  class="text-input"
                  placeholder="college@aicte.ac.in"
                />
              </div>

              <div class="field">
                <label>PASSKEY / PASSWORD</label>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  class="text-input"
                  placeholder="••••••"
                />
              </div>

              <div *ngIf="pendingNotice" class="pending-banner">
                <div class="pending-title">⏳ Application Under Regulatory Review</div>
                <p>Institutional registration is currently under scrutiny by AICTE Regional Bureau.</p>
              </div>

              <div *ngIf="loginError" class="login-err">
                ⚠️ {{ loginError }}
              </div>

              <!-- Test Accounts Presets Box -->
              <div class="test-accounts-card">
                <div class="test-header">Quick Test Accounts:</div>
                <div class="test-item" (click)="fillCreds('college@aicte.ac.in', '123456')">
                  • Approved: <strong>college&#64;aicte.ac.in</strong> / <strong>123456</strong>
                </div>
                <div class="test-item" (click)="fillCreds('pending.college@aicte.ac.in', '123456')">
                  • Pending Approval: <strong>pending.college&#64;aicte.ac.in</strong> / <strong>123456</strong>
                </div>
              </div>

              <button type="submit" class="sign-in-btn">Sign In to Dashboard</button>
            </form>
          </div>

          <!-- Tab 2: Register Form -->
          <div *ngIf="activeTab === 'register'" class="register-tab-content">
            <p class="tab-desc">Register your institution to provision an AICTE APAAR node and intake management portal.</p>
            <form (ngSubmit)="submitRegistration()" class="register-form">
              <div class="field">
                <label>AICTE PERMANENT INSTITUTE ID (PID)</label>
                <input type="text" [(ngModel)]="regData.pid" name="pid" class="text-input" placeholder="e.g. 1-33291823" required />
              </div>
              <div class="field">
                <label>INSTITUTION FULL NAME</label>
                <input type="text" [(ngModel)]="regData.name" name="name" class="text-input" placeholder="e.g. Pune Institute of Engineering" required />
              </div>
              <div class="field">
                <label>OFFICIAL EMAIL</label>
                <input type="email" [(ngModel)]="regData.email" name="regEmail" class="text-input" placeholder="principal@college.edu.in" required />
              </div>
              <div class="field">
                <label>PASSWORD</label>
                <input type="password" [(ngModel)]="regData.password" name="regPassword" class="text-input" placeholder="Create a passkey" required />
              </div>
              <div class="field">
                <label>STATE & CITY</label>
                <input type="text" [(ngModel)]="regData.state" name="state" class="text-input" placeholder="e.g. Maharashtra, Pune" required />
              </div>
              <div class="field">
                <label>SANCTIONED INTAKE CAPACITY</label>
                <input type="number" [(ngModel)]="regData.approvedIntake" name="approvedIntake" class="text-input" placeholder="e.g. 600" required />
              </div>
              <button type="submit" class="sign-in-btn">Submit Institutional Registration</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Google OAuth Modal -->
      <div *ngIf="showGoogleModal" class="modal-overlay" (click)="closeGoogleModal($event)">
        <div class="google-modal-card" (click)="$event.stopPropagation()">
          <div class="google-modal-header">
            <div class="google-modal-title">Sign in with Google</div>
            <p class="google-modal-sub">Choose an account to continue to <strong>AICTE College Admin Portal</strong></p>
          </div>
          <div class="google-accounts-list">
            <div class="google-account-item" (click)="signInWithGoogleAccount('admin.diet@delhi-tech.ac.in', 'Dr. S. K. Murthy')">
              <div class="google-avatar" style="background: #2563EB;">SM</div>
              <div class="google-acc-details">
                <span class="acc-name">Dr. S. K. Murthy</span>
                <span class="acc-email">admin.diet&#64;delhi-tech.ac.in</span>
                <span class="acc-role">Nodal College Administrator • DIET</span>
              </div>
            </div>
            <div class="google-account-item" (click)="signInWithGoogleAccount('principal.diet@gmail.com', 'Prof. Rajesh K. Varma')">
              <div class="google-avatar" style="background: #059669;">RV</div>
              <div class="google-acc-details">
                <span class="acc-name">Prof. Rajesh K. Varma</span>
                <span class="acc-email">principal.diet&#64;gmail.com</span>
                <span class="acc-role">Head of Institution / Principal</span>
              </div>
            </div>
          </div>
          <div class="google-modal-footer">
            <button type="button" class="google-cancel-btn" (click)="showGoogleModal = false">Cancel</button>
            <button type="button" class="google-fast-btn" (click)="signInWithGoogleAccount('admin.diet@delhi-tech.ac.in', 'Dr. S. K. Murthy')">
              Quick Sign In ➔
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Authenticated Dashboard View -->
      <div *ngIf="isAuthenticated" class="dashboard-wrapper">
        <!-- Top Institutional Bar -->
        <div class="top-bar gov-card">
          <div class="bar-left">
            <div class="inst-icon">🏛️</div>
            <div>
              <div class="inst-heading-row">
                <h2>{{ college?.name || 'Delhi Institute of Engineering & Technology' }}</h2>
                <span *ngIf="isGoogleUser" class="google-auth-tag">Google: {{ loggedInUser }}</span>
              </div>
              <span class="code-badge font-mono">{{ college?.code || 'AICTE-DL-0012' }}</span>
              <span class="tag">AY 2026-27 Intake Management</span>
            </div>
          </div>
          <div class="bar-actions">
            <button (click)="openBulkModal()" class="gov-btn-saffron">📤 Bulk Enrolment Upload</button>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>

        <!-- Metric Ribbon (Card Reduction: 1 cohesive aligned strip instead of 4 floating cards) -->
        <div class="metric-ribbon">
          <div class="metric-cell clickable" (click)="statusFilter = 'all'; filterStudents()">
            <span class="cell-label">Total Enrolled</span>
            <div class="cell-value">{{ college?.actualEnrolment || 1240 }}</div>
            <span class="cell-sub">Sanctioned: <strong>{{ college?.approvedIntake || 1200 }}</strong></span>
          </div>
          <div class="metric-cell clickable" (click)="statusFilter = 'verified'; filterStudents()">
            <span class="cell-label text-green">Verified Records</span>
            <div class="cell-value text-green">{{ college?.verifiedCount || 980 }}</div>
            <span class="cell-sub text-green">
              {{ ((college?.verifiedCount || 980) / (college?.actualEnrolment || 1240) * 100).toFixed(1) }}% Synced
            </span>
          </div>
          <div class="metric-cell clickable" (click)="statusFilter = 'pending'; filterStudents()">
            <span class="cell-label text-amber">Pending Review</span>
            <div class="cell-value text-amber">{{ college?.pendingCount || 200 }}</div>
            <span class="cell-sub text-amber">DigiLocker queued</span>
          </div>
          <div class="metric-cell clickable" (click)="statusFilter = 'duplicate'; filterStudents()">
            <span class="cell-label text-red">Duplicate Flags</span>
            <div class="cell-value text-red">{{ college?.duplicateCount || 60 }}</div>
            <span class="cell-sub text-red">Cross-institution conflicts ↗</span>
          </div>
        </div>

        <!-- AICTE Intake Anomaly Banner (Shown if Over Intake) -->
        <div class="intake-warning" *ngIf="(college?.actualEnrolment || 0) > (college?.approvedIntake || 0)">
          ⚠️ <strong>AICTE Regulatory Anomaly: Admissions Exceed Approved Intake</strong>
          <p>
            Current enrolment ({{ college?.actualEnrolment }}) exceeds sanctioned intake ({{ college?.approvedIntake }}) by
            <strong>+{{ (college?.actualEnrolment || 0) - (college?.approvedIntake || 0) }} seats</strong>.
            Review case automatically opened for AICTE Regulation Bureau scrutiny.
          </p>
        </div>

        <!-- Cross-Institution Duplicate Alert Section (Restrained, Structured) -->
        <div class="duplicate-alert-section gov-card" *ngIf="duplicates.length > 0">
          <div class="dup-header">
            <h3>🚨 Cross-Institution Enrolment Conflicts (Action Required)</h3>
            <span class="conflict-badge">{{ duplicates.length }} Conflicts Flagged</span>
          </div>

          <div class="dup-list">
            <div *ngFor="let dup of duplicates" class="dup-row-item">
              <div class="dup-col-student">
                <strong>{{ dup.name }}</strong>
                <span class="font-mono text-amber">{{ dup.apaarId }}</span>
                <span class="dup-course-text">{{ dup.course }} (Yr {{ dup.academicYear }})</span>
              </div>
              <div class="dup-col-reason">
                <span class="conflict-tag">CONFLICT</span>
                <p>{{ dup.flagReason }}</p>
                <small>Conflicting Institution: <strong>{{ dup.duplicateCollegeName }} ({{ dup.duplicateCollegeId }})</strong></small>
              </div>
              <div class="dup-col-actions">
                <button (click)="verify(dup.apaarId)" class="gov-btn-primary small-btn">Override & Verify</button>
                <button (click)="reject(dup.apaarId)" class="btn-reject small-btn">Reject Seat</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Seat Ledger Quota Allocation (Repo 1 Feature Integration) -->
        <div class="seat-ledger-section gov-card" *ngIf="seatPools.length > 0">
          <div class="ledger-header">
            <div>
              <h3>Institutional Seat Ledger by Quota Pool</h3>
              <p>Tracking Sanctioned vs Allocated seats across Regular, TFW Supernumerary, NRI, and FN/OCI categories</p>
            </div>
            <span class="quota-norm-tag">AICTE APH Quota Compliance</span>
          </div>

          <div class="table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th>Academic Programme</th>
                  <th>Seat Pool Category</th>
                  <th>Sanctioned Quota</th>
                  <th>Allocated Seats</th>
                  <th>Quota Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let pool of seatPools">
                  <td><strong>{{ pool.course }}</strong></td>
                  <td>
                    <span class="pool-pill" [ngClass]="pool.quotaType">
                      {{ pool.quotaType === 'regular' ? 'Regular Sanctioned' : pool.quotaType === 'tfw' ? 'TFW Supernumerary (5%)' : pool.quotaType === 'nri' ? 'NRI Quota' : 'FN / OCI / PIO' }}
                    </span>
                  </td>
                  <td>{{ pool.approvedSeats }} Seats</td>
                  <td><strong>{{ pool.allocatedSeats }} Seats</strong></td>
                  <td>
                    <div class="util-bar-wrap">
                      <div class="util-bar" [style.width.%]="(pool.allocatedSeats / pool.approvedSeats * 100)" [ngClass]="{'util-over': pool.allocatedSeats > pool.approvedSeats}"></div>
                      <span>{{ (pool.allocatedSeats / pool.approvedSeats * 100).toFixed(0) }}%</span>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="pool.allocatedSeats > pool.approvedSeats ? 'status-duplicate' : 'status-verified'">
                      {{ pool.allocatedSeats > pool.approvedSeats ? 'OVERRUN +' + (pool.allocatedSeats - pool.approvedSeats) : 'COMPLIANT' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Institutional Student Registry Table -->
        <div class="registry-card gov-card">
          <div class="registry-top-header">
            <div>
              <h3 class="registry-title">Institutional Student Registry</h3>
              <p class="registry-sub">Real-time database records with 12-digit APAAR academic identifiers</p>
            </div>
            <div class="search-wrap">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="filterStudents()"
                placeholder="Search by student name, APAAR ID, or roll no..."
                class="search-bar-input"
              />
            </div>
          </div>

          <div class="filter-controls-row">
            <select [(ngModel)]="courseFilter" (change)="filterStudents()" class="filter-dropdown">
              <option value="all">All Academic Courses</option>
              <option value="Computer Science">B.Tech Computer Science & Engineering</option>
              <option value="Mechanical">B.Tech Mechanical Engineering</option>
              <option value="Civil">B.Tech Civil Engineering</option>
              <option value="Information Technology">B.Tech Information Technology</option>
              <option value="Electronics">B.Tech Electronics & Communication</option>
            </select>

            <select [(ngModel)]="statusFilter" (change)="filterStudents()" class="filter-dropdown">
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified</option>
              <option value="duplicate">Duplicate</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="table-container">
            <table class="registry-table">
              <thead>
                <tr>
                  <th>12-DIGIT APAAR ID</th>
                  <th>STUDENT NAME</th>
                  <th>COURSE & BRANCH</th>
                  <th>CATEGORY</th>
                  <th>ABC CREDITS</th>
                  <th>ADMISSION DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredStudents">
                  <td class="font-mono text-navy font-bold">{{ s.apaarId }}</td>
                  <td>
                    <strong>{{ s.name }}</strong>
                    <span *ngIf="s.isProvisional" class="prov-tag">PROVISIONAL</span>
                  </td>
                  <td>{{ s.course }} (Yr {{ s.academicYear }})</td>
                  <td><span class="cat-pill">{{ s.category }}</span></td>
                  <td><strong>{{ s.abcCredits }} Cr</strong></td>
                  <td>{{ s.admissionDate }}</td>
                  <td>
                    <span class="status-pill" [ngClass]="'status-' + s.status">
                      {{ s.status | uppercase }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btn-row">
                      <button *ngIf="s.status !== 'verified'" (click)="verify(s.apaarId)" class="btn-verify-table" title="Approve & Verify">Verify</button>
                      <button *ngIf="s.status !== 'rejected'" (click)="reject(s.apaarId)" class="btn-reject-table" title="Reject / Revoke Enrolment">Reject</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredStudents.length === 0">
                  <td colspan="8" class="no-records">
                    No student records match the specified query and filters.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bulk Upload Modal (Repo 5 Ingestion Feature Integration) -->
        <div *ngIf="showUpload" class="modal-overlay" (click)="showUpload = false">
          <div class="modal-card gov-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Bulk Enrolment CSV Ingestion Engine</h3>
              <button (click)="showUpload = false" class="close-btn">✕</button>
            </div>
            <p class="modal-sub">Multi-level validation: 12-digit format, deduplication, and sanctioned intake checks</p>

            <div class="modal-body">
              <div class="template-box">
                <span>Need standard template?</span>
                <button type="button" (click)="loadSampleCsv()" class="template-link">Load Sample CSV Data</button>
              </div>

              <textarea
                [(ngModel)]="uploadCsvText"
                rows="6"
                class="csv-textarea"
                placeholder="Paste CSV records with headers: apaarId,name,dob,gender,mobile,course,academicYear..."
              ></textarea>

              <div *ngIf="uploadNotice" class="upload-notice" [ngClass]="uploadSuccess ? 'notice-success' : 'notice-err'">
                {{ uploadNotice }}
              </div>
            </div>

            <div class="modal-footer">
              <button (click)="showUpload = false" class="gov-btn-outline">Cancel</button>
              <button (click)="processBulkUpload()" class="gov-btn-saffron" [disabled]="uploading">
                {{ uploading ? 'Validating Batch...' : 'Run Batch Validation & Commit' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .college-container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
    
    /* Login */
    .login-wrapper { display: flex; justify-content: center; padding: 30px 0; }
    .login-card { max-width: 440px; width: 100%; padding: 32px; text-align: center; }
    .login-emblem { font-size: 38px; display: inline-block; }
    .login-card h2 { font-size: 22px; color: #0F2C61; margin: 6px 0 0; font-weight: 800; }
    .sub-text { font-size: 12px; color: #64748B; margin: 4px 0 20px; }
    .auth-tabs { display: flex; border-bottom: 1px solid #E2E8F0; margin-bottom: 20px; }
    .tab-btn { flex: 1; padding: 10px; background: transparent; border: none; border-bottom: 2px solid transparent; font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer; }
    .tab-btn.active { color: #0F2C61; border-bottom-color: #D97706; font-weight: 700; }
    .google-auth-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 10px; background: #fff; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .auth-divider { display: flex; align-items: center; margin: 18px 0; }
    .divider-line { flex: 1; height: 1px; background: #E2E8F0; }
    .divider-label { padding: 0 10px; font-size: 10px; font-weight: 700; color: #94A3B8; }
    .field { text-align: left; margin-bottom: 12px; }
    .field label { display: block; font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 4px; text-transform: uppercase; }
    .text-input { width: 100%; padding: 9px 12px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px; outline: none; }
    .text-input:focus { border-color: #0F2C61; }
    .sign-in-btn { width: 100%; background: #0F2C61; color: #fff; border: none; border-radius: 6px; padding: 11px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .test-accounts-card { background: #FEFCE8; border: 1px solid #FEF08A; border-radius: 6px; padding: 10px 12px; text-align: left; font-size: 11px; color: #854D0E; margin: 14px 0; }
    .test-header { font-weight: 700; margin-bottom: 3px; }
    .test-item { margin-top: 2px; cursor: pointer; }
    .test-item:hover { text-decoration: underline; }
    .login-err { background: #FEE2E2; color: #991B1B; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; text-align: left; }
    .pending-banner { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; text-align: left; }
    .register-tab-content { text-align: left; }
    .tab-desc { font-size: 12px; color: #64748B; margin-bottom: 12px; }

    /* Google Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 44, 97, 0.45); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .google-modal-card { background: #fff; border-radius: 8px; max-width: 400px; width: 100%; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
    .google-modal-header { text-align: center; margin-bottom: 16px; }
    .google-modal-title { font-size: 17px; font-weight: 700; color: #1E293B; }
    .google-modal-sub { font-size: 11px; color: #64748B; margin: 4px 0 0; }
    .google-accounts-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .google-account-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid #E2E8F0; border-radius: 6px; cursor: pointer; }
    .google-account-item:hover { background: #F8FAFC; border-color: #CBD5E1; }
    .google-avatar { width: 32px; height: 32px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
    .google-acc-details { display: flex; flex-direction: column; text-align: left; }
    .acc-name { font-size: 12px; font-weight: 700; color: #1E293B; }
    .acc-email { font-size: 11px; color: #64748B; font-family: monospace; }
    .acc-role { font-size: 10px; color: #2563EB; }
    .google-modal-footer { display: flex; justify-content: flex-end; gap: 8px; }
    .google-cancel-btn { background: #F1F5F9; color: #475569; border: none; border-radius: 4px; padding: 7px 12px; font-size: 11px; cursor: pointer; }
    .google-fast-btn { background: #0F2C61; color: #fff; border: none; border-radius: 4px; padding: 7px 14px; font-size: 11px; font-weight: 700; cursor: pointer; }

    /* Dashboard Header */
    .top-bar { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; margin-bottom: 20px; }
    .bar-left { display: flex; align-items: center; gap: 14px; }
    .inst-icon { font-size: 32px; }
    .inst-heading-row { display: flex; align-items: center; gap: 10px; }
    .top-bar h2 { font-size: 18px; color: #0F2C61; margin: 0; font-weight: 800; }
    .google-auth-tag { font-size: 11px; background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E3A8A; padding: 2px 8px; border-radius: 20px; }
    .code-badge { font-size: 11px; background: #F1F5F9; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-weight: 700; }
    .tag { font-size: 11px; color: #64748B; }
    .bar-actions { display: flex; gap: 10px; align-items: center; }
    .logout-btn { background: transparent; border: 1px solid #CBD5E1; padding: 7px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; color: #475569; }
    .logout-btn:hover { background: #F1F5F9; }

    /* Warning Banner */
    .intake-warning { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; padding: 14px 18px; border-radius: 8px; font-size: 12px; margin-bottom: 20px; }
    .intake-warning p { margin: 4px 0 0; }

    /* Duplicates Section */
    .duplicate-alert-section { padding: 18px 20px; margin-bottom: 20px; border-left: 4px solid #B91C1C; }
    .dup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .dup-header h3 { font-size: 14px; font-weight: 700; color: #991B1B; margin: 0; }
    .conflict-badge { background: #FEE2E2; color: #991B1B; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .dup-list { display: flex; flex-direction: column; gap: 8px; }
    .dup-row-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 6px; font-size: 12px; gap: 12px; }
    .dup-col-student { width: 220px; }
    .dup-col-student strong { display: block; font-size: 13px; }
    .dup-course-text { display: block; font-size: 10px; color: #64748B; }
    .dup-col-reason { flex: 1; }
    .conflict-tag { background: #E53E3E; color: #fff; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px; }
    .dup-col-reason p { margin: 2px 0 0; font-size: 11px; color: #742A2A; }
    .dup-col-actions { display: flex; gap: 6px; }
    .btn-reject { background: #B91C1C; color: #fff; border: none; border-radius: 4px; padding: 6px 12px; font-weight: 700; font-size: 11px; cursor: pointer; }
    .small-btn { padding: 6px 12px; font-size: 11px; }

    /* Seat Ledger Section */
    .seat-ledger-section { padding: 18px 20px; margin-bottom: 20px; }
    .ledger-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .ledger-header h3 { font-size: 14px; font-weight: 700; color: #0F2C61; margin: 0; }
    .ledger-header p { font-size: 11px; color: #64748B; margin: 2px 0 0; }
    .quota-norm-tag { font-size: 10px; background: #EFF6FF; color: #1E3A8A; padding: 3px 8px; border-radius: 4px; font-weight: 700; border: 1px solid #BFDBFE; }
    .pool-pill { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
    .pool-pill.regular { background: #EFF6FF; color: #1E3A8A; }
    .pool-pill.tfw { background: #FAF5FF; color: #6B21A8; }
    .pool-pill.nri { background: #FFFBEB; color: #92400E; }
    .pool-pill.fn_oci_pio { background: #F0FDF4; color: #166534; }
    .util-bar-wrap { display: flex; align-items: center; gap: 8px; width: 120px; }
    .util-bar { height: 8px; background: #0F2C61; border-radius: 4px; max-width: 100%; }
    .util-over { background: #B91C1C !important; }

    /* Registry Card */
    .registry-card { padding: 20px; margin-bottom: 24px; }
    .registry-top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
    .registry-title { font-size: 16px; font-weight: 700; color: #0F2C61; margin: 0; }
    .registry-sub { font-size: 11px; color: #64748B; margin: 2px 0 0; }
    .search-bar-input { width: 300px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 12px; outline: none; }
    .search-bar-input:focus { border-color: #0F2C61; }
    .filter-controls-row { display: flex; gap: 10px; margin-bottom: 14px; }
    .filter-dropdown { padding: 7px 10px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 12px; background: #fff; color: #334155; }
    .cat-pill { background: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #475569; }
    .prov-tag { background: #FEF3C7; color: #92400E; font-size: 9px; padding: 1px 4px; border-radius: 3px; margin-left: 4px; font-weight: 700; }
    .action-btn-row { display: flex; gap: 4px; }
    .btn-verify-table { background: #15803D; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .btn-reject-table { background: #B91C1C; color: #fff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .no-records { text-align: center; color: #94A3B8; padding: 24px; font-size: 12px; }

    /* Bulk Upload Modal */
    .modal-card { max-width: 580px; width: 100%; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .modal-header h3 { font-size: 16px; margin: 0; color: #0F2C61; font-weight: 700; }
    .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #64748B; }
    .modal-sub { font-size: 11px; color: #64748B; margin: 0 0 16px; }
    .template-box { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; }
    .template-link { background: none; border: none; color: #2563EB; cursor: pointer; font-weight: 700; padding: 0; text-decoration: underline; }
    .csv-textarea { width: 100%; border: 1px solid #CBD5E1; border-radius: 6px; font-family: monospace; font-size: 11px; padding: 10px; outline: none; }
    .upload-notice { padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-top: 10px; }
    .notice-success { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
    .notice-err { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class CollegeComponent implements OnInit {
  isAuthenticated: boolean = true;
  activeTab: string = 'signin';
  email: string = 'college@aicte.ac.in';
  password: string = '123456';
  loginError: string = '';
  pendingNotice: string = '';
  isGoogleUser: boolean = false;
  loggedInUser: string = 'College Admin (DIET)';
  showGoogleModal: boolean = false;

  regData = { pid: '', name: '', email: '', password: '', state: '', approvedIntake: 600 };

  college: College | null = null;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  duplicates: Student[] = [];
  seatPools: SeatPool[] = [];

  searchQuery: string = '';
  courseFilter: string = 'all';
  statusFilter: string = 'all';

  showUpload: boolean = false;
  uploadCsvText: string = '';
  uploadNotice: string = '';
  uploadSuccess: boolean = false;
  uploading: boolean = false;

  constructor(private apaarService: ApaarService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apaarService.getCollegeStats('COL001').subscribe(res => {
      if (res && res.college) {
        this.college = res.college;
      }
      this.cdr.detectChanges();
    });

    this.apaarService.getStudents({ collegeId: 'COL001' }).subscribe(res => {
      if (res && res.data) {
        this.students = res.data;
        this.filterStudents();
        this.duplicates = this.students.filter(s => s.status === 'duplicate');
      }
      this.cdr.detectChanges();
    });

    this.apaarService.getSeatLedger('COL001').subscribe(res => {
      if (res && res.pools) {
        this.seatPools = res.pools;
      }
      this.cdr.detectChanges();
    });
  }

  filterStudents() {
    let list = this.students;
    if (this.courseFilter !== 'all') {
      list = list.filter(s => s.course.toLowerCase().includes(this.courseFilter.toLowerCase()));
    }
    if (this.statusFilter !== 'all') {
      list = list.filter(s => s.status.toLowerCase() === this.statusFilter.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.apaarId.toLowerCase().includes(q) ||
        (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(q))
      );
    }
    this.filteredStudents = list;
    this.cdr.detectChanges();
  }

  verify(apaarId: string) {
    this.apaarService.updateStatus(apaarId, 'verified', this.email, 'COLLEGE_ADMIN', 'College approved student record').subscribe(res => {
      this.loadData();
    });
  }

  reject(apaarId: string) {
    this.apaarService.updateStatus(apaarId, 'rejected', this.email, 'COLLEGE_ADMIN', 'College rejected / revoked student seat').subscribe(res => {
      this.loadData();
    });
  }

  login() {
    if (this.email === 'pending.college@aicte.ac.in') {
      this.pendingNotice = 'Application is currently under review by AICTE Regional Bureau.';
      this.loginError = '';
      return;
    }
    if (this.email && this.password === '123456') {
      this.isAuthenticated = true;
      this.loggedInUser = this.email;
      this.loginError = '';
      this.loadData();
    } else {
      this.loginError = 'Invalid credentials. Use college@aicte.ac.in / 123456.';
    }
  }

  fillCreds(e: string, p: string) {
    this.email = e;
    this.password = p;
  }

  submitRegistration() {
    this.apaarService.registerInstitution(this.regData).subscribe(res => {
      alert(`Application Submitted! PID #${this.regData.pid} recorded.`);
      this.activeTab = 'signin';
      this.email = this.regData.email;
    });
  }

  openGoogleModal() {
    this.showGoogleModal = true;
  }

  closeGoogleModal(e: Event) {
    this.showGoogleModal = false;
  }

  signInWithGoogleAccount(email: string, name: string) {
    this.isGoogleUser = true;
    this.loggedInUser = name;
    this.email = email;
    this.isAuthenticated = true;
    this.showGoogleModal = false;
    this.loadData();
  }

  logout() {
    this.isAuthenticated = false;
    this.isGoogleUser = false;
  }

  openBulkModal() {
    this.showUpload = true;
    this.uploadNotice = '';
    this.uploadCsvText = '';
  }

  loadSampleCsv() {
    this.uploadCsvText =
`apaarId,name,dob,gender,mobile,course,academicYear,abcCredits,tenthPercent,twelfthPercent,category
100000000031,Deepak Rawat,2005-04-12,Male,9871122334,B.Tech Computer Science & Engineering,2026,38,91.2,88.5,General
100000000032,Sunita Yadav,2005-06-25,Female,9872233445,B.Tech Information Technology,2026,40,94.0,92.0,OBC
PROV-COL001-009,Vikram Singh,2004-11-14,Male,9873344556,B.Tech Mechanical Engineering,2026,20,84.5,82.0,General`;
  }

  processBulkUpload() {
    if (!this.uploadCsvText.trim()) {
      this.uploadNotice = 'Please enter CSV records or click "Load Sample CSV Data".';
      this.uploadSuccess = false;
      return;
    }

    const lines = this.uploadCsvText.trim().split('\n');
    if (lines.length <= 1) {
      this.uploadNotice = 'At least 1 student row required in CSV.';
      this.uploadSuccess = false;
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const studentsPayload: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length >= 2) {
        studentsPayload.push({
          collegeId: 'COL001',
          apaarId: parts[0] || `1000000000${i+50}`,
          name: parts[1] || `Student ${i}`,
          dob: parts[2] || '2005-01-01',
          gender: parts[3] || 'Male',
          mobile: parts[4] || '9876543210',
          course: parts[5] || 'B.Tech Computer Science & Engineering',
          academicYear: parseInt(parts[6]) || 2026,
          abcCredits: parseInt(parts[7]) || 30,
          tenthPercent: parseFloat(parts[8]) || 85.0,
          twelfthPercent: parseFloat(parts[9]) || 85.0,
          category: parts[10] || 'General'
        });
      }
    }

    this.uploading = true;
    this.apaarService.bulkUpload(studentsPayload).subscribe({
      next: (res) => {
        this.uploading = false;
        this.uploadSuccess = true;
        this.uploadNotice = res.message || 'Batch validated and committed successfully!';
        this.loadData();
        setTimeout(() => {
          this.showUpload = false;
        }, 2000);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadSuccess = false;
        this.uploadNotice = err?.error?.detail || 'Failed to process bulk upload batch.';
      }
    });
  }
}
