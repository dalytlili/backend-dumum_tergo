import nodemailer from 'nodemailer'; // Import nodemailer correctement

// Création d'un transporteur avec votre configuration SMTP
const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    auth: {
        user: 'mohamedalitlili8@gmail.com',
        pass: 'tlri wivu okrg bwin'
    },
    debug: true, // Activer les journaux de débogage (optionnel)
});

// Définition d'une fonction asynchrone pour envoyer des emails
const sendMail = async (email, subject, content) => {
    try {
        const mailOptions = {
            from: 'mohamedalitlili8@gmail.com',
            to: email,
            subject: subject,
            html: content
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé :', info.messageId);
        return { success: true, msg: 'Email envoyé avec succès' }; // Retourne le message de succès
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        throw error; // Lancer l'erreur pour être capturée par l'appelant
    }
};

export { sendMail }; // Exporter la fonction sendMail
