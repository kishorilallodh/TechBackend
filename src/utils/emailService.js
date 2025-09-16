import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Naya function add karein
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
    // Frontend par reset page ka URL
const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"TechDigi Support" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Password Reset Request – TechDigi",
        html: `
            <p>Dear User,</p>
            <p>We received a request to reset your password for your <strong>TechDigi</strong> account.</p>
            <p>To proceed, please click the link below:</p>
            <p><a href="${resetURL}" style="color: #1a73e8; text-decoration: none;">Reset My Password</a></p>
            <p><em>Note:</em> This link will expire in <strong>10 minutes</strong> for your security.</p>
            <p>If you did not make this request, please ignore this email. Your account will remain secure.</p>
            <br />
            <p>Best Regards,</p>
            <p><strong>TechDigi Support Team</strong></p>
        `,
    };

    await transporter.sendMail(mailOptions);
};




// ✅ Applicant ko confirmation email
export const sendApplicationConfirmation = async (applicantEmail, applicantName, jobTitle) => {
    const mailOptions = {
        from: `"TechDigi Software Pvt Ltd." <${process.env.EMAIL_USER}>`,
        to: applicantEmail,
        subject: `Application Received – ${jobTitle}`,
        html: `
            <p>Dear ${applicantName},</p>
            <p>Thank you for applying for the position of <strong>${jobTitle}</strong> at <strong>TechDigi Software Pvt Ltd.</strong></p>
            <p>Your application has been received successfully. Our recruitment team will carefully review your profile, and if shortlisted, we will reach out to you for the next steps.</p>
            <p>We truly appreciate your interest in becoming part of our team.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>HR Team</strong><br/>TechDigi Software Pvt Ltd.</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${applicantEmail}`);
    } catch (error) {
        console.error(`Failed to send confirmation email to ${applicantEmail}:`, error);
    }
};

// ✅ Admin ko notification email
export const sendAdminNotification = async (applicationData) => {
    const { name, email, position } = applicationData;
    const adminEmail = process.env.ADMIN_EMAIL;

    const mailOptions = {
        from: `"Recruitment Portal – TechDigi Software Pvt Ltd." <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Application Received – ${position}`,
        html: `
            <p>Hello Admin,</p>
            <p>A new job application has been submitted on the portal. Below are the applicant details:</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Applied For:</strong> ${position}</li>
            </ul>
            <p>Please log in to the admin dashboard to review the complete application.</p>
            <br/>
            <p>Regards,<br/><strong>Recruitment System</strong><br/>TechDigi Software Pvt Ltd.</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Admin notification sent for applicant ${applicationData.name}`);
    } catch (error) {
        console.error("Failed to send admin notification email:", error);
    }
};

// ✅ Applicant ko status update email
export const sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, newStatus) => {
    let statusMessage = '';

    if (newStatus === 'Shortlisted') {
        statusMessage = `
            <p>We are pleased to inform you that your application for the <strong>${jobTitle}</strong> role has been <strong>shortlisted</strong>.</p>
            <p>Our team will be reaching out to you shortly with the next steps in the recruitment process.</p>
        `;
    } else if (newStatus === 'Rejected') {
        statusMessage = `
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> role at TechDigi Software Pvt Ltd.</p>
            <p>After careful review of your profile, we regret to inform you that we will not be moving forward with your application at this time.</p>
            <p>We truly appreciate the time and effort you put into applying and wish you the very best in your future endeavors.</p>
        `;
    } else {
        return;
    }

    const mailOptions = {
        from: `"TechDigi Software Pvt Ltd." <${process.env.EMAIL_USER}>`,
        to: applicantEmail,
        subject: `Application Update – ${jobTitle}`,
        html: `
            <p>Dear ${applicantName},</p>
            ${statusMessage}
            <br/>
            <p>Best Regards,</p>
            <p><strong>HR Team</strong><br/>TechDigi Software Pvt Ltd.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${applicantEmail}`);
    } catch (error) {
        console.error(`Failed to send status update email to ${applicantEmail}:`, error);
    }
};




// 1. User ko "Thank you for contacting us" email
export const sendQueryConfirmation = async (userEmail, userName) => {
    const mailOptions = {
        from: `"TechDigi Software Pvt Ltd." <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `We've Received Your Query`,
        html: `
            <p>Dear ${userName},</p>
            <p>Thank you for reaching out to us. We have successfully received your query.</p>
            <p>Our team will review your message and get back to you as soon as possible.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Support Team</strong><br/>TechDigi Software Pvt Ltd.</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Query confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Failed to send query confirmation email to ${userEmail}:`, error);
    }
};

// 2. Admin ko nayi query ka notification
export const sendQueryAdminNotification = async (queryData) => {
    const { name, email, message } = queryData;
    const adminEmail = process.env.ADMIN_EMAIL;

    const mailOptions = {
        from: `"Contact Form – TechDigi" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Contact Query Received from ${name}`,
        html: `
            <p>Hello Admin,</p>
            <p>A new query has been submitted through the contact form.</p>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Message:</strong><br/>${message}</li>
            </ul>
            <p>Please log in to the admin dashboard to view and reply to this query.</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Admin notification sent for query from ${name}`);
    } catch (error) {
        console.error("Failed to send query admin notification:", error);
    }
};

// 3. Admin dwara user ko reply bhejne ke liye
export const sendAdminReplyToQuery = async (userEmail, userName, originalMessage, adminReply) => {
    const mailOptions = {
        from: `"Support – TechDigi Software Pvt Ltd." <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Re: Your Recent Query`,
        html: `
            <p>Dear ${userName},</p>
            <p>Thank you for contacting us. This is in response to your recent query:</p>
            <blockquote style="border-left: 2px solid #ccc; padding-left: 1rem; margin-left: 1rem; color: #555;">
                <i>${originalMessage}</i>
            </blockquote>
            <p><strong>Our response:</strong></p>
            <p>${adminReply}</p>
            <br/>
            <p>If you have any further questions, please feel free to reply to this email.</p>
            <p>Best Regards,</p>
            <p><strong>Support Team</strong><br/>TechDigi Software Pvt Ltd.</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Admin reply sent to ${userEmail}`);
    } catch (error) {
        console.error(`Failed to send admin reply to ${userEmail}:`, error);
    }
};
