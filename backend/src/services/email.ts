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

export const sendRegistrationConfirmation = async (
  email: string,
  data: {
    fullName: string;
    eventName: string;
    eventDate: string;
    eventLocation: string;
    distance: string;
    bibNumber: number;
    city: 'suzdal' | 'igora' | 'pushkin';
  }
) => {
  const cityInfo: Record<string, { address: string; regTime: string; raceTime: string; awardTime: string }> = {
    suzdal: {
      address: 'Владимирская область, г. Суздаль, Торговая площадь',
      regTime: '8:30 – 9:30',
      raceTime: '10:00 – 14:00',
      awardTime: '14:00 – 15:30',
    },
    igora: {
      address: 'Ленинградская область, Приозерский район, всесезонный курорт «Игора», Всесезонная улица, 1, корп. 89',
      regTime: '7:00 – 8:30',
      raceTime: '9:00 – 12:00',
      awardTime: '12:30 – 14:00',
    },
    pushkin: {
      address: 'Санкт-Петербург, г. Пушкин, Петербургское ш., д.2',
      regTime: '5:30 – 6:30',
      raceTime: '7:00 – 10:00',
      awardTime: '10:00 – 11:30',
    },
  };

  const info = cityInfo[data.city] || cityInfo.suzdal;
  const chuchaUrl = 'https://tourderussie.ru/images/chucha-founder.svg';
  const logoUrl = 'https://tourderussie.ru/images/logo-header.svg';

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Tour de Russie" <noreply@tourderussie.ru>',
    to: email,
    subject: `Вы зарегистрированы на Tour de Russie — ${data.eventName}`,
    html: `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:#003051;padding:24px 32px;text-align:center;">
        <img src="${logoUrl}" alt="Tour de Russie" height="40" style="height:40px;" />
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px;">
        <p style="font-size:16px;color:#333;margin:0 0 16px;">Уважаемый(ая) <strong>${data.fullName}</strong>!</p>

        <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
          Вы зарегистрированы на дистанцию <strong>${data.distance}</strong> серии велозаездов Tour de Russie,
          который состоится <strong>${data.eventDate}</strong> в <strong>${data.eventLocation}</strong>.
          Ваш стартовый номер:
        </p>

        <div style="background:#f0f4f8;border-left:4px solid #003051;padding:20px 24px;margin:0 0 24px;text-align:center;">
          <span style="font-size:64px;font-weight:bold;color:#003051;letter-spacing:4px;">${data.bibNumber}</span>
        </div>

        <p style="font-size:15px;color:#333;margin:0 0 8px;">
          Выдача стартовых пакетов состоится <strong>${data.eventDate}</strong> в стартовом городке по адресу:
          <strong>${info.address}</strong> с ${info.regTime.split('–')[0].trim()} до ${info.regTime.split('–')[1].trim()}.
        </p>

        <p style="font-size:15px;color:#333;margin:16px 0 8px;">Напоминаем, что при себе необходимо иметь:</p>
        <ul style="font-size:14px;color:#444;line-height:1.8;padding-left:20px;margin:0 0 24px;">
          <li>оригинал документа, удостоверяющего личность;</li>
          <li>оригинал и копия медицинской справки (форма 083/5-89);</li>
          <li>оригинал заполненного и подписанного заявления об отказе от ответственности (дисклеймера);</li>
          <li>копия полиса страхования, включающего риски при занятии велосипедным спортом;</li>
          <li>документ на льготу (при наличии);</li>
          <li>для иностранных граждан — страховка, покрывающая лечение в РФ.</li>
        </ul>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-radius:8px;padding:16px;margin:0 0 24px;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #dde3ea;">
            <span style="font-size:13px;color:#003051;font-weight:bold;">${info.regTime}</span>
            <span style="font-size:13px;color:#555;margin-left:12px;">Регистрация, выдача стартовых пакетов и чипов хронометража</span>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #dde3ea;">
            <span style="font-size:13px;color:#003051;font-weight:bold;">${info.raceTime}</span>
            <span style="font-size:13px;color:#555;margin-left:12px;">Проведение заезда</span>
          </td></tr>
          <tr><td style="padding:8px 0;">
            <span style="font-size:13px;color:#003051;font-weight:bold;">${info.awardTime}</span>
            <span style="font-size:13px;color:#555;margin-left:12px;">Награждение</span>
          </td></tr>
        </table>
      </td></tr>

      <!-- Footer with Chucha -->
      <tr><td style="background:#003051;padding:24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:bottom;">
              <img src="${chuchaUrl}" alt="Чуча" height="120" style="height:120px;display:block;" />
            </td>
            <td style="vertical-align:middle;padding-left:16px;">
              <p style="color:#ffffff;font-size:14px;margin:0 0 4px;font-style:italic;">С уважением,</p>
              <p style="color:#ffffff;font-size:16px;font-weight:bold;margin:0;">Чуча, основатель</p>
              <p style="color:#22AAAB;font-size:13px;margin:8px 0 0;">
                <a href="https://tourderussie.ru" style="color:#22AAAB;text-decoration:none;">tourderussie.ru</a>
              </p>
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Письмо о регистрации отправлено на ${email}`);
    return result;
  } catch (error: any) {
    console.error('❌ Ошибка отправки письма о регистрации:', error.message);
  }
};

export const sendVerificationCode = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Tour de Russie" <noreply@tourderussie.ru>',
    to: email,
    subject: 'Код подтверждения — Tour de Russie',
    text: `Ваш код подтверждения: ${code}\n\nКод действителен 10 минут.\n\nTour de Russie`,
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

export const sendPasswordResetCode = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Tour de Russie" <noreply@tourderussie.ru>',
    to: email,
    subject: 'Сброс пароля — Tour de Russie',
    text: `Ваш код для сброса пароля на Tour de Russie: ${code}\n\nКод действителен 10 минут.\n\nЕсли вы не запрашивали сброс пароля — проигнорируйте письмо.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #003051; text-align: center; margin-bottom: 20px;">Tour de Russie</h2>
        <p style="color: #333; font-size: 16px;">Ваш код для сброса пароля:</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 20px 0;">
          <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #003051;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">Код действителен 10 минут.</p>
        <p style="color: #666; font-size: 14px;">Если вы не запрашивали сброс пароля — просто проигнорируйте письмо.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    throw new Error('Ошибка отправки письма для сброса пароля');
  }
};
