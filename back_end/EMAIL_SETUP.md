# Email Configuration for HousrCash

This document explains how to set up email notifications for reward redemptions.

## Overview

When users redeem rewards, they receive a confirmation email with:

- Reward details (title and cost)
- Balance summary (previous, used, new balance)
- Styled HTML email with branding

## Setup Instructions

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account

   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**

   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "HousrCash" and generate
   - Copy the 16-character password

3. **Update .env file**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

### Option 2: Other Email Providers

#### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

#### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your_password
```

#### Custom SMTP

```env
EMAIL_HOST=your.smtp.host
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_username
EMAIL_PASSWORD=your_password
```

### Option 3: Disable Email (Development)

Simply leave `EMAIL_USER` and `EMAIL_PASSWORD` empty in your `.env` file:

```env
EMAIL_USER=
EMAIL_PASSWORD=
```

The application will log a message and continue without sending emails.

## Testing

### Using Ethereal (Fake SMTP Service)

For testing without sending real emails:

1. Visit https://ethereal.email/
2. Click "Create Ethereal Account"
3. Copy the SMTP credentials
4. Update your `.env`:
   ```env
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your.ethereal@ethereal.email
   EMAIL_PASSWORD=your_ethereal_password
   ```

All emails will be captured at https://ethereal.email/messages

## Email Template

The email includes:

- **Header**: Gradient banner with congratulations message
- **Reward Box**: Highlighted reward title and cost
- **Balance Info**: Three-column layout showing previous/used/new balance
- **Footer**: Branding and disclaimer

Both HTML and plain text versions are sent for compatibility.

## Error Handling

- Emails are sent asynchronously (non-blocking)
- If email fails, the redemption still succeeds
- Errors are logged to console but don't affect user experience
- Missing email configuration is handled gracefully

## Security Notes

⚠️ **Important:**

- Never commit your `.env` file to git
- Use app-specific passwords, not your main password
- Consider using environment-specific secrets in production
- For production, use dedicated email services (SendGrid, AWS SES, etc.)

## Troubleshooting

### "Invalid login" error

- Check that 2FA is enabled (for Gmail)
- Verify you're using an app password, not your regular password
- Ensure EMAIL_USER and EMAIL_PASSWORD are correct

### Emails not received

- Check spam/junk folder
- Verify EMAIL_USER contains a valid email address
- Test SMTP connection with a tool like `telnet smtp.gmail.com 587`

### "Connection timeout"

- Check firewall settings
- Verify EMAIL_PORT is correct (usually 587 or 465)
- Try EMAIL_SECURE=true with port 465

## Production Recommendations

For production environments, consider:

- **AWS SES**: Low cost, high deliverability
- **SendGrid**: Feature-rich with analytics
- **Mailgun**: Developer-friendly API
- **Postmark**: Focus on transactional emails

These services provide better deliverability, analytics, and compliance features.
