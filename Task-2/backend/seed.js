const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// ── Models (inline to keep seeder self-contained) ─────────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  department: String,
  position: String,
  salary: Number,
  joinDate: Date,
  status: { type: String, default: 'Active' },
  address: String,
  createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

// ── Mock Data ─────────────────────────────────────────────────────────────────

const mockEmployees = [
  { firstName: 'Arjun',     lastName: 'Sharma',    email: 'arjun.sharma@company.com',    phone: '9876543210', department: 'Engineering', position: 'Senior Software Engineer', salary: 95000, joinDate: '2021-03-15', status: 'Active',    address: 'Mumbai, Maharashtra' },
  { firstName: 'Priya',     lastName: 'Patel',     email: 'priya.patel@company.com',     phone: '9123456789', department: 'HR',          position: 'HR Manager',              salary: 72000, joinDate: '2020-07-01', status: 'Active',    address: 'Ahmedabad, Gujarat' },
  { firstName: 'Rohan',     lastName: 'Mehta',     email: 'rohan.mehta@company.com',     phone: '9988776655', department: 'Finance',     position: 'Financial Analyst',       salary: 68000, joinDate: '2022-01-10', status: 'Active',    address: 'Pune, Maharashtra' },
  { firstName: 'Sneha',     lastName: 'Reddy',     email: 'sneha.reddy@company.com',     phone: '8877665544', department: 'Marketing',   position: 'Marketing Lead',          salary: 75000, joinDate: '2021-11-20', status: 'Active',    address: 'Hyderabad, Telangana' },
  { firstName: 'Vikram',    lastName: 'Singh',     email: 'vikram.singh@company.com',    phone: '9765432198', department: 'Sales',       position: 'Sales Manager',           salary: 82000, joinDate: '2020-04-05', status: 'Active',    address: 'Delhi, India' },
  { firstName: 'Ananya',    lastName: 'Gupta',     email: 'ananya.gupta@company.com',    phone: '9654321876', department: 'Engineering', position: 'Frontend Developer',      salary: 78000, joinDate: '2022-06-15', status: 'Active',    address: 'Bengaluru, Karnataka' },
  { firstName: 'Karan',     lastName: 'Joshi',     email: 'karan.joshi@company.com',     phone: '9543218765', department: 'Design',      position: 'UI/UX Designer',          salary: 70000, joinDate: '2023-02-01', status: 'Active',    address: 'Kolkata, West Bengal' },
  { firstName: 'Nisha',     lastName: 'Kumar',     email: 'nisha.kumar@company.com',     phone: '9432187654', department: 'Operations',  position: 'Operations Manager',      salary: 88000, joinDate: '2019-09-12', status: 'Active',    address: 'Chennai, Tamil Nadu' },
  { firstName: 'Aditya',    lastName: 'Verma',     email: 'aditya.verma@company.com',    phone: '9321876543', department: 'Engineering', position: 'Backend Developer',       salary: 85000, joinDate: '2021-08-22', status: 'Active',    address: 'Jaipur, Rajasthan' },
  { firstName: 'Pooja',     lastName: 'Nair',      email: 'pooja.nair@company.com',      phone: '9210765432', department: 'Legal',       position: 'Legal Counsel',           salary: 92000, joinDate: '2020-12-01', status: 'Active',    address: 'Kochi, Kerala' },
  { firstName: 'Rahul',     lastName: 'Desai',     email: 'rahul.desai@company.com',     phone: '9109654321', department: 'Finance',     position: 'Accountant',              salary: 55000, joinDate: '2023-05-10', status: 'Active',    address: 'Surat, Gujarat' },
  { firstName: 'Kavya',     lastName: 'Menon',     email: 'kavya.menon@company.com',     phone: '8998877665', department: 'Marketing',   position: 'Content Strategist',      salary: 60000, joinDate: '2022-09-18', status: 'Inactive',  address: 'Thiruvananthapuram, Kerala' },
  { firstName: 'Sameer',    lastName: 'Khan',      email: 'sameer.khan@company.com',     phone: '8887766554', department: 'Sales',       position: 'Sales Executive',         salary: 52000, joinDate: '2023-01-25', status: 'Active',    address: 'Lucknow, Uttar Pradesh' },
  { firstName: 'Divya',     lastName: 'Iyer',      email: 'divya.iyer@company.com',      phone: '8776655443', department: 'HR',          position: 'Recruiter',               salary: 48000, joinDate: '2023-08-07', status: 'Active',    address: 'Coimbatore, Tamil Nadu' },
  { firstName: 'Manish',    lastName: 'Agarwal',   email: 'manish.agarwal@company.com',  phone: '8665544332', department: 'Engineering', position: 'DevOps Engineer',         salary: 90000, joinDate: '2021-05-30', status: 'Active',    address: 'Noida, Uttar Pradesh' },
  { firstName: 'Ritu',      lastName: 'Bose',      email: 'ritu.bose@company.com',       phone: '8554433221', department: 'Design',      position: 'Graphic Designer',        salary: 58000, joinDate: '2022-11-14', status: 'On Leave',  address: 'Bhubaneswar, Odisha' },
  { firstName: 'Tushar',    lastName: 'Saxena',    email: 'tushar.saxena@company.com',   phone: '8443322110', department: 'Operations',  position: 'Supply Chain Analyst',    salary: 65000, joinDate: '2020-10-08', status: 'Active',    address: 'Nagpur, Maharashtra' },
  { firstName: 'Ishaan',    lastName: 'Chopra',    email: 'ishaan.chopra@company.com',   phone: '7998877441', department: 'Engineering', position: 'QA Engineer',             salary: 67000, joinDate: '2022-04-11', status: 'Active',    address: 'Chandigarh, Punjab' },
  { firstName: 'Meera',     lastName: 'Pillai',    email: 'meera.pillai@company.com',    phone: '7887766330', department: 'Finance',     position: 'Finance Manager',         salary: 98000, joinDate: '2018-06-20', status: 'Active',    address: 'Thiruvananthapuram, Kerala' },
  { firstName: 'Gaurav',    lastName: 'Tiwari',    email: 'gaurav.tiwari@company.com',   phone: '7776655219', department: 'Legal',       position: 'Compliance Officer',      salary: 76000, joinDate: '2021-02-28', status: 'Inactive',  address: 'Varanasi, Uttar Pradesh' },
];

// ── Seeder ────────────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Employee.deleteMany({});
    console.log('🗑️  Cleared existing employees');

    // Create or find the demo admin
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      const hashed = await bcrypt.hash('admin123', 12);
      admin = await User.create({ name: 'Admin', email: 'admin@gmail.com', password: hashed });
      console.log('👤 Created demo admin: admin@gmail.com / admin123');
    } else {
      console.log('👤 Using existing admin:', admin.email);
    }

    // Insert employees with auto-generated IDs
    const employees = mockEmployees.map((emp, i) => ({
      ...emp,
      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      joinDate: new Date(emp.joinDate),
      createdBy: admin._id,
    }));

    const inserted = await Employee.insertMany(employees);
    console.log(`\n🎉 Successfully seeded ${inserted.length} employees!\n`);

    // Summary
    const depts = {};
    employees.forEach(e => { depts[e.department] = (depts[e.department] || 0) + 1; });
    console.log('📊 Department breakdown:');
    Object.entries(depts).forEach(([d, c]) => console.log(`   ${d.padEnd(15)} ${c} employees`));
    console.log('\n🔑 Login credentials:');
    console.log('   Email:    admin@gmail.com');
    console.log('   Password: admin123\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
