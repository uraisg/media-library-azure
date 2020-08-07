# Authentication Method of the _Internet_ Media Upload Portal

The media upload portal is integrated with AD B2C and will follow its sign-up/sign-in policy.

Today, the AD B2C that we are using authenticates using E-mail OTP.

This is implemented using SendGrid by following this [documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-email-sendgrid) using the _LocalAccounts_ [B2C starter pack](git clone https://github.com/Azure-Samples/active-directory-b2c-custom-policy-starterpack).



# Authentication Method of the _Intranet_ Media Portal

No authentication method is done for the intranet portal. This is to give implementers the flexibility to change and use their own preferred method such as:

- Azure AD
- Azure AD B2C
- LDAP
- etc.