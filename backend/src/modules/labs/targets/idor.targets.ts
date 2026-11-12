import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * IDOR Target Microservices (100% In-Memory Simulation)
 * Safe implementation: No real database modification or sensitive system access.
 */
export function handleIdorTarget(
  slug: string,
  subpath: string,
  req: Request,
  res: Response,
  rawFlag: string,
) {
  const method = req.method.toUpperCase();
  const cleanPath = subpath.replace(/\/+$/, '') || '/';

  // -------------------------------------------------------------------------
  // Challenge 1: Invoice Vault (IDOR - Medium, 200 pts, CWE-639)
  // Scenario: Billing portal with sequential numeric invoice IDs.
  // Invoice 1000 belongs to the CEO/Administrator and contains the flag.
  // -------------------------------------------------------------------------
  if (slug === 'invoice-vault' || slug === 'bola-order-resource-hijack') {
    // Root discovery endpoint
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/invoices'
    ) {
      if (req.query.id) {
        return serveInvoice(String(req.query.id), res, rawFlag);
      }
      return res.status(HttpStatus.OK).json({
        portal: 'Apex FinSecure Billing System v4.1',
        status: 'ONLINE',
        authenticatedUser: 'j_doe_contractor',
        accessibleInvoices: [
          {
            id: 1001,
            date: '2026-02-01',
            amount: '$450.00',
            status: 'PAID',
            endpoint: '/api/invoices/1001',
          },
          {
            id: 1002,
            date: '2026-02-15',
            amount: '$1,200.00',
            status: 'PAID',
            endpoint: '/api/invoices/1002',
          },
          {
            id: 1003,
            date: '2026-03-01',
            amount: '$850.00',
            status: 'PENDING',
            endpoint: '/api/invoices/1003',
          },
        ],
        hint: 'Direct invoice access endpoint: /api/invoices/:id',
      });
    }

    // Direct invoice lookup: /api/invoices/:id or /invoices/:id
    const invoiceMatch = cleanPath.match(/\/(?:api\/)?invoices\/(\d+)/i);
    if (invoiceMatch) {
      const invoiceId = invoiceMatch[1];
      return serveInvoice(invoiceId, res, rawFlag);
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoints: /api/invoices, /api/invoices/:id',
    });
  }

  // -------------------------------------------------------------------------
  // Challenge 2: Ghost Patient (IDOR - Hard, 350 pts, CWE-639)
  // Scenario: Clinic portal where patient records are referenced by UUIDs.
  // UUIDs leak from /api/patients/directory.
  // GET is protected by attending physician check, but PUT/DELETE is not.
  // -------------------------------------------------------------------------
  if (slug === 'ghost-patient') {
    const adminPatientUuid = 'e8b7c6d5-4a3b-2c1d-0e9f-8a7b6c5d4e3f';

    // Directory / Audit Log leaks patient record UUIDs
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/patients' ||
      cleanPath === '/api/patients/directory'
    ) {
      return res.status(HttpStatus.OK).json({
        system: 'St. Jude Digital Healthcare Patient Registry',
        version: 'v3.8-Enterprise',
        department: 'Neurology & Special Care',
        message:
          'Patient Record Index (Access restricted to authorized personnel)',
        registeredPatients: [
          {
            name: 'Marcus Vance',
            recordId: 'c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c',
            room: '302-B',
            admitted: '2026-01-14',
          },
          {
            name: 'VIP Executive (Patient Zero)',
            recordId: adminPatientUuid,
            room: 'Private Suite 901',
            admitted: '2026-02-01',
            confidentialFlag: true,
          },
          {
            name: 'Elena Rostova',
            recordId: 'f9e8d7c6-b5a4-3c2d-1e0f-9a8b7c6d5e4f',
            room: '108-A',
            admitted: '2026-02-20',
          },
        ],
        documentation: 'Individual record inspection: /api/patients/:recordId',
      });
    }

    // Specific patient record endpoint: /api/patients/:recordId
    const patientMatch = cleanPath.match(
      /\/(?:api\/)?patients\/([a-zA-Z0-9-]+)/i,
    );
    if (patientMatch) {
      const recordId = patientMatch[1].toLowerCase();

      // Case A: GET Request - Properly protected with clearance error
      if (method === 'GET') {
        if (recordId === adminPatientUuid) {
          return res.status(HttpStatus.FORBIDDEN).json({
            error: 'Access Denied',
            code: 'AUTH_CLEARANCE_REQUIRED',
            message:
              'Record e8b7c6d5-4a3b-2c1d-0e9f-8a7b6c5d4e3f is flagged VIP/RESTRICTED. GET requests require Chief Medical Officer cryptographic token.',
          });
        }
        return res.status(HttpStatus.OK).json({
          recordId,
          name: 'Marcus Vance',
          diagnosis: 'Acute migraine with neural telemetry monitoring',
          status: 'Stable',
        });
      }

      // Case B: Method Tampering (PUT or PATCH or DELETE) - IDOR flaw!
      if (method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
        if (recordId === adminPatientUuid) {
          return res.status(HttpStatus.OK).json({
            success: true,
            methodUsed: method,
            notice:
              'Record updated successfully. Attending physician authorization was bypassed due to missing verb validation.',
            patientRecord: {
              recordId: adminPatientUuid,
              patientName: 'VIP Executive (Patient Zero)',
              clearanceLevel: 'LEVEL-5 RESTRICTED',
              admittingPhysician: 'Dr. Aris Thorne',
              confidentialDiagnosisNotes: `Confidential clinical discharge code and verification flag: ${rawFlag}`,
              medications: ['Neuro-Soma 50mg', 'Cognitive Stabilizer'],
            },
          });
        }

        return res.status(HttpStatus.OK).json({
          success: true,
          recordId,
          message: 'Patient record attributes updated.',
        });
      }
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoints: /api/patients, /api/patients/:recordId',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Unknown IDOR Challenge Slug',
  });
}

function serveInvoice(id: string, res: Response, rawFlag: string) {
  if (id === '1000') {
    return res.status(HttpStatus.OK).json({
      invoiceId: 1000,
      invoiceNumber: 'INV-2026-0001000',
      client: 'Executive Operations / Platform Administrator',
      billingAddress: 'Suite 900, Global Headquarters, Apex Tower',
      issueDate: '2026-01-01',
      dueDate: '2026-01-15',
      items: [
        {
          description: 'Quarterly Infrastructure Penetration Audit',
          amount: '$24,500.00',
        },
        { description: 'Zero-Day Red Team Retainer', amount: '$15,000.00' },
      ],
      totalAmount: '$39,500.00',
      paymentStatus: 'SETTLED',
      adminConfidentialNotes: `Private payment verification flag: ${rawFlag}`,
    });
  }

  if (id === '1001') {
    return res.status(HttpStatus.OK).json({
      invoiceId: 1001,
      invoiceNumber: 'INV-2026-0001001',
      client: 'John Doe (Contractor)',
      issueDate: '2026-02-01',
      totalAmount: '$450.00',
      paymentStatus: 'PAID',
      notes: 'Standard contract services rendered.',
    });
  }

  if (id === '1002') {
    return res.status(HttpStatus.OK).json({
      invoiceId: 1002,
      invoiceNumber: 'INV-2026-0001002',
      client: 'John Doe (Contractor)',
      issueDate: '2026-02-15',
      totalAmount: '$1,200.00',
      paymentStatus: 'PAID',
      notes: 'Web application testing phase 1.',
    });
  }

  if (id === '1003') {
    return res.status(HttpStatus.OK).json({
      invoiceId: 1003,
      invoiceNumber: 'INV-2026-0001003',
      client: 'John Doe (Contractor)',
      issueDate: '2026-03-01',
      totalAmount: '$850.00',
      paymentStatus: 'PENDING',
      notes: 'Pending customer signoff.',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Invoice Not Found',
    invoiceId: id,
    message:
      'The requested invoice record does not exist in the billing registry.',
  });
}
