export default {
  database_url: `postgresql://${process.env.DB_USERNAME || 'postgres'}:${
    process.env.DB_PASSWORD || 'password'
  }@${
    process.env.DB_HOST || 'localhost'
  }:${+process.env.DB_PORT || 5432}/${process.env.DB_DATABASE || 'nest-auth_db'}?schema=public`,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000/api',
  jwt: {
    secret: process.env.JWT_SECRET || 'secretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  //   mailer : {
  //     host: this.PROCESS
  //     port: configService.get<number>('email.port'),
  //     secure: configService.get<boolean>('email.secure'),
  //     auth: {
  //       user: configService.get<string>('email.username'),
  //       pass: configService.get<string>('email.password'),
  //   },
  mailOptions: {
    transportType: process.env.MAIL_OPTIONS_TRANSPORT_TYPE || 'SMTP',
    transportOptions: {
      host:
        process.env.MAIL_OPTIONS_TRANSPORT_OPTIONS_HOST || 'in-v3.mailjet.com',
      port: process.env.MAIL_OPTIONS_TRANSPORT_OPTIONS_PORT || 587,
      secure: process.env.MAIL_OPTIONS_TRANSPORT_OPTIONS_SECURE === 'true',
      auth: {
        user:
          process.env.MAIL_OPTIONS_TRANSPORT_OPTIONS_AUTH_USER ||
          'b3c3e82686e44267560f52ab6b711813',
        pass:
          process.env.MAIL_OPTIONS_TRANSPORT_OPTIONS_AUTH_PASS ||
          '05cac9f4bb750cd35e929e44193d9589',
      },
    },
    from: process.env.MAIL_OPTIONS_FROM || 'liszavodovska@gmail.com',
  },
};
