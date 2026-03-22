const generateActivationEmailContent = (name, uniqueId) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Account Activated!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Congratulations! Your account on the Coaching Management System has been successfully verified and activated by the administrator.</p>
        <p>You can now log in using your registered credentials. For your reference, your official unique Student/User ID is:</p>
        <div style="background: #f4f4f4; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333; border-radius: 8px;">
            ${uniqueId}
        </div>
        <p>If you have any questions, please contact the administration.</p>
        <br>
        <p>Best Regards,</p>
        <p><strong>The Coaching Management Team</strong></p>
    </div>
    `;
};

module.exports = { generateActivationEmailContent };
