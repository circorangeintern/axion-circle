const axios = require('axios');

async function testApi() {
  try {
    console.log('Registering...');
    const regRes = await axios.post('https://cleanreport-api.onrender.com/api/v1/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      displayName: 'TestUser',
      email: 'testagent89@example.com',
      password: 'Password123!'
    });
    console.log('Register success:', regRes.data);

    const token = regRes.data.data.accessToken;
    console.log('Got token:', token);

    console.log('Submitting report...');
    const reportRes = await axios.post('https://cleanreport-api.onrender.com/api/v1/reports', {
      photoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      latitude: 6.5244,
      longitude: 3.3792,
      category: 'ILLEGAL_DUMPING',
      description: 'Sanitation issue report',
      urgency: 'ROUTINE',
      isAnonymous: false
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Report success:', reportRes.data);

  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

testApi();
