import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApaarService, Student } from '../../services/apaar.service';
import { timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="student-container">
      <!-- Portal Header Banner -->
      <div class="header-card gov-card no-print">
        <div class="header-left">
          <div class="avatar-badge">🎓</div>
          <div>
            <h1>Student APAAR ID Verification Portal</h1>
            <p>National Academic Depository (NAD) • Ministry of Education, Govt. of India</p>
          </div>
        </div>
        <div class="security-pill">🔒 AES-256 Encrypted Session</div>
      </div>

      <!-- Verification Lookup Panel -->
      <div class="form-card gov-card no-print">
        <form (ngSubmit)="verify()" class="lookup-form">
          <label>Enter 12-Digit APAAR ID / Academic Identifier</label>
          <div class="input-row">
            <input
              type="text"
              [(ngModel)]="apaarInput"
              name="apaarInput"
              placeholder="e.g. 123456789012 or APAAR12345678"
              class="apaar-input"
            />
            <button type="submit" class="gov-btn-primary" [disabled]="loading">
              {{ loading ? 'Querying DigiLocker...' : 'Fetch Student Profile' }}
            </button>
          </div>

          <div class="preset-chips">
            <span class="chips-label">Demo Chips:</span>
            <button type="button" (click)="setPreset('123456789012')">Verified: <strong>123456789012</strong></button>
            <button type="button" (click)="setPreset('100000000013')">Pending: <strong>100000000013</strong></button>
            <button type="button" (click)="setPreset('100000000005')">Duplicate: <strong>100000000005</strong></button>
            <button type="button" (click)="setPreset('100000000012')">Duplicate #2: <strong>100000000012</strong></button>
            <button type="button" (click)="setPreset('APAAR12345678')">Legacy: <strong>APAAR12345678</strong></button>
          </div>

          <div class="consent-row">
            <input type="checkbox" id="consent" [(ngModel)]="consentGiven" name="consent" />
            <label for="consent">
              <strong>DPDP Statutory Consent:</strong> I hereby give my consent to share my APAAR data and Academic Bank of Credits (ABC) credentials with my admitted AICTE-approved institution.
            </label>
          </div>
        </form>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="error-banner">
        ⚠️ {{ error }}
      </div>

      <!-- Student Record Display -->
      <div *ngIf="student" class="profile-section">
        <!-- Verification Timeline (Clean horizontal process bar) -->
        <div class="timeline-bar gov-card no-print">
          <div class="timeline-title">Verification Lifecycle Process</div>
          <div class="timeline-steps">
            <div class="timeline-step verified">
              <span class="step-icon">✓</span>
              <div class="step-desc">
                <strong>1. Aadhaar e-KYC</strong>
                <span>Linked ···{{ student.aadhaarLast4 }}</span>
              </div>
            </div>
            <div class="timeline-step verified">
              <span class="step-icon">✓</span>
              <div class="step-desc">
                <strong>2. ABC Depository</strong>
                <span>{{ student.abcCredits }} Credits Banked</span>
              </div>
            </div>
            <div class="timeline-step" [ngClass]="student.status">
              <span class="step-icon">{{ student.status === 'verified' ? '✓' : student.status === 'duplicate' ? '✕' : '⏳' }}</span>
              <div class="step-desc">
                <strong>3. College Intake Audit</strong>
                <span>{{ student.status === 'verified' ? 'Seat Approved' : student.status === 'duplicate' ? 'Duplicate Conflict' : 'Pending Review' }}</span>
              </div>
            </div>
            <div class="timeline-step" [ngClass]="student.status === 'verified' ? 'verified' : 'pending'">
              <span class="step-icon">🏛️</span>
              <div class="step-desc">
                <strong>4. AICTE Central Ledger</strong>
                <span>{{ student.status === 'verified' ? 'Permanent Record Stored' : 'Awaiting Final Sync' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Official Verifiable Credential Pass -->
        <div class="pass-card gov-card print-card">
          <div class="pass-header">
            <div>
              <span class="sub-label">Official Verifiable Academic Credential Pass</span>
              <h2>All India Council for Technical Education</h2>
              <p>National Academic Depository (NAD) • DigiLocker & NAD Verified</p>
            </div>
            <div class="badge-status" [ngClass]="student.status">
              {{ student.status.toUpperCase() }}
            </div>
          </div>

          <div class="pass-body">
            <div class="details-col">
              <div class="name-row">
                <div>
                  <span class="label">STUDENT FULL NAME</span>
                  <div class="name-val">{{ student.name }}</div>
                </div>
                <div>
                  <span class="label">APAAR ID NUMBER</span>
                  <div class="id-val font-mono">{{ student.apaarId }}</div>
                </div>
              </div>

              <div class="grid-details">
                <div class="detail-cell">
                  <span>Enrolment / Roll No</span>
                  <strong>{{ student.enrollmentNo || '2024-ADM-092' }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Date of Birth</span>
                  <strong>{{ student.dob }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Gender</span>
                  <strong>{{ student.gender }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Admitted Course</span>
                  <strong>{{ student.course }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Current Year</span>
                  <strong>Year {{ student.academicYear }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Admission Category</span>
                  <strong class="cat-text">{{ student.category }}</strong>
                </div>
                <div class="detail-cell">
                  <span>ABC Credits</span>
                  <strong class="credits-text">{{ student.abcCredits }} Credits</strong>
                </div>
                <div class="detail-cell">
                  <span>Class 10th Score</span>
                  <strong>{{ student.tenthPercent }}%</strong>
                </div>
                <div class="detail-cell">
                  <span>Class 12th Score</span>
                  <strong>{{ student.twelfthPercent }}%</strong>
                </div>
              </div>

              <div class="college-cell">
                <span>Admitted Institution</span>
                <strong>{{ student.collegeName }}</strong>
                <p>AICTE Code: {{ student.collegeId }} • State: {{ student.state }}</p>
              </div>

              <div *ngIf="student.duplicateCollegeName" class="conflict-cell">
                ⚠️ <strong>Duplicate Enrolment Anomaly Flagged:</strong> {{ student.flagReason }}
                <p>Conflicting Institution: <strong>{{ student.duplicateCollegeName }} ({{ student.duplicateCollegeId }})</strong></p>
              </div>
            </div>

            <!-- Cryptographic QR Seal Column -->
            <div class="qr-col">
              <span class="qr-title">Cryptographic QR Seal</span>
              <div class="qr-box">
                <div class="qr-sim">QR: {{ student.apaarId }}</div>
              </div>
              <p class="hash-text font-mono">SHA-256: 4f98...e1b2</p>

              <div class="action-buttons no-print">
                <button (click)="print()" class="gov-btn-primary full-btn">🖨️ Print Pass</button>
              </div>
            </div>
          </div>

          <!-- SIH Compliance Clause 10 -->
          <div class="pass-footer">
            <span>
              AICTE Compliance Clause 10: <strong>APAAR ID [{{ student.apaarId }}] & Student ID [{{ student.enrollmentNo }}]</strong> dual imprint enabled for certificates.
            </span>
            <span>Ministry of Education, Govt of India</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-container { max-width: 1000px; margin: 30px auto; padding: 0 20px; }
    .header-card { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .avatar-badge { width: 44px; height: 44px; background: #0F2C61; color: #fff; font-size: 20px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .header-left h1 { font-size: 19px; margin: 0; color: #0F2C61; font-weight: 700; }
    .header-left p { font-size: 12px; margin: 2px 0 0; color: #64748B; }
    .security-pill { font-size: 11px; background: #EFF6FF; color: #1E3A8A; border: 1px solid #BFDBFE; padding: 5px 12px; border-radius: 20px; font-weight: 600; }

    .form-card { padding: 22px 24px; margin-bottom: 20px; }
    .lookup-form label { display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
    .input-row { display: flex; gap: 10px; }
    .apaar-input { flex: 1; padding: 10px 14px; border: 1px solid #CBD5E1; border-radius: 6px; font-family: monospace; font-size: 14px; outline: none; }
    .apaar-input:focus { border-color: #0F2C61; }
    .preset-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; font-size: 11px; align-items: center; }
    .chips-label { color: #64748B; font-weight: 600; }
    .preset-chips button { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 3px 8px; border-radius: 4px; cursor: pointer; color: #334155; }
    .preset-chips button:hover { background: #E2E8F0; }
    .consent-row { display: flex; gap: 8px; font-size: 12px; color: #475569; border-top: 1px solid #F1F5F9; padding-top: 12px; margin-top: 12px; align-items: flex-start; }

    .error-banner { background: #FEE2E2; border: 1px solid #FECACA; color: #991B1B; padding: 12px 16px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; }

    /* Timeline Process Bar (Card Reduction) */
    .timeline-bar { padding: 16px 20px; margin-bottom: 20px; }
    .timeline-title { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 12px; }
    .timeline-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .timeline-step { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 6px; border: 1px solid #E2E8F0; background: #FAFAFA; font-size: 11px; }
    .timeline-step.verified { background: #F0FDF4; border-color: #BBF7D0; color: #166534; }
    .timeline-step.duplicate { background: #FEF2F2; border-color: #FECACA; color: #991B1B; }
    .timeline-step.pending { background: #FFFBEB; border-color: #FDE68A; color: #92400E; }
    .step-icon { width: 22px; height: 22px; background: rgba(0,0,0,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .step-desc strong { display: block; font-size: 11px; }
    .step-desc span { font-size: 10px; opacity: 0.85; }

    /* Official Pass Card */
    .pass-card { border: 2px solid #0F2C61; border-radius: 10px; overflow: hidden; margin-bottom: 30px; }
    .pass-header { background: #0F2C61; color: #fff; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .sub-label { font-size: 10px; color: #FDE68A; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .pass-header h2 { font-size: 18px; margin: 3px 0 2px; font-weight: 700; }
    .pass-header p { font-size: 11px; color: #CBD5E1; margin: 0; }
    .badge-status { padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; }
    .badge-status.verified { background: rgba(22,163,74,0.25); color: #4ADE80; border: 1px solid #4ADE80; }
    .badge-status.duplicate { background: rgba(239,68,68,0.25); color: #F87171; border: 1px solid #F87171; }
    .badge-status.pending { background: rgba(245,158,11,0.25); color: #FBBF24; border: 1px solid #FBBF24; }

    .pass-body { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; padding: 24px; }
    @media(max-width: 768px) { .pass-body { grid-template-columns: 1fr; } }
    .name-row { display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; margin-bottom: 14px; }
    .label { font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; }
    .name-val { font-size: 20px; font-weight: 800; color: #0F2C61; }
    .id-val { font-size: 15px; font-weight: 700; color: #B45309; background: #FEF3C7; padding: 2px 8px; border-radius: 4px; border: 1px solid #FDE68A; }

    .grid-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    @media(max-width: 600px) { .grid-details { grid-template-columns: 1fr 1fr; } }
    .detail-cell { background: #F8FAFC; padding: 8px 10px; border-radius: 6px; font-size: 11px; border: 1px solid #EDF2F7; }
    .detail-cell span { display: block; font-size: 9px; color: #64748B; text-transform: uppercase; margin-bottom: 2px; }
    .detail-cell strong { font-size: 12px; color: #1E293B; }
    .cat-text { color: #6D28D9; }
    .credits-text { color: #15803D; }

    .college-cell { background: #EFF6FF; padding: 12px 14px; border-radius: 6px; border: 1px solid #BFDBFE; font-size: 11px; margin-bottom: 12px; }
    .college-cell span { font-size: 9px; color: #64748B; text-transform: uppercase; display: block; }
    .college-cell strong { font-size: 13px; color: #0F2C61; }
    .college-cell p { margin: 2px 0 0; color: #475569; }

    .conflict-cell { background: #FEF2F2; border: 1px solid #FECACA; padding: 10px 14px; border-radius: 6px; font-size: 11px; color: #991B1B; }
    .conflict-cell p { margin: 2px 0 0; font-weight: 500; }

    /* QR Column */
    .qr-col { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-left: 1px solid #F1F5F9; padding-left: 20px; }
    @media(max-width: 768px) { .qr-col { border-left: none; border-top: 1px solid #F1F5F9; padding-left: 0; padding-top: 20px; } }
    .qr-title { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px; }
    .qr-box { width: 130px; height: 130px; border: 2px dashed #0F2C61; display: flex; align-items: center; justify-content: center; background: #FAFAFA; border-radius: 6px; }
    .qr-sim { font-family: monospace; font-size: 10px; color: #0F2C61; font-weight: 700; word-break: break-all; padding: 6px; text-align: center; }
    .hash-text { font-size: 9px; color: #94A3B8; margin: 8px 0 14px; }
    .full-btn { width: 100%; justify-content: center; }

    .pass-footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 12px 24px; display: flex; justify-content: space-between; font-size: 11px; color: #64748B; flex-wrap: wrap; gap: 8px; }
    .pass-footer strong { color: #0F2C61; }
  `]
})
export class StudentComponent implements OnInit {
  apaarInput: string = '123456789012';
  student: Student | null = null;
  loading: boolean = false;
  error: string = '';
  consentGiven: boolean = true;

  constructor(
    private apaarService: ApaarService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.apaarInput = params['id'];
        this.verify();
      } else {
        // Auto-fetch default preset
        this.verify();
      }
    });
  }

  setPreset(id: string) {
    this.apaarInput = id;
    this.verify();
  }

  verify() {
    if (!this.apaarInput.trim()) {
      this.error = 'Please provide a valid 12-digit APAAR ID';
      this.student = null;
      return;
    }

    if (!this.consentGiven) {
      this.error = 'DPDP statutory consent is required to verify academic credentials.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.apaarService.verifyApaar(this.apaarInput.trim()).pipe(
      timeout(5000),
      catchError(err => {
        this.error = err?.error?.detail || err?.error?.message || 'Failed to connect to AICTE Verification Gateway. Check API connectivity.';
        this.student = null;
        this.loading = false;
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(res => {
      this.loading = false;
      if (res && res.success && res.data) {
        this.student = res.data;
        this.error = '';
      }
      this.cdr.detectChanges();
    });
  }

  print() {
    window.print();
  }
}
