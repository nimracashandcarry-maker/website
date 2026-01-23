import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Create admin client with service role key (inside function to avoid build-time initialization)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate password reset link using Supabase Admin
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${appUrl}/reset-password`,
      },
    })

    if (error) {
      console.error('Supabase error generating reset link:', error)
      // Don't reveal if user exists or not for security
      return NextResponse.json({ success: true })
    }

    if (data?.properties?.action_link) {
      // Send custom email with the reset link
      const result = await sendPasswordResetEmail({
        email: email,
        resetToken: data.properties.hashed_token || '',
        resetUrl: data.properties.action_link,
      })

      if (!result.success) {
        console.error('Failed to send password reset email:', result.error)
        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
