require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Settings = require('../models/Settings');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  const ownerEmail = process.env.SEED_OWNER_EMAIL || 'owner@shreebalajipureveg.com';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'ChangeMe123!';

  const existingOwner = await User.findOne({ role: 'owner' });
  if (!existingOwner) {
    await User.create({
      name: 'Restaurant Owner',
      email: ownerEmail,
      password: ownerPassword,
      role: 'owner',
    });
    console.log(`Owner account created: ${ownerEmail} / ${ownerPassword} (CHANGE THIS PASSWORD IMMEDIATELY)`);
  } else {
    console.log('Owner account already exists, skipping.');
  }

  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany([
      { name: 'Paneer Butter Masala', category: 'North Indian', price: 260, description: 'Cottage cheese in a rich tomato-butter gravy', isTodaysSpecial: true },
      { name: 'Dal Makhani', category: 'North Indian', price: 220, description: 'Slow-cooked black lentils finished with cream' },
      { name: 'Masala Dosa', category: 'South Indian', price: 140, description: 'Crisp rice crepe with spiced potato filling' },
      { name: 'Idli Sambar (4 pcs)', category: 'South Indian', price: 110 },
      { name: 'Veg Manchurian', category: 'Chinese', price: 210, spiceLevel: 'hot' },
      { name: 'Veg Hakka Noodles', category: 'Chinese', price: 190 },
      { name: 'Amritsari Chole', category: 'Punjabi', price: 210 },
      { name: 'Sarson Ka Saag + Makki Roti', category: 'Punjabi', price: 240 },
      { name: 'Samosa (2 pcs)', category: 'Snacks', price: 60 },
      { name: 'Paneer Tikka', category: 'Snacks', price: 230 },
      { name: 'Masala Chaas', category: 'Beverages', price: 50 },
      { name: 'Fresh Lime Soda', category: 'Beverages', price: 70 },
      { name: 'Shree Balaji Special Thali', category: 'Thali', price: 320, description: 'Unlimited thali with seasonal preparations', isTodaysSpecial: true },
    ]);
    console.log('Sample menu items created.');
  } else {
    console.log('Menu already has items, skipping.');
  }

  const settingsExists = await Settings.findOne();
  if (!settingsExists) {
    await Settings.create({
      openingHours: {
        monday: '11:00-15:30,19:00-23:00',
        tuesday: '11:00-15:30,19:00-23:00',
        wednesday: '11:00-15:30,19:00-23:00',
        thursday: '11:00-15:30,19:00-23:00',
        friday: '11:00-15:30,19:00-23:00',
        saturday: '11:00-16:00,19:00-23:30',
        sunday: '11:00-16:00,19:00-23:30',
      },
      slotCapacity: 8,
      slotIntervalMinutes: 30,
      isAcceptingBookings: true,
    });
    console.log('Default settings created.');
  }

  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
