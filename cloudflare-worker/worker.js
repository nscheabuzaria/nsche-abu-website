// Cloudflare Worker for NSChE ABU Material Submissions -> Cloudflare R2
// Account: nscheabuzaria1@gmail.com

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

    if (request.method === 'POST' && url.pathname === '/upload') {
      try {
        const formData = await request.formData();
        const level = String(formData.get('level') || 'General').replace(/[^a-zA-Z0-9_-]/g, '');
        const category = String(formData.get('category') || 'Materials').replace(/[^a-zA-Z0-9 _-]/g, '');
        const course = String(formData.get('course') || 'Unspecified').slice(0, 120);
        const session = String(formData.get('session') || '').slice(0, 60);
        const contributor = String(formData.get('contributor') || 'Anonymous').slice(0, 80);
        const files = formData.getAll('files');

        if (!files.length) {
          return Response.json({ error: 'No files provided.' }, { status: 400, headers: corsHeaders });
        }

        const uploaded = [];
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');

        for (const file of files) {
          if (!(file instanceof File)) continue;
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const key = `submissions/${level}/${stamp}-${safeName}`;

          await env.MATERIALS_BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type || 'application/octet-stream' },
            customMetadata: { level, category, course, session, contributor }
          });

          uploaded.push({ key, name: safeName, size: file.size });
        }

        return Response.json({ ok: true, count: uploaded.length, uploaded }, { headers: corsHeaders });
      } catch (err) {
        return Response.json({ error: err.message || 'Upload failed' }, { status: 500, headers: corsHeaders });
      }
    }

    return Response.json({ status: 'NSChE ABU R2 Upload Worker active' }, { headers: corsHeaders });
  }
};
