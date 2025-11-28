const AWS = require('aws-sdk');

// Configure the shared AWS SDK instance once during boot
AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:7b6f9245-55c1-4578-84cc-2c8f6f95982c',
    }),
});

module.exports = AWS;
