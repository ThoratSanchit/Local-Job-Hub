import dotenv from 'dotenv';
dotenv.config();

import { v4 as uuidv4 } from 'uuid';
import { sequelize, checkDatabaseConnection } from './config/instance';
import { setupAssociations } from './models/associations';
import User from './models/user.model';
import Job from './models/job.model';
import { JobStatus } from './constants/job.constants';
import { Gender } from './enums/gender.enum';
import { AvailabilityStatus } from './enums/availability.status.enum';

type PaymentType = 'Per Worker' | 'Total Budget' | 'Hourly';
type WorkDuration = '2 Hours' | 'Half Day' | 'Full Day' | 'Multiple Days';
// ─── Locations ────────────────────────────────────────────────────────────────

const locations = [
  { city: 'Pune',   area: 'Kothrud',   full_address: 'Near Vanaz Metro, Kothrud, Pune' },
  { city: 'Pune',   area: 'Wakad',     full_address: 'Wakad Chowk, Wakad, Pune' },
  { city: 'Pune',   area: 'Hadapsar',  full_address: 'Magarpatta Road, Hadapsar, Pune' },
  { city: 'Mumbai', area: 'Andheri',   full_address: 'Andheri West, Mumbai' },
  { city: 'Mumbai', area: 'Borivali',  full_address: 'Borivali East, Mumbai' },
];

// ─── Seed Users ───────────────────────────────────────────────────────────────

const seedUsers = [
  { id: uuidv4(), name: 'Rahul Patil',   mobile_number: '9000000001', gender: Gender.MALE,   city: 'Pune',   area: 'Kothrud'  },
  { id: uuidv4(), name: 'Priya Sharma',  mobile_number: '9000000002', gender: Gender.FEMALE, city: 'Pune',   area: 'Wakad'    },
  { id: uuidv4(), name: 'Amit Jadhav',   mobile_number: '9000000003', gender: Gender.MALE,   city: 'Pune',   area: 'Hadapsar' },
  { id: uuidv4(), name: 'Sneha More',    mobile_number: '9000000004', gender: Gender.FEMALE, city: 'Mumbai', area: 'Andheri'  },
  { id: uuidv4(), name: 'Vikram Desai',  mobile_number: '9000000005', gender: Gender.MALE,   city: 'Mumbai', area: 'Borivali' },
];

// ─── Job Templates ────────────────────────────────────────────────────────────

interface JobTemplate {
  title: string;
  description: string;
  category: string;
  price: number;
  payment_type: PaymentType;
  workers_required: number;
  work_duration: WorkDuration;
  preferred_time: string;
  urgent: boolean;
  heavy_lifting: boolean;
  vehicle_required: boolean;
  tools_provided: boolean;
  night_work: boolean;
}

const jobTemplates: JobTemplate[] = [
  // ── Plumbing ──
  {
    title: 'Fix leaking tap in kitchen',
    description: 'Kitchen tap is dripping since 2 days. Need someone to fix it quickly.',
    category: 'Plumbing', price: 300, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Bathroom pipe leakage repair',
    description: 'Water is leaking from the pipe under the bathroom sink. Need urgent repair.',
    category: 'Plumbing', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Install new water tap',
    description: 'Old tap needs to be replaced with a new one. I have the new tap ready.',
    category: 'Plumbing', price: 250, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Afternoon',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Toilet flush not working',
    description: 'Flush mechanism is broken. Need a plumber to fix or replace it.',
    category: 'Plumbing', price: 350, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Overhead water tank cleaning',
    description: 'Overhead water tank needs cleaning. It has not been cleaned in 6 months.',
    category: 'Plumbing', price: 600, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },

  // ── Electrical ──
  {
    title: 'Fix electric switch not working',
    description: 'One switch in the hall is not working. Need an electrician to check and fix.',
    category: 'Electrical', price: 200, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Afternoon',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Install ceiling fan in bedroom',
    description: 'New ceiling fan needs to be installed in the bedroom. Fan is already purchased.',
    category: 'Electrical', price: 300, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'MCB tripping issue',
    description: 'Main MCB keeps tripping every few hours. Need electrician to diagnose the problem.',
    category: 'Electrical', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Wiring for new AC unit',
    description: 'New AC has been bought. Need proper wiring and socket installation done.',
    category: 'Electrical', price: 700, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Replace broken plug socket',
    description: 'One plug socket in the kitchen is broken and sparking. Urgent fix needed.',
    category: 'Electrical', price: 250, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },

  // ── Carpentry ──
  {
    title: 'Fix broken wooden chair',
    description: 'Dining chair leg is broken. Need a carpenter to repair it.',
    category: 'Carpentry', price: 200, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Afternoon',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Wardrobe door hinge repair',
    description: 'Wardrobe door hinge is loose and door is falling. Need quick fix.',
    category: 'Carpentry', price: 250, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Install wooden shelf in kitchen',
    description: 'Need a small wooden shelf installed above the kitchen counter.',
    category: 'Carpentry', price: 500, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Bed frame repair',
    description: 'Wooden bed frame has cracked on one side. Need carpenter to fix it.',
    category: 'Carpentry', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: true, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Fix main door lock',
    description: 'Main door lock is jammed and not closing properly. Need urgent fix.',
    category: 'Carpentry', price: 300, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },

  // ── Cleaning ──
  {
    title: 'Deep clean 2BHK flat',
    description: 'Full house deep cleaning needed. 2BHK flat, approx 900 sq ft.',
    category: 'Cleaning', price: 1200, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Full Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Kitchen deep cleaning',
    description: 'Kitchen chimney, stove and tiles need thorough cleaning.',
    category: 'Cleaning', price: 700, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Bathroom deep cleaning',
    description: 'Two bathrooms need deep cleaning including tiles and fixtures.',
    category: 'Cleaning', price: 500, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Sofa and carpet steam cleaning',
    description: 'L-shaped sofa and one carpet need steam cleaning.',
    category: 'Cleaning', price: 800, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Post renovation cleaning',
    description: 'Flat renovation just finished. Need full cleaning to remove dust and debris.',
    category: 'Cleaning', price: 1500, payment_type: 'Total Budget',
    workers_required: 3, work_duration: 'Full Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },

  // ── Painting ──
  {
    title: 'Paint one bedroom wall',
    description: 'One wall in bedroom needs fresh coat of paint. Wall size approx 10x10 ft.',
    category: 'Painting', price: 600, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Full house painting 2BHK',
    description: 'Complete interior painting of 2BHK flat. Approx 900 sq ft.',
    category: 'Painting', price: 8000, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Multiple Days', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Touch up paint on walls',
    description: 'Few patches on walls need touch up paint. Paint colour already available.',
    category: 'Painting', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Afternoon',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Paint main door',
    description: 'Wooden main door needs sanding and fresh paint coat.',
    category: 'Painting', price: 500, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Waterproof paint on terrace',
    description: 'Terrace has water seepage. Need waterproof paint applied on the floor.',
    category: 'Painting', price: 2000, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Full Day', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },

  // ── Appliance Repair ──
  {
    title: 'Washing machine not spinning',
    description: 'Washing machine completes wash cycle but drum is not spinning properly.',
    category: 'Appliance Repair', price: 500, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Refrigerator not cooling',
    description: 'Fridge is running but not cooling. Need technician to check gas or compressor.',
    category: 'Appliance Repair', price: 600, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'AC service and gas refill',
    description: 'AC is not cooling well. Needs servicing and possibly gas refill.',
    category: 'Appliance Repair', price: 1200, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: true, tools_provided: false, night_work: false,
  },
  {
    title: 'Microwave not heating',
    description: 'Microwave turns on but food is not getting heated. Need repair.',
    category: 'Appliance Repair', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Afternoon',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Geyser water not heating',
    description: 'Geyser is on but water stays cold. Need technician to check heating element.',
    category: 'Appliance Repair', price: 450, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },

  // ── Gardening ──
  {
    title: 'Trim garden plants and bushes',
    description: 'Small garden with 10-12 plants needs trimming and cleaning.',
    category: 'Gardening', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Repot indoor plants',
    description: 'Have 8 indoor plants that need repotting. Soil and pots available.',
    category: 'Gardening', price: 300, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Remove dry tree from compound',
    description: 'One dry tree in compound needs to be cut and removed safely.',
    category: 'Gardening', price: 800, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: true, vehicle_required: true, tools_provided: false, night_work: false,
  },
  {
    title: 'Set up kitchen garden on balcony',
    description: 'Want to set up a small kitchen garden on balcony. Need help with soil, pots and planting.',
    category: 'Gardening', price: 600, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Lawn mowing and weeding',
    description: 'Small lawn needs mowing and weeds need to be removed.',
    category: 'Gardening', price: 350, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },

  // ── Moving & Shifting ──
  {
    title: 'Shift furniture within flat',
    description: 'Need help rearranging heavy furniture within the same flat.',
    category: 'Moving', price: 500, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: true, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Help loading goods in truck',
    description: 'Shifting house tomorrow. Need 3 people to help load furniture in truck.',
    category: 'Moving', price: 800, payment_type: 'Total Budget',
    workers_required: 3, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: true, heavy_lifting: true, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Carry heavy items to 3rd floor',
    description: 'Bought new furniture. Need help carrying it up to 3rd floor. No lift available.',
    category: 'Moving', price: 600, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: true, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Unpack and arrange after shifting',
    description: 'Just shifted to new flat. Need help unpacking boxes and arranging items.',
    category: 'Moving', price: 700, payment_type: 'Total Budget',
    workers_required: 2, work_duration: 'Full Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: true, vehicle_required: false, tools_provided: false, night_work: false,
  },

  // ── Pest Control ──
  {
    title: 'Cockroach pest control in kitchen',
    description: 'Cockroach problem in kitchen. Need pest control spray done.',
    category: 'Pest Control', price: 500, payment_type: 'Total Budget',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Termite treatment for wooden doors',
    description: 'Wooden doors and window frames have termite damage. Need treatment.',
    category: 'Pest Control', price: 800, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Mosquito fogging in flat',
    description: 'Mosquito problem in flat. Need fogging done in all rooms.',
    category: 'Pest Control', price: 400, payment_type: 'Total Budget',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Evening',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Rat control in kitchen',
    description: 'Rats entering kitchen at night. Need traps or treatment done.',
    category: 'Pest Control', price: 600, payment_type: 'Total Budget',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Evening',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: true,
  },

  // ── Home Help ──
  {
    title: 'Hang photo frames on wall',
    description: 'Need 6 photo frames hung on walls in hall and bedroom.',
    category: 'Home Help', price: 200, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Afternoon',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Assemble new study table and bookshelf',
    description: 'Bought a new study table and bookshelf. Need help assembling them.',
    category: 'Home Help', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Fix curtain rods in 3 rooms',
    description: 'Curtain rods need to be installed in 3 rooms. Rods and curtains are ready.',
    category: 'Home Help', price: 350, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Install CCTV camera at main door',
    description: 'Need one CCTV camera installed at main door. Camera already purchased.',
    category: 'Home Help', price: 500, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Fix leaking roof during rain',
    description: 'Roof has a small crack and water drips during heavy rain. Need urgent fix.',
    category: 'Home Help', price: 1000, payment_type: 'Total Budget',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: true, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Clean desert cooler before summer',
    description: 'Desert cooler needs full cleaning and pad replacement before summer.',
    category: 'Home Help', price: 300, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
  {
    title: 'Tile grout cleaning in bathroom',
    description: 'Bathroom tiles have black grout lines. Need professional cleaning.',
    category: 'Home Help', price: 400, payment_type: 'Per Worker',
    workers_required: 1, work_duration: 'Half Day', preferred_time: 'Morning',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: true, night_work: false,
  },
  {
    title: 'Fix squeaky door hinges',
    description: 'Two doors in the house have squeaky hinges. Need oiling or replacement.',
    category: 'Home Help', price: 150, payment_type: 'Per Worker',
    workers_required: 1, work_duration: '2 Hours', preferred_time: 'Afternoon',
    urgent: false, heavy_lifting: false, vehicle_required: false, tools_provided: false, night_work: false,
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seed = async () => {
  const dbStatus = await checkDatabaseConnection();
  if (!dbStatus.connected) {
    console.error('❌ DB connection failed:', dbStatus.error);
    process.exit(1);
  }

  setupAssociations();
  await sequelize.sync();
  console.log('✅ Tables synced');

  // ── Create Users ──
  const createdUsers: User[] = [];
  for (const u of seedUsers) {
    const [user] = await User.findOrCreate({
      where: { mobile_number: u.mobile_number },
      defaults: {
        ...u,
        rating: 0,
        total_jobs_completed: 0,
        completion_rate: 0,
        is_verified: true,
        availability_status: AvailabilityStatus.ONLINE,
      } as any,
    });
    createdUsers.push(user);
  }
  console.log(`✅ ${createdUsers.length} users seeded`);

  // ── Create Jobs ──
  let jobCount = 0;
  for (let i = 0; i < jobTemplates.length; i++) {
    const t = jobTemplates[i];
    const user = createdUsers[i % createdUsers.length];
    const loc  = locations[i % locations.length];

    const workStartDate = new Date();
    workStartDate.setDate(workStartDate.getDate() + (i % 7) + 1); // 1–7 days from now

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // expires in 14 days

    await Job.create({
      id: uuidv4(),
      title: t.title,
      description: t.description,
      category: t.category,
      price: t.price,
      payment_type: t.payment_type,
      city: loc.city,
      area: loc.area,
      full_address: loc.full_address,
      latitude: null,
      longitude: null,
      created_by: user.id,
      workers_required: t.workers_required,
      work_duration: t.work_duration,
      work_start_date: workStartDate,
      preferred_time: t.preferred_time,
      status: JobStatus.OPEN,
      urgent: t.urgent,
      heavy_lifting: t.heavy_lifting,
      vehicle_required: t.vehicle_required,
      tools_provided: t.tools_provided,
      night_work: t.night_work,
      expires_at: expiresAt,
      cancelled_by: null,
      cancellation_reason: null,
    } as any);

    jobCount++;
  }

  console.log(`✅ ${jobCount} jobs seeded`);
  console.log('🎉 Seeding complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
