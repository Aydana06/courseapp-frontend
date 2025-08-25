import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Certificate, CertificateTemplate } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private certificates: Certificate[] = [
    {
      id: 'CERT-001',
      userId: 1,
      courseId: 1,
      courseName: 'Angular 20-р хувилбар',
      userName: 'Бат-Эрдэнэ',
      issueDate: new Date('2024-01-15'),
      completionDate: new Date('2024-01-15'),
      grade: 'A',
      certificateUrl: '/certificates/CERT-001.pdf',
      status: 'issued'
    },
    {
      id: 'CERT-002',
      userId: 1,
      courseId: 2,
      courseName: 'React.js Мастер класс',
      userName: 'Бат-Эрдэнэ',
      issueDate: new Date('2024-01-20'),
      completionDate: new Date('2024-01-20'),
      grade: 'B+',
      certificateUrl: '/certificates/CERT-002.pdf',
      status: 'issued'
    }
  ];

  private certificateTemplates: CertificateTemplate[] = [
    {
      id: 'template-1',
      name: 'Стандарт гэрчилгээ',
      template: `
        <div class="certificate">
          <div class="header">
            <h1>Сургалтын гэрчилгээ</h1>
          </div>
          <div class="content">
            <p>Энэхүү гэрчилгээг {{userName}}-д {{courseName}} сургалтыг амжилттай төгссөн тухай олгоно.</p>
            <p>Төгссөн огноо: {{completionDate}}</p>
            <p>Үнэлгээ: {{grade}}</p>
          </div>
          <div class="footer">
            <div class="signature">
              <p>Гарын үсэг</p>
            </div>
          </div>
        </div>
      `
    }
  ];

  constructor() {}

  getUserCertificates(userId: number): Observable<Certificate[]> {
    const userCertificates = this.certificates.filter(c => c.userId === userId);
    return of(userCertificates);
  }

  getCertificateById(certificateId: string): Observable<Certificate | null> {
    const certificate = this.certificates.find(c => c.id === certificateId);
    return of(certificate || null);
  }

  generateCertificate(userId: number, courseId: number, courseName: string, userName: string, grade?: string): Observable<Certificate> {
    const certificateId = `CERT-${Date.now()}`;
    const certificate: Certificate = {
      id: certificateId,
      userId,
      courseId,
      courseName,
      userName,
      issueDate: new Date(),
      completionDate: new Date(),
      grade,
      certificateUrl: `/certificates/${certificateId}.pdf`,
      status: 'issued'
    };

    this.certificates.push(certificate);
    return of(certificate);
  }

  downloadCertificate(certificateId: string): Observable<string> {
    const certificate = this.certificates.find(c => c.id === certificateId);
    if (certificate) {
      // In real app, generate PDF and return download URL
      return of(certificate.certificateUrl || '');
    }
    return of('');
  }

  validateCertificate(certificateId: string): Observable<{ valid: boolean; certificate?: Certificate }> {
    const certificate = this.certificates.find(c => c.id === certificateId);
    if (certificate && certificate.status === 'issued') {
      return of({ valid: true, certificate });
    }
    return of({ valid: false });
  }

  getCertificateTemplates(): Observable<CertificateTemplate[]> {
    return of(this.certificateTemplates);
  }

  createCertificateTemplate(template: CertificateTemplate): Observable<CertificateTemplate> {
    this.certificateTemplates.push(template);
    return of(template);
  }

  revokeCertificate(certificateId: string): Observable<boolean> {
    const certificate = this.certificates.find(c => c.id === certificateId);
    if (certificate) {
      certificate.status = 'expired';
      return of(true);
    }
    return of(false);
  }
} 