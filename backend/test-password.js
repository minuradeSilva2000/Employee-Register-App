const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testPassword() {
  try {
    console.log('🧪 Testing password...');
    
    // Find the admin user
    const user = await User.findOne({ email: 'admin@example.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('📝 Password length:', user.password.length);
    
    // Test password comparison
    const testPassword = 'Admin@123';
    console.log('🔐 Testing password:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('✅ Password valid:', isValid);
    
    if (!isValid) {
      // Try to hash the password and compare
      const hashedTest = await bcrypt.hash(testPassword, 12);
      console.log('🔐 Fresh hash length:', hashedTest.length);
      console.log('📝 Original hash:', user.password.substring(0, 20) + '...');
      console.log('📝 Fresh hash:', hashedTest.substring(0, 20) + '...');
      
      const isValidFresh = await bcrypt.compare(testPassword, hashedTest);
      console.log('✅ Fresh hash valid:', isValidFresh);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPassword();
