import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Create reusable transporter
let transporter: Transporter | null = null;

const createTransporter = (): Transporter => {
    if (transporter) {
        return transporter;
    }

    // Configure the email service
    // For development, you can use services like Gmail, SendGrid, or Ethereal (test service)
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    return transporter;
};

interface RewardRedemptionEmailData {
    userEmail: string;
    userName: string;
    rewardTitle: string;
    rewardCost: number;
    previousBalance: number;
    newBalance: number;
}

export const sendRewardRedemptionEmail = async (data: RewardRedemptionEmailData): Promise<boolean> => {
    try {
        // Skip sending email if email configuration is not set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('Email not configured, skipping email send');
            return false;
        }
        console.log('Preparing to send redemption email to:', data.userEmail);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"HousrCash" <${process.env.EMAIL_USER}>`,
            to: data.userEmail,
            subject: '🎉 Reward Redeemed Successfully!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .reward-box {
                            background: white;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 8px;
                            border-left: 4px solid #667eea;
                        }
                        .reward-title {
                            font-size: 24px;
                            font-weight: bold;
                            color: #667eea;
                            margin-bottom: 10px;
                        }
                        .balance-info {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 20px;
                            padding: 15px;
                            background: #e8f0fe;
                            border-radius: 8px;
                        }
                        .balance-item {
                            text-align: center;
                        }
                        .balance-label {
                            font-size: 12px;
                            color: #666;
                            text-transform: uppercase;
                        }
                        .balance-value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #333;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            color: #666;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Congratulations!</h1>
                            <p>You've successfully redeemed a reward</p>
                        </div>
                        <div class="content">
                            <p>Hi ${data.userName},</p>
                            <p>Great news! Your reward redemption was successful.</p>
                            
                            <div class="reward-box">
                                <div class="reward-title">${data.rewardTitle}</div>
                                <p style="color: #666; margin: 0;">Cost: <strong>${data.rewardCost} points</strong></p>
                            </div>

                            <div class="balance-info">
                                <div class="balance-item">
                                    <div class="balance-label">Previous Balance</div>
                                    <div class="balance-value">${data.previousBalance}</div>
                                </div>
                                <div class="balance-item">
                                    <div class="balance-label">Points Used</div>
                                    <div class="balance-value" style="color: #d32f2f;">-${data.rewardCost}</div>
                                </div>
                                <div class="balance-item">
                                    <div class="balance-label">New Balance</div>
                                    <div class="balance-value" style="color: #388e3c;">${data.newBalance}</div>
                                </div>
                            </div>

                            <p style="margin-top: 30px;">Keep earning more points by making payments and unlock even more rewards!</p>
                            
                            <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
                                <p style="color: #666; margin-bottom: 15px;">Scan to redeem!</p>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                                     alt="QR Code" 
                                     style="width: 150px; height: 150px; border: 2px solid #667eea; border-radius: 8px;" />
                            </div>
                        </div>
                        <div class="footer">
                            <p>Thank you for using HousrCash!</p>
                            <p style="font-size: 12px; color: #999;">
                                This is an automated message, please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Hi ${data.userName},

Congratulations! You've successfully redeemed a reward.

Reward: ${data.rewardTitle}
Cost: ${data.rewardCost} points

Balance Summary:
- Previous Balance: ${data.previousBalance} points
- Points Used: ${data.rewardCost} points
- New Balance: ${data.newBalance} points

Keep earning more points by making payments and unlock even more rewards!

Thank you for using HousrCash!
            `.trim(),
        };

        await transporter.sendMail(mailOptions);
        console.log(`Redemption email sent to ${data.userEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending redemption email:', error);
        return false;
    }
};
