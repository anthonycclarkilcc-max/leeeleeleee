import { isBot, getClientIP, sendTelegram, botResponse } from './_utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Anti-bot: silently drop bots/scanners
  if (isBot(req)) {
    console.log('🛡️ Bot blocked on /api/visit:', req.headers['user-agent']);
    return botResponse(res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pageUrl, referrer, userAgent, screenResolution, language, platform } = req.body;
    const clientIP = getClientIP(req);
    const timestamp = new Date().toLocaleString();

    let message = `👁️ *NEW PAGE VISIT*\n\n`;
    message += `*🌐 VISITOR INFO:*\n`;
    message += `🌍 IP: \`${clientIP}\`\n`;
    message += `🔗 Page: \`${pageUrl || 'unknown'}\`\n`;
    message += `📍 Referrer: \`${referrer || 'Direct'}\`\n`;
    message += `💻 Platform: \`${platform || 'unknown'}\`\n`;
    message += `🖥 Screen: \`${screenResolution || 'unknown'}\`\n`;
    message += `🌍 Language: \`${language || 'unknown'}\`\n\n`;

    message += `*📡 SERVER:*\n`;
    message += `🔗 Domain: \`${req.headers.host || 'vercel.app'}\`\n`;
    message += `⏰ Time: \`${timestamp}\`\n`;
    message += `✅ Vercel Serverless`;

    await sendTelegram(message, process.env);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Visit error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
