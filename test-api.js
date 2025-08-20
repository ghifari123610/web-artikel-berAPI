const axios = require('axios');

async function testAPI() {
    try {
        const response = await axios.get('https://santri.pondokinformatika.id/api/get/news');
        console.log('API Response Structure:');
        console.log('Keys:', Object.keys(response.data));
        console.log('First article keys:', response.data.data && response.data.data.length > 0 ? Object.keys(response.data.data[0]) : 'No data');
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('\nFirst article sample:');
            console.log(JSON.stringify(response.data.data[0], null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();
