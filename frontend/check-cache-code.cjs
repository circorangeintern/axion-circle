const axios = require('axios');

async function checkBundleCode() {
  try {
    const htmlRes = await axios.get('https://cleanreport-frontend.vercel.app');
    const html = htmlRes.data;
    const match = html.match(/assets\/index-[^.]*\.js/);
    if (!match) {
      console.log('No bundle found in HTML');
      return;
    }
    const bundleUrl = 'https://cleanreport-frontend.vercel.app/' + match[0];
    const bundleRes = await axios.get(bundleUrl);
    const bundle = bundleRes.data;
    
    if (bundle.includes('Date.now()') || bundle.includes('t=')) {
      console.log('CACHE BUSTING CODE IS PRESENT IN THE BUNDLE!');
    } else {
      console.log('CACHE BUSTING CODE NOT FOUND! The user is serving an old bundle.');
    }
  } catch (err) {
    console.error(err);
  }
}
checkBundleCode();
