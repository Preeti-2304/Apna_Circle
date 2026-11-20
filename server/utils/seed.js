require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

// Models
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const FriendRequest = require('../models/FriendRequest');
const HelpRequest = require('../models/HelpRequest');
const HelpTransaction = require('../models/HelpTransaction');
const RewardTransaction = require('../models/RewardTransaction');
const Review = require('../models/Review');
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const CommunityPost = require('../models/CommunityPost');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Friendship.deleteMany({}),
      FriendRequest.deleteMany({}),
      HelpRequest.deleteMany({}),
      HelpTransaction.deleteMany({}),
      RewardTransaction.deleteMany({}),
      Review.deleteMany({}),
      Community.deleteMany({}),
      CommunityMember.deleteMany({}),
      CommunityPost.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Password@123', salt);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);

    // 1. Admin User
    const adminUser = await User.create({
      name: 'ApnaCircle Admin',
      email: 'admin@apnacircle.com',
      password: adminPasswordHash,
      role: 'admin',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'ApnaCircle Platform Super Administrator.',
      currentCity: 'Delhi',
      originallyFrom: { city: 'Delhi', state: 'Delhi', country: 'India' },
      currentlyLivingIn: { city: 'Delhi', state: 'Delhi', country: 'India' },
      location: { type: 'Point', coordinates: [77.209, 28.6139] },
      profession: 'Platform Lead',
      college: 'IIT Delhi',
      languages: ['Hindi', 'English'],
      skills: ['Community Leadership', 'Platform Moderation', 'Emergency Assistance'],
      canHelpCategories: ['Emergency Assistance', 'Technology Help', 'Local Guidance'],
      availability: 'Available',
      trustScore: 99,
      rewardPoints: 2500,
      level: 5,
      badges: ['Community Champion', 'Platform Admin', 'Local Hero'],
    });

    // 2. Demo User A (Rahul Sharma - Delhi)
    const rahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@apnacircle.com',
      password: demoPasswordHash,
      role: 'user',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      bio: 'Software engineer living in Delhi, originally from Jaipur. Always happy to guide travelers and tech enthusiasts!',
      currentCity: 'Delhi',
      originallyFrom: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      currentlyLivingIn: { city: 'Delhi', state: 'Delhi', country: 'India' },
      location: { type: 'Point', coordinates: [77.219, 28.628] }, // Connaught Place Delhi
      college: 'Delhi Technological University (DTU)',
      course: 'B.Tech Computer Science',
      profession: 'Full Stack Engineer',
      company: 'Tech Innovations',
      languages: ['Hindi', 'English', 'Rajasthani'],
      skills: ['Technology', 'Travel', 'Local Guidance', 'Vehicle Knowledge'],
      canHelpCategories: ['Technology Help', 'Local Guidance', 'Travel Help', 'Vehicle Help'],
      availability: 'Available',
      trustScore: 92,
      rewardPoints: 480,
      level: 3,
      helpCompletedCount: 8,
      badges: ['Active Member', 'Local Hero', 'First Help'],
    });

    // 3. Demo User B (Priya Verma - Jaipur)
    const priya = await User.create({
      name: 'Priya Verma',
      email: 'priya@apnacircle.com',
      password: demoPasswordHash,
      role: 'user',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: 'Architect in Jaipur. Love heritage walks, food tours, and vehicle maintenance guidance.',
      currentCity: 'Jaipur',
      originallyFrom: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      currentlyLivingIn: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      location: { type: 'Point', coordinates: [75.7873, 26.9124] }, // Jaipur
      college: 'MNIT Jaipur',
      course: 'B.Arch',
      profession: 'Heritage Architect',
      company: 'Design Jaipur',
      languages: ['Hindi', 'English'],
      skills: ['Vehicle Knowledge', 'Travel', 'Local Guidance', 'Accommodation Guidance'],
      canHelpCategories: ['Vehicle Help', 'Travel Help', 'Local Guidance', 'Accommodation Guidance'],
      availability: 'Available',
      trustScore: 95,
      rewardPoints: 620,
      level: 4,
      helpCompletedCount: 12,
      badges: ['Trusted Helper', 'Travel Expert', 'Local Hero'],
    });

    // 4. Demo User C (Aman Patel - Delhi)
    const aman = await User.create({
      name: 'Aman Patel',
      email: 'aman@apnacircle.com',
      password: demoPasswordHash,
      role: 'user',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Automobile enthusiast and mechanical engineer in South Delhi. Specialized in car & bike breakdown assistance.',
      currentCity: 'Delhi',
      originallyFrom: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      currentlyLivingIn: { city: 'Delhi', state: 'Delhi', country: 'India' },
      location: { type: 'Point', coordinates: [77.228, 28.535] }, // Saket Delhi
      college: 'IIT Delhi',
      course: 'M.Tech Mechanical',
      profession: 'Automotive Specialist',
      languages: ['Hindi', 'English', 'Gujarati'],
      skills: ['Vehicle Knowledge', 'Emergency Assistance', 'Technology'],
      canHelpCategories: ['Vehicle Help', 'Emergency Assistance', 'Technology Help'],
      availability: 'Available',
      trustScore: 96,
      rewardPoints: 780,
      level: 4,
      helpCompletedCount: 16,
      badges: ['Trusted Helper', 'Local Hero'],
    });

    // 5. Demo User D (Sneha Kulkarni - Mumbai)
    const sneha = await User.create({
      name: 'Sneha Kulkarni',
      email: 'sneha@apnacircle.com',
      password: demoPasswordHash,
      role: 'user',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Product Designer in Bandra, Mumbai. Relocated from Pune. Expert in city transit and PG accommodations.',
      currentCity: 'Mumbai',
      originallyFrom: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      currentlyLivingIn: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      location: { type: 'Point', coordinates: [72.8258, 19.0596] }, // Bandra
      college: 'IIT Bombay (IDC)',
      course: 'M.Des',
      profession: 'Lead UI/UX Designer',
      languages: ['Marathi', 'Hindi', 'English'],
      skills: ['Local Guidance', 'Accommodation Guidance', 'Travel'],
      canHelpCategories: ['Accommodation Guidance', 'Local Guidance', 'Travel Help'],
      availability: 'Available',
      trustScore: 88,
      rewardPoints: 340,
      level: 3,
      helpCompletedCount: 6,
      badges: ['Active Member'],
    });

    // 6. Demo User E (Vikram Singh - Jaipur)
    const vikram = await User.create({
      name: 'Vikram Singh',
      email: 'vikram@apnacircle.com',
      password: demoPasswordHash,
      role: 'user',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Jaipur native. University mentor and local transit enthusiast.',
      currentCity: 'Jaipur',
      originallyFrom: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      currentlyLivingIn: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      location: { type: 'Point', coordinates: [75.81, 26.89] },
      college: 'Rajasthan University',
      course: 'MBA',
      profession: 'Startup Consultant',
      languages: ['Hindi', 'English'],
      skills: ['Education Guidance', 'Local Guidance', 'Vehicle Knowledge'],
      canHelpCategories: ['Education Help', 'Local Guidance', 'Vehicle Help'],
      availability: 'Available',
      trustScore: 84,
      rewardPoints: 210,
      level: 2,
      helpCompletedCount: 4,
      badges: ['Active Member'],
    });

    // 7. Demo User F (Ananya Das - Bangalore)
    const ananya = await User.create({
      name: 'Ananya Das',
      email: 'ananya@apnacircle.com',
      password: demoPasswordHash,
      role: 'user',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Cloud Architect in Indiranagar, Bangalore. Originally from Kolkata.',
      currentCity: 'Bangalore',
      originallyFrom: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
      currentlyLivingIn: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      location: { type: 'Point', coordinates: [77.6412, 12.9784] },
      college: 'IISc Bangalore',
      course: 'M.Tech CSA',
      profession: 'Cloud Architect',
      languages: ['English', 'Bengali', 'Hindi'],
      skills: ['Technology', 'Education Guidance', 'Local Guidance'],
      canHelpCategories: ['Technology Help', 'Education Help', 'Local Guidance'],
      availability: 'Available',
      trustScore: 94,
      rewardPoints: 590,
      level: 4,
      helpCompletedCount: 11,
      badges: ['Trusted Helper'],
    });

    console.log('[Seed] Users created successfully.');

    // Friendships:
    // Rahul is direct friends with:
    // - Priya (Jaipur)
    // - Aman (Delhi)
    // - Sneha (Mumbai)
    console.log('[Seed] Creating friendships...');
    await Friendship.create([
      {
        user1: rahul._id < priya._id ? rahul._id : priya._id,
        user2: rahul._id < priya._id ? priya._id : rahul._id,
        users: [rahul._id, priya._id],
        status: 'accepted',
      },
      {
        user1: rahul._id < aman._id ? rahul._id : aman._id,
        user2: rahul._id < aman._id ? aman._id : rahul._id,
        users: [rahul._id, aman._id],
        status: 'accepted',
      },
      {
        user1: rahul._id < sneha._id ? rahul._id : sneha._id,
        user2: rahul._id < sneha._id ? sneha._id : rahul._id,
        users: [rahul._id, sneha._id],
        status: 'accepted',
      },
      // Second degree connection: Priya is friends with Vikram (Jaipur)
      // This makes Vikram a "Friend of Friend" to Rahul!
      {
        user1: priya._id < vikram._id ? priya._id : vikram._id,
        user2: priya._id < vikram._id ? vikram._id : priya._id,
        users: [priya._id, vikram._id],
        status: 'accepted',
      },
    ]);

    // Friend Request: Ananya sent a pending request to Rahul
    console.log('[Seed] Creating friend requests...');
    await FriendRequest.create({
      sender: ananya._id,
      recipient: rahul._id,
      status: 'pending',
    });

    // Communities
    console.log('[Seed] Creating communities...');
    const delhiComm = await Community.create({
      name: 'Delhi NCR Circle',
      description: 'Official community for residents, students, and travelers in Delhi, Noida, and Gurugram.',
      city: 'Delhi',
      category: 'City Community',
      creator: adminUser._id,
      memberCount: 3,
      isOfficial: true,
    });

    const jaipurComm = await Community.create({
      name: 'Jaipur Heritage & Travelers',
      description: 'Connecting locals and visitors across the Pink City with trusted guides and hospitality.',
      city: 'Jaipur',
      category: 'Travel',
      creator: priya._id,
      memberCount: 2,
      isOfficial: true,
    });

    const techComm = await Community.create({
      name: 'Tech & Engineers Circle',
      description: 'Mentorship, code debugging, and tech career assistance across Indian cities.',
      city: 'Bangalore',
      category: 'Tech',
      creator: ananya._id,
      memberCount: 3,
    });

    // Community Members
    await CommunityMember.create([
      { community: delhiComm._id, user: adminUser._id, role: 'admin' },
      { community: delhiComm._id, user: rahul._id, role: 'member' },
      { community: delhiComm._id, user: aman._id, role: 'member' },
      { community: jaipurComm._id, user: priya._id, role: 'admin' },
      { community: jaipurComm._id, user: vikram._id, role: 'member' },
      { community: techComm._id, user: ananya._id, role: 'admin' },
      { community: techComm._id, user: rahul._id, role: 'member' },
    ]);

    // Community Posts
    await CommunityPost.create([
      {
        community: delhiComm._id,
        author: rahul._id,
        title: 'Best co-working spaces near Connaught Place & South Delhi?',
        content: 'Hey everyone, visiting South Delhi next week. Any recommendations for reliable quiet spots with high-speed internet?',
        likes: [aman._id],
        comments: [
          {
            author: aman._id,
            text: 'Check out Innov8 in CP or Spring House in Saket! Very comfortable and great coffee.',
            createdAt: new Date(),
          },
        ],
      },
      {
        community: jaipurComm._id,
        author: priya._id,
        title: 'Weekend heritage walk at Amer & Jal Mahal',
        content: 'Organizing a small heritage architecture walk this Saturday at 7 AM. Anyone interested in joining is welcome to RSVP!',
        likes: [vikram._id, rahul._id],
      },
    ]);

    // Help Requests:
    console.log('[Seed] Creating help requests...');
    // 1. Vehicle Help in Delhi created by Rahul
    const vehicleHelpDelhi = await HelpRequest.create({
      creator: rahul._id,
      title: 'Flat tyre and battery jumpstart needed near Connaught Place',
      description: 'Car battery seems drained after headlights were left on, and right front tyre is low on pressure. Need someone with jumper cables or portable air inflator nearby.',
      category: 'Vehicle Help',
      city: 'Delhi',
      location: { type: 'Point', coordinates: [77.219, 28.628] },
      urgency: 'High',
      preferredLanguage: 'Hindi',
      requiredSkills: ['Vehicle Knowledge'],
      visibility: 'public',
      status: 'Open',
    });

    // 2. Completed Tech Help request between Sneha and Rahul
    const techHelpReq = await HelpRequest.create({
      creator: sneha._id,
      acceptedHelper: rahul._id,
      title: 'Setup Node.js backend on AWS EC2 with custom domain',
      description: 'Need hands-on guidance configuring Nginx reverse proxy and SSL certificate for our portfolio backend.',
      category: 'Technology Help',
      city: 'Mumbai',
      location: { type: 'Point', coordinates: [72.8258, 19.0596] },
      urgency: 'Medium',
      preferredLanguage: 'English',
      requiredSkills: ['Technology'],
      status: 'Completed',
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Help Transaction for the completed request
    await HelpTransaction.create({
      helpRequest: techHelpReq._id,
      creator: sneha._id,
      helper: rahul._id,
      category: 'Technology Help',
      status: 'completed',
      pointsAwarded: 30,
      isConfirmedByCreator: true,
      confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Review by Sneha for Rahul
    await Review.create({
      author: sneha._id,
      targetUser: rahul._id,
      helpRequest: techHelpReq._id,
      rating: 5,
      feedback: 'Rahul was incredible! Guided me step by step through Nginx setup and SSL in under 45 minutes. Super knowledgeable!',
      category: 'Technology Help',
    });

    // Reward transaction records for Rahul
    await RewardTransaction.create([
      {
        user: rahul._id,
        type: 'BONUS',
        amount: 50,
        action: 'Verified Account Bonus',
        balanceAfter: 50,
      },
      {
        user: rahul._id,
        type: 'EARNED',
        amount: 30,
        action: 'Completed Help: Technology Help',
        referenceId: techHelpReq._id.toString(),
        category: 'Technology Help',
        balanceAfter: 80,
      },
      {
        user: rahul._id,
        type: 'EARNED',
        amount: 10,
        action: 'Received 5-Star Feedback for Technology Help',
        referenceId: techHelpReq._id.toString(),
        category: 'Technology Help',
        balanceAfter: 90,
      },
    ]);

    // Conversation between Rahul and Priya
    console.log('[Seed] Creating demo conversation...');
    const convo = await Conversation.create({
      participants: [rahul._id, priya._id],
      lastMessage: 'Let me know whenever you arrive in Jaipur! Happy to show you around.',
      lastMessageAt: new Date(),
    });

    await Message.create([
      {
        conversation: convo._id,
        sender: rahul._id,
        text: 'Hey Priya! Planning to visit Jaipur next month for a weekend trip.',
        readBy: [rahul._id, priya._id],
      },
      {
        conversation: convo._id,
        sender: priya._id,
        text: 'Let me know whenever you arrive in Jaipur! Happy to show you around.',
        readBy: [rahul._id, priya._id],
      },
    ]);

    // Notifications for Rahul
    console.log('[Seed] Creating notifications...');
    await Notification.create([
      {
        recipient: rahul._id,
        sender: ananya._id,
        type: 'friend_request',
        title: 'New Friend Request',
        message: 'Ananya Das sent you a friend request from Bangalore.',
        link: '/friends/requests',
        read: false,
      },
      {
        recipient: rahul._id,
        sender: sneha._id,
        type: 'review_received',
        title: 'New 5-Star Review!',
        message: 'Sneha Kulkarni gave you a 5-star review for Technology Help.',
        link: '/rewards',
        read: true,
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ APNACIRCLE DATABASE SEEDED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Logins:');
    console.log('1. User A (Rahul - Delhi): rahul@apnacircle.com  /  Password@123');
    console.log('2. User B (Priya - Jaipur): priya@apnacircle.com  /  Password@123');
    console.log('3. User C (Aman - Delhi):   aman@apnacircle.com   /  Password@123');
    console.log('4. Admin:                   admin@apnacircle.com  /  Admin@123');
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
