import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Проверка наличия SMTP настроек
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

if (!smtpHost || !smtpUser || !smtpPassword) {
  console.error('❌ SMTP настройки не найдены в .env файле!');
  console.error('Проверьте: SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
}

console.log('📧 SMTP Configuration:');
console.log(`  Host: ${smtpHost}`);
console.log(`  Port: ${smtpPort}`);
console.log(`  User: ${smtpUser}`);
console.log(`  Secure: ${smtpPort === 465}`);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true для 465, false для других портов
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
  // Дополнительные настройки для проблемных SMTP серверов
  tls: {
    rejectUnauthorized: false, // Для самоподписанных сертификатов
  },
  debug: process.env.NODE_ENV === 'development', // Включить debug в dev режиме
  logger: process.env.NODE_ENV === 'development', // Логирование в dev режиме
});

// Проверка подключения при старте
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('Детали ошибки:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

export const sendVerificationCode = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Tour de Russie" <noreply@tourderussie.ru>',
    to: email,
    subject: `Ваш код: ${code} — Tour de Russie`,
    text: `Ваш код подтверждения: ${code}\n\nКод действителен 10 минут.\n\nТour de Russie`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #003051; text-align: center; margin-bottom: 20px;">Tour de Russie</h2>
        <p style="color: #333; font-size: 16px;">Ваш код подтверждения для регистрации:</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 20px 0;">
          <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #003051;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">Код действителен 10 минут.</p>
        <p style="color: #666; font-size: 14px;">Если вы не запрашивали этот код — просто проигнорируйте письмо.</p>
      </div>
    `,
  };

  try {
    console.log(`📤 Отправка кода на ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Код успешно отправлен на ${email}`);
    console.log(`Message ID: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error('❌ Ошибка отправки email:', error);
    console.error('Детали:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });

    // Более информативное сообщение об ошибке
    let errorMessage = 'Ошибка отправки письма';

    if (error.code === 'EAUTH') {
      errorMessage = 'Ошибка аутентификации SMTP. Проверьте логин и пароль.';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Не удалось подключиться к SMTP серверу. Проверьте хост и порт.';
    } else if (error.responseCode === 550) {
      errorMessage = 'Email адрес отклонен сервером.';
    }

    throw new Error(errorMessage + ` (${error.code || 'UNKNOWN'})`);
  }
};
