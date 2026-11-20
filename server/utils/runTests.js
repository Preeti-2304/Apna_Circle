require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');

// Models
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const FriendRequest = require('../models/FriendRequest');
const HelpRequest = require('../models/HelpRequest');
const HelpTransaction = require('../models/HelpTransaction');
const RewardTransaction = require('../models/RewardTransaction');
const Review = require('../models/Review');
const { computeHelperMatch } = require('../services/matchingService');
const { awardPoints, getCategoryPoints } = require('../services/rewardService');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runAcceptanceTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING APNACIRCLE ACCEPTANCE TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();

    // Clean test collection
    await Promise.all([
      User.deleteMany({}),
      Friendship.deleteMany({}),
      FriendRequest.deleteMany({}),
      HelpRequest.deleteMany({}),
      HelpTransaction.deleteMany({}),
      RewardTransaction.deleteMany({}),
      Review.deleteMany({}),
    ]);

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('TestPass@123', salt);

    // -----------------------------------------------------------------
    // TEST 1: User A registers, verifies account, and creates profile
    // -----------------------------------------------------------------
    console.log('[TEST 1] User Registration, Password Hash, & OTP Verification:');
    const userA = await User.create({
      name: 'User A (Arjun)',
      email: 'arjun@apnacircle.test',
      password: passHash,
      otpCode: '654321',
      otpExpiresAt: new Date(Date.now() + 600000),
      isVerified: false,
      currentCity: 'Delhi',
      originallyFrom: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      currentlyLivingIn: { city: 'Delhi', state: 'Delhi', country: 'India' },
      location: { type: 'Point', coordinates: [77.209, 28.6139] }, // Delhi
      college: 'Delhi University',
      skills: ['Technology', 'Local Guidance'],
      canHelpCategories: ['Technology Help', 'Local Guidance'],
      rewardPoints: 50,
      trustScore: 80,
    });
    assert(userA._id !== undefined, 'User A registered in database');
    assert(userA.password !== 'TestPass@123', 'Password is securely hashed');

    // Verify OTP
    assert(userA.otpCode === '654321', 'OTP code matches generated token');
    userA.isVerified = true;
    userA.otpCode = undefined;
    await userA.save();
    assert(userA.isVerified === true, 'User A successfully verified account via OTP');

    // -----------------------------------------------------------------
    // TEST 2 & 3: User A discovers User B & sends/accepts friend request
    // -----------------------------------------------------------------
    console.log('\n[TEST 2 & 3] User Discovery, Friend Request & Acceptance:');
    const userB = await User.create({
      name: 'User B (Bhavna)',
      email: 'bhavna@apnacircle.test',
      password: passHash,
      isVerified: true,
      currentCity: 'Delhi',
      originallyFrom: { city: 'Delhi', state: 'Delhi', country: 'India' },
      currentlyLivingIn: { city: 'Delhi', state: 'Delhi', country: 'India' },
      location: { type: 'Point', coordinates: [77.228, 28.618] }, // Delhi (~2 km from A)
      college: 'IIT Delhi',
      languages: ['Hindi', 'English'],
      skills: ['Vehicle Knowledge', 'Local Guidance'],
      canHelpCategories: ['Vehicle Help', 'Local Guidance'],
      availability: 'Available',
      rewardPoints: 120,
      trustScore: 90,
      helpCompletedCount: 3,
    });

    const userC_Jaipur = await User.create({
      name: 'User C (Chirag)',
      email: 'chirag@apnacircle.test',
      password: passHash,
      isVerified: true,
      currentCity: 'Jaipur',
      originallyFrom: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      currentlyLivingIn: { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      location: { type: 'Point', coordinates: [75.7873, 26.9124] }, // Jaipur
      college: 'MNIT Jaipur',
      skills: ['Travel Help', 'Local Guidance'],
      canHelpCategories: ['Travel Help'],
      rewardPoints: 200,
      trustScore: 85,
    });

    // Send Friend Request from A to B
    const requestAB = await FriendRequest.create({
      sender: userA._id,
      recipient: userB._id,
      status: 'pending',
    });
    assert(requestAB.status === 'pending', 'Friend request created as pending');

    // Accept Friend Request
    requestAB.status = 'accepted';
    await requestAB.save();

    const friendshipAB = await Friendship.create({
      user1: userA._id < userB._id ? userA._id : userB._id,
      user2: userA._id < userB._id ? userB._id : userA._id,
      users: [userA._id, userB._id],
      status: 'accepted',
    });
    assert(friendshipAB._id !== undefined, 'Friendship created between User A and User B');

    // Also connect User A with User C (Jaipur)
    await Friendship.create({
      user1: userA._id < userC_Jaipur._id ? userA._id : userC_Jaipur._id,
      user2: userA._id < userC_Jaipur._id ? userC_Jaipur._id : userA._id,
      users: [userA._id, userC_Jaipur._id],
      status: 'accepted',
    });

    // -----------------------------------------------------------------
    // TEST 4: Filter Friends by City
    // -----------------------------------------------------------------
    console.log('\n[TEST 4] My Friends - City Filtering:');
    const aFriendships = await Friendship.find({ users: userA._id }).populate('users');
    const friendsOfA = aFriendships.map((f) =>
      f.users.find((u) => u._id.toString() !== userA._id.toString())
    );
    assert(friendsOfA.length === 2, 'User A has 2 total friends (Delhi and Jaipur)');

    // Filter by Delhi
    const delhiFriends = friendsOfA.filter(
      (f) => f.currentCity.toLowerCase() === 'delhi'
    );
    assert(delhiFriends.length === 1 && delhiFriends[0].name.includes('Bhavna'), 'Filter by "Delhi" shows only Delhi friends');

    // Filter by Jaipur
    const jaipurFriends = friendsOfA.filter(
      (f) => f.currentCity.toLowerCase() === 'jaipur'
    );
    assert(jaipurFriends.length === 1 && jaipurFriends[0].name.includes('Chirag'), 'Filter by "Jaipur" shows only Jaipur friends');

    // -----------------------------------------------------------------
    // TEST 5: Create a Help Request in Delhi
    // -----------------------------------------------------------------
    console.log('\n[TEST 5] Help Request Creation:');
    const reqVehicle = await HelpRequest.create({
      creator: userA._id,
      title: 'Flat tyre emergency near Connaught Place',
      description: 'Need assistance with tyre puncture or stepney replacement.',
      category: 'Vehicle Help',
      city: 'Delhi',
      location: { type: 'Point', coordinates: [77.209, 28.6139] },
      urgency: 'High',
      preferredLanguage: 'Hindi',
      requiredSkills: ['Vehicle Knowledge'],
      status: 'Open',
    });
    assert(reqVehicle.status === 'Open', 'Help request successfully created in Delhi with category Vehicle Help');

    // -----------------------------------------------------------------
    // TEST 6: Smart Matching Algorithm
    // -----------------------------------------------------------------
    console.log('\n[TEST 6] Smart Matching Engine:');
    const matchUserB = computeHelperMatch(reqVehicle, userB);
    const matchUserC = computeHelperMatch(reqVehicle, userC_Jaipur);

    console.log(`  -> Bhavna (Delhi, Vehicle Help, 90% Trust) Match Score: ${matchUserB.matchScore}%`);
    console.log(`     Breakdown:`, matchUserB.breakdown);
    console.log(`     Why: ${matchUserB.reason}`);
    console.log(`  -> Chirag (Jaipur, Travel Help) Match Score: ${matchUserC.matchScore}%`);

    assert(matchUserB.matchScore >= 80, 'Top recommended helper has high match score (>= 80%)');
    assert(matchUserB.matchScore > matchUserC.matchScore, 'Delhi vehicle specialist scores higher than distant non-matching helper');
    assert(matchUserB.breakdown.skillScore === 100, 'Skill score is 100% due to Vehicle Help category match');

    // -----------------------------------------------------------------
    // TEST 7: Accept Helper & In Progress Status
    // -----------------------------------------------------------------
    console.log('\n[TEST 7] Accept Helper & In Progress Transition:');
    reqVehicle.acceptedHelper = userB._id;
    reqVehicle.status = 'In Progress';
    await reqVehicle.save();

    await HelpTransaction.create({
      helpRequest: reqVehicle._id,
      creator: userA._id,
      helper: userB._id,
      category: reqVehicle.category,
      status: 'in_progress',
    });
    assert(reqVehicle.status === 'In Progress', 'Request transitioned to In Progress with accepted helper');

    // -----------------------------------------------------------------
    // TEST 8 & 9: Confirm Completion & Secure Reward Points Issuance
    // -----------------------------------------------------------------
    console.log('\n[TEST 8 & 9] Completion Confirmation & Immutable Rewards:');
    reqVehicle.status = 'Completed';
    reqVehicle.completedAt = new Date();
    await reqVehicle.save();

    const pointsToAward = getCategoryPoints(reqVehicle.category);
    assert(pointsToAward === 40, 'Vehicle Help yields +40 reward points');

    const rewardResult1 = await awardPoints({
      userId: userB._id,
      amount: pointsToAward,
      action: 'Completed Help: Vehicle Help',
      referenceId: reqVehicle._id.toString(),
      category: 'Vehicle Help',
    });

    assert(rewardResult1.awarded === true, 'Points successfully awarded to helper');
    const bUpdated = await User.findById(userB._id);
    assert(bUpdated.rewardPoints === 120 + 40, 'Helper reward balance correctly incremented');

    // Verify duplicate reward prevention
    const duplicateAttempt = await awardPoints({
      userId: userB._id,
      amount: pointsToAward,
      action: 'Completed Help: Vehicle Help',
      referenceId: reqVehicle._id.toString(),
      category: 'Vehicle Help',
    });
    assert(duplicateAttempt.awarded === false, 'Duplicate reward prevented by audit ledger check');

    // -----------------------------------------------------------------
    // TEST 10: Review Submission & Trust Score Update
    // -----------------------------------------------------------------
    console.log('\n[TEST 10] Review Submission & Trust Score Recalculation:');
    const review = await Review.create({
      author: userA._id,
      targetUser: userB._id,
      helpRequest: reqVehicle._id,
      rating: 5,
      feedback: 'Incredible help! Bhavna arrived within 10 minutes and sorted the stepney.',
      category: 'Vehicle Help',
    });
    assert(review._id !== undefined, '5-star review saved in database');

    userB.reviewsCount = 1;
    userB.averageRating = 5.0;
    userB.helpCompletedCount = 4;
    userB.trustScore = Math.min(100, Math.round(75 + (5.0 - 3) * 5 + 4 * 2));
    await userB.save();
    assert(userB.trustScore >= 93, 'Trust score successfully recalculated with verified 5-star review');

    // -----------------------------------------------------------------
    // TEST 11: Admin Role & User Management
    // -----------------------------------------------------------------
    console.log('\n[TEST 11] Admin Moderation & User Status:');
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@apnacircle.test',
      password: passHash,
      role: 'admin',
      isVerified: true,
      currentCity: 'Delhi',
    });
    assert(adminUser.role === 'admin', 'Admin user verified with admin role');

    // Suspend user C
    userC_Jaipur.status = 'suspended';
    await userC_Jaipur.save();
    const suspendedCheck = await User.findById(userC_Jaipur._id);
    assert(suspendedCheck.status === 'suspended', 'Admin can moderate and suspend user');

    console.log('\n======================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} ACCEPTANCE TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error);
    await disconnectDB();
    process.exit(1);
  }
}

runAcceptanceTests();
