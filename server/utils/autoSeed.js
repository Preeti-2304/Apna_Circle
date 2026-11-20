const bcrypt = require('bcryptjs');
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

const checkAndAutoSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Database] Database contains ${userCount} existing users. Skipping auto-seed.`);
      return;
    }

    console.log('[Database] Database is empty. Initializing comprehensive demo dataset...');

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
      location: { type: 'Point', coordinates: [75.7873, 26.9124] },
      college: 'MNIT Jaipur',
      course: 'B.Arch',
      profession: 'Heritage Architect',
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
      location: { type: 'Point', coordinates: [77.228, 28.535] },
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
      location: { type: 'Point', coordinates: [72.8258, 19.0596] },
      college: 'IIT Bombay',
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

    // Friendships
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
      {
        user1: priya._id < vikram._id ? priya._id : vikram._id,
        user2: priya._id < vikram._id ? vikram._id : priya._id,
        users: [priya._id, vikram._id],
        status: 'accepted',
      },
    ]);

    // Friend Request
    await FriendRequest.create({
      sender: ananya._id,
      recipient: rahul._id,
      status: 'pending',
    });

    // Communities
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

    await CommunityMember.create([
      { community: delhiComm._id, user: adminUser._id, role: 'admin' },
      { community: delhiComm._id, user: rahul._id, role: 'member' },
      { community: delhiComm._id, user: aman._id, role: 'member' },
      { community: jaipurComm._id, user: priya._id, role: 'admin' },
      { community: jaipurComm._id, user: vikram._id, role: 'member' },
      { community: techComm._id, user: ananya._id, role: 'admin' },
      { community: techComm._id, user: rahul._id, role: 'member' },
    ]);

    await CommunityPost.create([
      {
        community: delhiComm._id,
        author: rahul._id,
        title: 'Best co-working spaces near Connaught Place & South Delhi?',
        content: 'Hey everyone, visiting South Delhi next week. Any recommendations for quiet spots with high-speed internet?',
        likes: [aman._id],
        comments: [
          {
            author: aman._id,
            text: 'Check out Innov8 in CP or Spring House in Saket!',
            createdAt: new Date(),
          },
        ],
      },
    ]);

    // Help Requests
    const vehicleHelpDelhi = await HelpRequest.create({
      creator: rahul._id,
      title: 'Flat tyre and battery jumpstart needed near Connaught Place',
      description: 'Car battery drained after headlights were left on, and front tyre is low on pressure. Need someone with jumper cables or air inflator nearby.',
      category: 'Vehicle Help',
      city: 'Delhi',
      location: { type: 'Point', coordinates: [77.219, 28.628] },
      urgency: 'High',
      preferredLanguage: 'Hindi',
      requiredSkills: ['Vehicle Knowledge'],
      status: 'Open',
    });

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

    await Review.create({
      author: sneha._id,
      targetUser: rahul._id,
      helpRequest: techHelpReq._id,
      rating: 5,
      feedback: 'Rahul was incredible! Guided me step by step through Nginx setup and SSL in under 45 minutes.',
      category: 'Technology Help',
    });

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

    console.log('[Database] Demo dataset initialized successfully.');
  } catch (error) {
    console.error('[AutoSeed Error]:', error);
  }
};

module.exports = { checkAndAutoSeed };
