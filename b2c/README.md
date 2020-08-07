# Authentication Method of the _Internet_ Media Upload Portal

The media upload portal is integrated with AD B2C and will follow its sign-up/sign-in policy.

Today, the AD B2C that we are using authenticates using E-mail OTP.
This is implemented using the [this sample](https://github.com/azure-ad-b2c/samples/tree/master/policies/passwordless-email), but with the following changes
- Changed HTML templates from ~/tenant/default to ~/tenant/templates/AzureBlue
- Removed Facebook authentication which was in the sample.

## Register AD B2C Applications
Go to [this documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-get-started#register-identity-experience-framework-applications) and follow the ff. sections

1. Prerequisites
2. Add signing and encryption keys
3. Register Identity Experience Framework applications

## Policy File Changes
- Replace all instances of `yourtenant` to your AD B2C tenant. 
- Replace `yourProxyIdentityExperienceFrameworkAppId` to the Client/App ID of your ProxyIdentityExperienceFramework B2C App Registration

## Upload the Policies

Finally, upload the policy files according to the order instructed [here](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-get-started#upload-the-policies).

Test the policy by following [this](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-get-started#test-the-custom-policy).

# Authentication Method of the _Intranet_ Media Portal

No authentication method is done for the intranet portal. This is to give implementers the flexibility to change and use their own preferred method such as:

- Azure AD
- Azure AD B2C
- LDAP
- etc.