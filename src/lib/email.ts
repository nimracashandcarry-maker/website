import nodemailer from 'nodemailer'

// SMTP Configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
}

// Create transporter
const transporter = process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport(smtpConfig)
  : null

// Email configuration
export const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'info@nimracashandcarry.com'
export const FROM_EMAIL = process.env.FROM_EMAIL || 'NimraCashAndCarry <nimracashandcarry@gmail.com>'

// Helper to check if email is configured
export function isEmailConfigured(): boolean {
  return !!transporter
}

export type ContactFormData = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export type OrderEmailData = {
  orderId: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  shippingAddress: string
  city?: string
  items: Array<{
    productName: string
    productPrice: number
    quantity: number
  }>
  totalAmount: number
}

export type PasswordResetData = {
  email: string
  resetToken: string
  resetUrl: string
}

// Send contact form notification to business
export async function sendContactFormEmail(data: ContactFormData) {
  if (!transporter) {
    console.warn('Email not configured: SMTP credentials are missing')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: BUSINESS_EMAIL,
      subject: `New Contact Form: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
            <p><strong>Subject:</strong> ${data.subject}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Message:</h3>
            <p style="background: #fff; padding: 15px; border-left: 4px solid #16a34a; margin: 0;">
              ${data.message.replace(/\n/g, '<br>')}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            This email was sent from the NimraCashAndCarry contact form.
          </p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending contact form email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send order confirmation to customer
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!transporter) {
    console.warn('Email not configured: SMTP credentials are missing')
    return { success: false, error: 'Email service not configured' }
  }

  if (!data.customerEmail) {
    return { success: false, error: 'No customer email provided' }
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${item.productPrice.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.productPrice * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmation - #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Thank You for Your Order!</h1>
          </div>

          <div style="padding: 30px;">
            <p>Hi ${data.customerName},</p>
            <p>We've received your order and it's being processed. Here are your order details:</p>

            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Order ID:</strong> #${data.orderId.slice(0, 8).toUpperCase()}</p>
            </div>

            <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                  <th style="padding: 12px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #16a34a; color: white;">
                  <td colspan="3" style="padding: 15px; font-weight: bold;">Total Amount</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold;">€${data.totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <h3 style="color: #374151; margin-top: 30px;">Shipping Address</h3>
            <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">
              ${data.customerName}<br>
              ${data.shippingAddress}<br>
              ${data.city ? `${data.city}<br>` : ''}
              Phone: ${data.customerPhone}
            </p>

            <p style="margin-top: 30px;">If you have any questions about your order, please contact us.</p>

            <p>Best regards,<br><strong>NimraCashAndCarry Team</strong></p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">NimraCashAndCarry - Premium Catering & Food Packaging Supplies</p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send new order notification to business
export async function sendNewOrderNotificationEmail(data: OrderEmailData) {
  if (!transporter) {
    console.warn('Email not configured: SMTP credentials are missing')
    return { success: false, error: 'Email service not configured' }
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.productPrice * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: BUSINESS_EMAIL,
      subject: `New Order Received - #${data.orderId.slice(0, 8).toUpperCase()} - €${data.totalAmount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; color: white; padding: 20px;">
            <h2 style="margin: 0;">New Order Received!</h2>
          </div>

          <div style="padding: 20px;">
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong>Order ID:</strong> #${data.orderId.slice(0, 8).toUpperCase()}<br>
              <strong>Total:</strong> €${data.totalAmount.toLocaleString()}
            </div>

            <h3 style="color: #374151;">Customer Details</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${data.customerName}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>
              ${data.customerEmail ? `<p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>` : ''}
              <p style="margin: 5px 0;"><strong>Address:</strong> ${data.shippingAddress}${data.city ? `, ${data.city}` : ''}</p>
            </div>

            <h3 style="color: #374151; margin-top: 20px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background: #16a34a; color: white; padding: 15px; margin-top: 20px; border-radius: 8px; text-align: center;">
              <strong style="font-size: 18px;">Total: €${data.totalAmount.toLocaleString()}</strong>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated notification from NimraCashAndCarry.
          </p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending new order notification email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send password reset email
export async function sendPasswordResetEmail(data: PasswordResetData) {
  if (!transporter) {
    console.warn('Email not configured: SMTP credentials are missing')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Reset Your Password - NimraCashAndCarry',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>

          <div style="padding: 30px;">
            <p>Hello,</p>
            <p>We received a request to reset your password for your NimraCashAndCarry account.</p>

            <p>Click the button below to reset your password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}"
                 style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 1 hour for security reasons.
            </p>

            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">NimraCashAndCarry - Premium Catering & Food Packaging Supplies</p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
