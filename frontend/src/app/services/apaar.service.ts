import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id?: number;
  apaarId: string;
  name: string;
  dob: string;
  gender: string;
  mobile: string;
  aadhaarLast4: string;
  collegeId: string;
  collegeName: string;
  course: string;
  academicYear: number;
  abcCredits: number;
  tenthPercent: number;
  twelfthPercent: number;
  status: string;
  category: string;
  enrollmentNo: string;
  admissionDate: string;
  digilockerVerified: boolean;
  state: string;
  duplicateCollegeName?: string;
  duplicateCollegeId?: string;
  flagReason?: string;
  guardianName?: string;
  isProvisional?: boolean;
}

export interface College {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  approvedIntake: number;
  actualEnrolment: number;
  verifiedCount: number;
  pendingCount: number;
  duplicateCount: number;
  supernumeraryQuota: number;
  nriCount: number;
  fnCount: number;
  integrityScore?: number;
  status?: string;
}

export interface ReviewCase {
  id: string;
  caseType: string;
  institutionId: string;
  institutionName: string;
  apaarId: string;
  studentName: string;
  details: string;
  severity: string;
  status: string;
  createdAt: string;
  decidedBy?: string;
  decisionNote?: string;
  decidedAt?: string;
}

export interface SeatPool {
  id: number;
  collegeId: string;
  academicYear: number;
  course: string;
  quotaType: string;
  approvedSeats: number;
  allocatedSeats: number;
  overrunCount: number;
}

export interface BlindMatchConflict {
  id: string;
  institutionA: { id: string; name: string; apaarId: string; studentName: string; course: string };
  institutionB: { id: string; name: string; apaarId: string; studentName: string; course: string };
  diceSimilarity: number;
  conflictType: string;
  privacyMethod: string;
  recommendedAction: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApaarService {
  private get baseUrl(): string {
    if (typeof window !== 'undefined') {
      const customUrl = (window as any).API_URL || localStorage.getItem('API_URL');
      if (customUrl) return customUrl;
      const host = window.location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') {
        return '/api';
      }
    }
    return 'http://127.0.0.1:8085/api';
  }

  constructor(private http: HttpClient) {}

  verifyApaar(apaarId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/verify/${encodeURIComponent(apaarId)}`);
  }

  updateStatus(
    apaarId: string,
    status: string,
    actorEmail: string = 'college@aicte.ac.in',
    role: string = 'COLLEGE_ADMIN',
    reason: string = 'Institutional verification action'
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify/${encodeURIComponent(apaarId)}/status`, {
      status,
      actorEmail,
      role,
      reason,
    });
  }

  getCollegeStats(collegeId: string = 'COL001'): Observable<any> {
    return this.http.get(`${this.baseUrl}/college/stats?collegeId=${collegeId}`);
  }

  getStudents(params?: any): Observable<any> {
    let url = `${this.baseUrl}/college/students`;
    if (params) {
      const q = new URLSearchParams(params).toString();
      url += `?${q}`;
    }
    return this.http.get(url);
  }

  bulkUpload(students: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/college/bulk-upload`, students);
  }

  previewCsv(csvData: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/college/preview`, { csvData });
  }

  registerInstitution(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/college/register`, data);
  }

  getAllColleges(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/colleges`);
  }

  getAuditLogs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/logs`);
  }

  verifyAuditChain(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/verify-audit-chain`);
  }

  getIntegrityScores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/integrity-scores`);
  }

  getStateData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/state-data`);
  }

  downloadExcelReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/aicte/export-excel`, { responseType: 'blob' });
  }

  getReviewCases(status: string = 'ALL'): Observable<any> {
    return this.http.get(`${this.baseUrl}/review/cases?status=${status}`);
  }

  decideReviewCase(caseId: string, decision: string, note: string, actorEmail: string = 'aicte.superadmin@gov.in'): Observable<any> {
    return this.http.post(`${this.baseUrl}/review/cases/${caseId}/decide`, {
      decision,
      note,
      actorEmail,
    });
  }

  getSeatLedger(collegeId: string = 'COL001'): Observable<any> {
    return this.http.get(`${this.baseUrl}/seat-ledger?collegeId=${collegeId}`);
  }

  getBlindMatchConflicts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/blind-match/conflicts`);
  }
}
