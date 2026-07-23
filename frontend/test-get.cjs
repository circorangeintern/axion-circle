const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('https://cleanreport-api.onrender.com/api/v1/reports');
    console.log('Got reports:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.message);
  }
}
testApi();
