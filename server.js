'use strict';

/**
 * Load Twilio configuration from .env config file - the following environment
 * variables should be set:
 * process.env.TWILIO_ACCOUNT_SID
 * process.env.TWILIO_API_KEY
 * process.env.TWILIO_API_SECRET
 */
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');

const {
    jwt: {AccessToken},
} = require('twilio');

const VideoGrant = AccessToken.VideoGrant;

// Max. period that a Participant is allowed to be in a Room (currently 14400 seconds or 4 hours)
const MAX_ALLOWED_SESSION_DURATION = 14400;

// Create Express webapp.
const app = express();

app.use(cors());

/**
 * Generate an Access Token for a chat application user - it generates a random
 * username for the client requesting a token, and takes a device ID as a query
 * parameter.
 */
app.get('/token', function (request, response) {
    // const { identity } = request.query;

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created.
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
        {ttl: MAX_ALLOWED_SESSION_DURATION}
    );

    // Assign the generated identity to the token.
    token.identity = new Date().toString();

    // Grant the access token Twilio Video capabilities.
    const grant = new VideoGrant({
        room: 'test-room'
    });
    token.addGrant(grant);

    // Serialize the token to a JWT string.
    response.send({identity: 'david', token: token.toJwt()});
});

// Create http server and run it.
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log('Express server running on *:' + port);
});
