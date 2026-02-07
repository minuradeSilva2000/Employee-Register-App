const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing API...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin@123'
    });
    console.log('✅ Login successful:', loginResponse.data.success);
    
    // Test dashboard with token
    const dashboardResponse = await axios.get('http://localhost:5000/api/dashboard/overview', {
      headers: {
        Authorization: `Bearer ${loginResponse.data.data.accessToken}`
      }
    });
    console.log('✅ Dashboard data:', dashboardResponse.data.success);
    
    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
