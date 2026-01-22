import { Resend } from 'resend'

// Only initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// UPDATE THIS WITH YOUR BUSINESS EMAIL
export const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'info@nimrashop.com'
export const FROM_EMAIL = process.env.FROM_EMAIL || 'Nimra Shop <onboarding@resend.dev>'

// Helper to check if email is configured
export function isEmailConfigured(): boolean {
  return !!resend
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

// Send contact form notification to business
export async function sendContactFormEmail(data: ContactFormData) {
  if (!resend) {
    console.warn('Email not configured: RESEND_API_KEY is missing')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { error } = await resend.emails.send({
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
            This email was sent from the Nimra Shop contact form.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send contact form email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending contact form email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send order confirmation to customer
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend) {
    console.warn('Email not configured: RESEND_API_KEY is missing')
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
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs ${item.productPrice.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs ${(item.productPrice * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  try {
    const { error } = await resend.emails.send({
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
                  <td style="padding: 15px; text-align: right; font-weight: bold;">Rs ${data.totalAmount.toLocaleString()}</td>
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

            <p>Best regards,<br><strong>Nimra Shop Team</strong></p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Nimra Shop - Premium Catering & Food Packaging Supplies</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send order confirmation email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send new order notification to business
export async function sendNewOrderNotificationEmail(data: OrderEmailData) {
  if (!resend) {
    console.warn('Email not configured: RESEND_API_KEY is missing')
    return { success: false, error: 'Email service not configured' }
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs ${(item.productPrice * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: BUSINESS_EMAIL,
      subject: `New Order Received - #${data.orderId.slice(0, 8).toUpperCase()} - Rs ${data.totalAmount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; color: white; padding: 20px;">
            <h2 style="margin: 0;">New Order Received!</h2>
          </div>

          <div style="padding: 20px;">
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <strong>Order ID:</strong> #${data.orderId.slice(0, 8).toUpperCase()}<br>
              <strong>Total:</strong> Rs ${data.totalAmount.toLocaleString()}
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
              <strong style="font-size: 18px;">Total: Rs ${data.totalAmount.toLocaleString()}</strong>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated notification from Nimra Shop.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Failed to send new order notification email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending new order notification email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
