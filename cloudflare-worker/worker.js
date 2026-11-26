// Cloudflare Worker for NSChE ABU Material Submissions -> Cloudflare R2
// Account: nscheabuzaria1@gmail.com
// Includes a strict free-tier circuit breaker so R2 never exceeds $0/month limits.

const MAX_BUCKET_BYTES = 8.5 * 1024 * 1024 * 1024; // 8.5 GB hard cap (10 GB free tier)
const MAX_MONTHLY_WRITES = 50_000;                  // 50k writes/mo hard cap (1M free Class A ops)
const MAX_FILES_PER_SUBMISSION = 10;
const MAX_SINGLE_FILE_BYTES = 25 * 1024 * 1024;     // 25 MB max per file
const QUOTA_KEY = '_system/quota-ledger.json';

async function loadLedger(bucket, monthKey) {
  try {
    const obj = await bucket.get(QUOTA_KEY);
    if (obj) {
      const data = await obj.json();
      if (data && typeof data.totalBytes === 'number') {
        if (data.month !== monthKey) {
          return { totalBytes: data.totalBytes, month: monthKey, monthWrites: 0, locked: data.totalBytes >= MAX_BUCKET_BYTES };
        }
        return data;
      }
    }
  } catch {
    // First run or unreadable ledger
  }
  return { totalBytes: 0, month: monthKey, monthWrites: 0, locked: false };
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM

    if (request.method === 'GET' && url.pathname === '/status') {
      const ledger = await loadLedger(env.MATERIALS_BUCKET, monthKey);
      return Response.json({
        ok: !ledger.locked && ledger.totalBytes < MAX_BUCKET_BYTES && ledger.monthWrites < MAX_MONTHLY_WRITES,
        usedMB: Math.round(ledger.totalBytes / (1024 * 1024)),
        capMB: Math.round(MAX_BUCKET_BYTES / (1024 * 1024)),
        monthWrites: ledger.monthWrites,
        maxMonthWrites: MAX_MONTHLY_WRITES
      }, { headers: corsHeaders });
    }

    if (request.method === 'POST' && url.pathname === '/upload') {
      try {
        const ledger = await loadLedger(env.MATERIALS_BUCKET, monthKey);

        // Circuit breaker: refuse all writes before approaching Cloudflare free-tier limits
        if (ledger.locked || ledger.totalBytes >= MAX_BUCKET_BYTES || ledger.monthWrites >= MAX_MONTHLY_WRITES) {
          return Response.json({
            error: 'Uploads are temporarily paused because the free storage safety limit has been reached.'
          }, { status: 503, headers: corsHeaders });
        }

        const formData = await request.formData();
        const level = String(formData.get('level') || 'General').replace(/[^a-zA-Z0-9_-]/g, '');
        const category = String(formData.get('category') || 'Materials').replace(/[^a-zA-Z0-9 _-]/g, '');
        const course = String(formData.get('course') || 'Unspecified').slice(0, 120);
        const session = String(formData.get('session') || '').slice(0, 60);
        const contributor = String(formData.get('contributor') || 'Anonymous').slice(0, 80);
        const files = formData.getAll('files').filter((f) => f instanceof File);

        if (!files.length) {
          return Response.json({ error: 'No files provided.' }, { status: 400, headers: corsHeaders });
        }
        if (files.length > MAX_FILES_PER_SUBMISSION) {
          return Response.json({ error: `Maximum ${MAX_FILES_PER_SUBMISSION} files per upload.` }, { status: 400, headers: corsHeaders });
        }

        let incomingBytes = 0;
        for (const file of files) {
          if (file.size > MAX_SINGLE_FILE_BYTES) {
            return Response.json({ error: `${file.name} exceeds 25 MB.` }, { status: 413, headers: corsHeaders });
          }
          incomingBytes += file.size;
        }

        if (ledger.totalBytes + incomingBytes > MAX_BUCKET_BYTES || ledger.monthWrites + files.length + 1 > MAX_MONTHLY_WRITES) {
          ledger.locked = true;
          await env.MATERIALS_BUCKET.put(QUOTA_KEY, JSON.stringify(ledger), {
            httpMetadata: { contentType: 'application/json' }
          });
          return Response.json({
            error: 'Upload paused: storage safety cap reached.'
          }, { status: 503, headers: corsHeaders });
        }

        const uploaded = [];
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');

        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const key = `submissions/${level}/${stamp}-${safeName}`;

          await env.MATERIALS_BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type || 'application/octet-stream' },
            customMetadata: { level, category, course, session, contributor }
          });

          uploaded.push({ key, name: safeName, size: file.size });
        }

        ledger.totalBytes += incomingBytes;
        ledger.monthWrites += files.length + 1;
        await env.MATERIALS_BUCKET.put(QUOTA_KEY, JSON.stringify(ledger), {
          httpMetadata: { contentType: 'application/json' }
        });

        return Response.json({ ok: true, count: uploaded.length, uploaded }, { headers: corsHeaders });
      } catch (err) {
        return Response.json({ error: err.message || 'Upload failed' }, { status: 500, headers: corsHeaders });
      }
    }

    return Response.json({ status: 'NSChE ABU R2 Upload Worker active' }, { headers: corsHeaders });
  }
};
