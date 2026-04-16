import crypto from 'crypto';
import axios from 'axios';

const MERCHANT_LOGIN = process.env.ROBOKASSA_MERCHANT_LOGIN || '';
const PASSWORD_1 = process.env.ROBOKASSA_PASSWORD_1 || '';
const PASSWORD_2 = process.env.ROBOKASSA_PASSWORD_2 || '';
const ROBOKASSA_URL = process.env.ROBOKASSA_URL || 'https://auth.robokassa.ru/Merchant/Index.aspx';
const API_URL = process.env.ROBOKASSA_API_URL || 'https://services.robokassa.ru/InvoiceServiceWebApi/api';
const IS_TEST = process.env.ROBOKASSA_TEST_MODE === 'true';

export class RobokassaService {
  /**
   * Generate MD5 signature for payment link (classic integration)
   */
  static generateSignature(
    merchantLogin: string,
    outSum: string,
    invId: number,
    password: string,
    customParams?: Record<string, string>
  ): string {
    let signatureBase = `${merchantLogin}:${outSum}:${invId}:${password}`;

    if (customParams) {
      const sortedKeys = Object.keys(customParams).sort();
      for (const key of sortedKeys) {
        signatureBase += `:${customParams[key]}`;
      }
    }

    return crypto.createHash('md5').update(signatureBase).digest('hex');
  }

  /**
   * Verify signature from Robokassa callback
   */
  static verifySignature(
    outSum: string,
    invId: string,
    signatureValue: string,
    password: string,
    customParams?: Record<string, string>
  ): boolean {
    let signatureBase = `${outSum}:${invId}:${password}`;

    if (customParams) {
      const sortedKeys = Object.keys(customParams).sort();
      for (const key of sortedKeys) {
        signatureBase += `:${customParams[key]}`;
      }
    }

    const expectedSignature = crypto.createHash('md5').update(signatureBase).digest('hex');
    return expectedSignature.toLowerCase() === signatureValue.toLowerCase();
  }

  /**
   * Generate payment URL (classic integration)
   */
  static generatePaymentUrl(
    invId: number,
    outSum: number,
    description: string,
    customParams?: Record<string, string>
  ): string {
    const signature = this.generateSignature(
      MERCHANT_LOGIN,
      outSum.toString(),
      invId,
      PASSWORD_1,
      customParams
    );

    let url = `${ROBOKASSA_URL}?MerchantLogin=${encodeURIComponent(MERCHANT_LOGIN)}`;
    url += `&OutSum=${outSum}`;
    url += `&InvId=${invId}`;
    url += `&Description=${encodeURIComponent(description)}`;
    url += `&SignatureValue=${signature}`;
    url += `&Culture=ru`;
    if (IS_TEST) {
      url += `&IsTest=1`;
    }

    if (customParams) {
      for (const [key, value] of Object.entries(customParams)) {
        url += `&${key}=${encodeURIComponent(value)}`;
      }
    }

    return url;
  }

  /**
   * Create invoice via Robokassa API (modern integration)
   */
  static async createInvoice(
    invId: number,
    outSum: number,
    description: string,
    successUrl: string,
    failUrl: string,
    customParams?: Record<string, string>,
    invoiceItems?: Array<{
      Name: string;
      Quantity: number;
      Cost: number;
      Tax: string;
      PaymentMethod: string;
      PaymentObject: string;
    }>
  ): Promise<string> {
    const payload = {
      MerchantLogin: MERCHANT_LOGIN,
      InvoiceType: 'OneTime',
      Culture: 'ru',
      InvId: invId,
      OutSum: outSum,
      Description: description,
      MerchantComments: '',
      UserFields: customParams || {},
      InvoiceItems: invoiceItems || [
        {
          Name: description,
          Quantity: 1,
          Cost: outSum,
          Tax: 'none',
          PaymentMethod: 'full_payment',
          PaymentObject: 'service',
        },
      ],
      SuccessUrl2Data: {
        Url: successUrl,
        Method: 'GET',
      },
      FailUrl2Data: {
        Url: failUrl,
        Method: 'GET',
      },
    };

    // Create JWT-like token with MD5 signature
    const header = { typ: 'JWT', alg: 'MD5' };
    const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signatureBase = `${headerEncoded}.${payloadEncoded}:${PASSWORD_1}`;
    const signature = crypto.createHash('md5').update(signatureBase).digest('hex');

    const token = `${headerEncoded}.${payloadEncoded}.${signature}`;

    const response = await axios.post(
      `${API_URL}/CreateInvoice`,
      { token },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data.invoice_url || response.data.paymentLink;
  }

  /**
   * Extract custom parameters from Robokassa callback
   */
  static extractCustomParams(params: Record<string, string>): Record<string, string> {
    const custom: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (key.startsWith('Shp_')) {
        custom[key] = value;
      }
    }
    return custom;
  }
}
