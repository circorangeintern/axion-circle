const axios = require('axios');

async function checkBundle() {
  try {
    const htmlRes = await axios.get('https://cleanreport-frontend.vercel.app');
    const html = htmlRes.data;
    const match = html.match(/assets\/index-[^.]*\.js/);
    if (!match) {
      console.log('No bundle found in HTML');
      return;
    }
    const bundleUrl = 'https://cleanreport-frontend.vercel.app/' + match[0];
    console.log('Fetching', bundleUrl);
    const bundleRes = await axios.get(bundleUrl);
    const bundle = bundleRes.data;
    
    if (bundle.includes('http://localhost:8080/api/v1')) {
      console.log('LOCALHOST URL FOUND IN BUNDLE!');
    } else {
      console.log('Localhost URL not found in bundle.');
      if (bundle.includes('https://cleanreport-api.onrender.com/api/v1')) {
         console.log('RENDER URL FOUND IN BUNDLE!');
      }
    }
  } catch (err) {
    console.error(err);
  }
}
checkBundle();
