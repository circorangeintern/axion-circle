const axios = require('axios');

async function testFetchMy() {
  try {
    // We need to fetch with a valid token, but I don't have the user's token.
    console.log('Cannot fetch /reports/my without a token');
  } catch (error) {
    console.error(error);
  }
}
testFetchMy();
