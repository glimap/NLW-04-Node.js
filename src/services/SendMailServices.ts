import nodemailer, { Transporter } from 'nodemailer'
import handelbars from 'handlebars'
import fs from 'fs';

class SendMailServices {

    private client: Transporter
    
    constructor() {
        nodemailer.createTestAccount().then(account => {
            const transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass,
                }
            });
            this.client = transporter;
        });
    }

    async execute(to: string, subject: string, variables: object, path: string) {

        const templateFileContent = fs.readFileSync(path).toString("utf-8");

        const mailTemplateParce = handelbars.compile(templateFileContent)

        const html = mailTemplateParce(variables)

        const message = await this.client.sendMail({
            to,
            subject, 
            html,
            from: "NPS <noreplay@nps.com.br>"
        })

        console.log('Message sent: %s', message.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
    }
}

export default new SendMailServices();