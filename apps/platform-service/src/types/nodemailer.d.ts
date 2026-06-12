declare module 'nodemailer' {
  export interface SendMailOptions {
    from: string
    to: string
    subject: string
    html: string
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<void>
  }

  export function createTransport(options: Record<string, unknown>): Transporter;
}
