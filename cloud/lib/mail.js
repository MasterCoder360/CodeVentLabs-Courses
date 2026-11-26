/* Outbound email.

   Mail goes out through Resend (https://resend.com) with a plain fetch,
   so there is nothing to install. Set two secrets on the site:

     RESEND_API_KEY   your Resend API key
     MAIL_FROM        e.g. CodeVent Labs <accounts@labs.cosmospark.org>
                      (the domain must be verified in Resend)

   Without RESEND_API_KEY nothing is sent and the API reports
   `sent: false, reason: 'unconfigured'` so the page can say so plainly
   instead of pretending an email is on its way. */

export function siteUrl(env) {
    return String(env.SITE_URL || 'https://courses.labs.cosmospark.org').replace(/\/+$/, '');
}

export function mailConfigured(env) {
    return Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
}

export async function sendMail(env, message) {
    if (!mailConfigured(env)) return { sent: false, reason: 'unconfigured' };

    /* MAIL_ENDPOINT exists so local development can point at a throwaway
       HTTP server; production uses Resend. */
    const endpoint = env.MAIL_ENDPOINT || 'https://api.resend.com/emails';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + env.RESEND_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: env.MAIL_FROM,
                to: [message.to],
                subject: message.subject,
                text: message.text,
                html: message.html,
            }),
        });
        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            console.error('mail send failed', response.status, detail.slice(0, 300));
            return { sent: false, reason: 'failed' };
        }
        return { sent: true };
    } catch (err) {
        console.error('mail send error', err && err.message || err);
        return { sent: false, reason: 'failed' };
    }
}

/* Small shared wrapper for the two transactional emails. */
export function mailShell(heading, body, buttonText, link) {
    return {
        text: `${heading}\n\n${body}\n\n${buttonText}: ${link}\n\n` +
              `If you didn’t ask for this, you can ignore this email.\n\n— CodeVent Labs`,
        html: `<!doctype html><html><body style="margin:0;background:#F7F7F7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#3C3C3C">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <div style="background:#fff;border:2px solid #E5E5E5;border-radius:18px;padding:28px">
      <h1 style="margin:0 0 12px;font-size:22px;color:#3C3C3C">${heading}</h1>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#555">${body}</p>
      <p style="margin:0 0 22px">
        <a href="${link}" style="display:inline-block;background:#58CC02;color:#fff;text-decoration:none;font-weight:800;letter-spacing:.5px;padding:14px 22px;border-radius:12px">${buttonText}</a>
      </p>
      <p style="margin:0;font-size:12.5px;line-height:1.6;color:#999">
        If the button doesn’t work, paste this link into your browser:<br>
        <a href="${link}" style="color:#1CB0F6;word-break:break-all">${link}</a>
      </p>
    </div>
    <p style="margin:18px 0 0;font-size:12px;color:#999;text-align:center">
      CodeVent Labs · You received this because someone used this address on our courses site.
    </p>
  </div>
</body></html>`,
    };
}
