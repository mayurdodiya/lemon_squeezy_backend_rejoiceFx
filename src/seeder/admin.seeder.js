const { AdminModel } = require('../models');
const { adminData } = require('./seedData');

/**
 * Admin seeder.
 */
module.exports = adminSeeder = async () => {
  try {
    for (let admin of adminData) {
      const adminExist = await AdminModel.findOne({ email: admin.email }); // Get Admin by email.

      if (!adminExist) {
        await AdminModel.create({
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          password: admin.password,
        }); // If admin doesn't exists, create admin.
      }
    }

    console.log('✅ Admin seeder run successfully...');
  } catch (error) {
    console.log('❌ Error from admin seeder :', error);
  }
};
