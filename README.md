# FixNation Netlify Servlerless Functions

This function is running at `https://main--fix-netlify-serverless.netlify.app/` (although it's not working on the deployment right now).

To run the function locally, install Netlify's CLI with `npm install netlify-cli --global`

Then, run the development server with `ntl dev`.

The function is located on the path `/.netlify/functions/instagram-data`, and must be accessed with a query parameter of `username` being the username of the Instagram user you want to get data about. For example,

`http://localhost::8888/.netlify/functions/instagram-data?username=<a-username>`

## Environment Variables

In order to access auth-only Instagram pages, the code uses a session ID, in the form `SESSION_ID=<sessionId>` in a `.env` file in the root directory. Ask me for the session ID I'm using if you need it for testing, and I'll give it to you. Or just get your own by visiting Instagram's website and checking for a `SessionID` cookie.
