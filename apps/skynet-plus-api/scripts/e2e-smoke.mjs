#!/usr/bin/env node

/**
 * Lightweight end-to-end smoke run that exercises the core API flow:
 * - Register tenant + admin
 * - Create training program + lesson
 * - Create aircraft and a student profile (using the admin account)
 * - Schedule a sortie, ingest WX data, annotate dispatch, fetch ops summary
 * - Create a support ticket and open a messaging thread for the sortie
 *
 * Usage:
 *   BASE_URL=http://localhost:3000/api node scripts/e2e-smoke.mjs
 *
 * Prereqs:
 *   - npm run start:dev (or prod server) is already running
 *   - BASE_URL defaults to http://localhost:3000/api when not provided
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const results = [];

async function request(method, path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...jsonHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${path}: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function logStep(label, data) {
  results.push({ step: label, info: data });
  console.log(`✅ ${label}`);
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

(async () => {
  try {
    const tenantSlug = `demo-${Date.now()}-${randomSuffix()}`;
    const adminEmail = `${tenantSlug}@example.com`;

    const registerBody = {
      tenantName: `Flight Academy ${tenantSlug}`,
      regulatoryFrameworkCode: 'DGCA',
      timezone: 'Asia/Kolkata',
      adminEmail,
      adminPassword: 'SecurePass123!',
      adminFullName: `Admin ${tenantSlug}`,
    };

    const registerResponse = await request('POST', '/auth/register-tenant', registerBody);
    logStep('Registered tenant + admin', {
      tenantId: registerResponse.user.tenantId,
      adminEmail,
    });

    const token = registerResponse.accessToken;
    const adminUserId = registerResponse.user.id;

    const program = await request(
      'POST',
      '/training/programs',
      {
        code: `P-${randomSuffix().toUpperCase()}`,
        name: 'DGCA CPL',
        regulatoryFrameworkCode: 'DGCA',
        category: 'FLIGHT',
      },
      token,
    );
    logStep('Created training program', { programId: program.id });

    const lesson = await request(
      'POST',
      `/training/programs/${program.id}/lessons`,
      {
        code: `L-${randomSuffix().toUpperCase()}`,
        name: 'Circuit Ops',
        lessonType: 'FLIGHT',
        sequenceOrder: 1,
        durationMinutes: 90,
        requirements: { weather: 'VFR' },
      },
      token,
    );
    logStep('Created lesson', { lessonId: lesson.id });

    const aircraft = await request(
      'POST',
      '/fleet/aircraft',
      {
        registration: `VT-${randomSuffix().toUpperCase()}`,
        type: 'C172',
        baseAirportIcao: 'VOBL',
        status: 'ACTIVE',
        capabilities: { ifr: true },
      },
      token,
    );
    logStep('Created aircraft', { aircraftId: aircraft.id });

    const studentProfile = await request(
      'POST',
      `/training/students/${adminUserId}/profile`,
      {
        regulatoryId: `STU-${randomSuffix().toUpperCase()}`,
        enrollmentDate: new Date().toISOString(),
        status: 'ACTIVE',
        notes: 'Auto-created via smoke test',
      },
      token,
    );
    logStep('Created student profile', { studentProfileId: studentProfile.id });

    const reportTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const sortie = await request(
      'POST',
      '/roster/sorties',
      {
        studentProfileId: studentProfile.id,
        instructorUserId: adminUserId,
        aircraftId: aircraft.id,
        programId: program.id,
        lessonId: lesson.id,
        airportIcao: 'VOBL',
        reportTime,
        dispatchNotes: 'Auto-generated sortie',
      },
      token,
    );
    logStep('Scheduled sortie', { sortieId: sortie.id });

    await request(
      'POST',
      '/environment/ingest',
      {
        airportIcao: 'VOBL',
        capturedAt: new Date().toISOString(),
        metarJson: {
          visibility: 8000,
          ceiling: 4500,
          crosswindComponent: 5,
        },
        tafJson: { forecast: 'VFR' },
        notamsJson: { items: [{ text: 'RWY 09/27 OPEN' }] },
        trafficJson: { densityIndex: 0.3 },
      },
      token,
    );
    logStep('Ingested environment snapshot', { airport: 'VOBL' });

    await request(
      'POST',
      `/dispatch/sorties/${sortie.id}/annotate`,
      { notes: 'WX check complete' },
      token,
    );
    logStep('Annotated dispatch', { sortieId: sortie.id });

    const today = new Date().toISOString().slice(0, 10);
    const opsSummary = await request(
      'GET',
      `/ops/summary?date=${today}`,
      undefined,
      token,
    );
    logStep('Fetched ops summary', {
      date: today,
      totalSorties: opsSummary?.totalSorties ?? 0,
    });

    const ticket = await request(
      'POST',
      '/support/tickets',
      {
        category: 'SCHEDULING',
        priority: 'MEDIUM',
        subject: 'Smoke test sortie review',
        description: 'Auto-created ticket for sortie follow-up.',
        linkedSortieId: sortie.id,
        linkedAircraftId: aircraft.id,
        linkedStudentProfileId: studentProfile.id,
      },
      token,
    );
    logStep('Created support ticket', { ticketId: ticket.id });

    const thread = await request(
      'POST',
      `/messaging/threads/sortie/${sortie.id}/open-or-create`,
      {},
      token,
    );
    logStep('Opened sortie messaging thread', {
      threadId: thread.thread?.id,
      messageCount: thread.messages?.length ?? 0,
    });

    console.log('\nSmoke run complete. Summary:');
    console.table(results);
  } catch (error) {
    console.error('❌ Smoke run failed:', error.message);
    process.exit(1);
  }
})();


