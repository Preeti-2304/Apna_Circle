const User = require('../models/User');

// Indian cities reference coordinates for fallback
const CITY_COORDINATES = {
  delhi: [77.209, 28.6139],
  mumbai: [72.8777, 19.076],
  bangalore: [77.5946, 12.9716],
  bengaluru: [77.5946, 12.9716],
  jaipur: [75.7873, 26.9124],
  lucknow: [80.9462, 26.8467],
  pune: [73.8567, 18.5204],
  hyderabad: [78.4867, 17.385],
  chandigarh: [76.7794, 30.7333],
  ahmedabad: [72.5714, 23.0225],
  chennai: [80.2707, 13.0827],
  kolkata: [88.3639, 22.5726],
  noida: [77.391, 28.5355],
  gurugram: [77.0266, 28.4595],
  gurgaon: [77.0266, 28.4595],
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      avatar,
      bio,
      gender,
      dob,
      originallyFrom,
      currentlyLivingIn,
      college,
      course,
      profession,
      company,
      languages,
      skills,
      canHelpCategories,
      availability,
      profileVisibility,
      preferredContact,
      hideLiveLocation,
      coordinates, // [lng, lat] optional if user grants location
    } = req.body;

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio.trim();
    if (gender !== undefined) user.gender = gender;
    if (dob) user.dob = new Date(dob);

    if (originallyFrom) {
      user.originallyFrom = {
        city: originallyFrom.city || user.originallyFrom?.city || '',
        state: originallyFrom.state || user.originallyFrom?.state || '',
        country: originallyFrom.country || user.originallyFrom?.country || 'India',
      };
    }

    if (currentlyLivingIn) {
      const city = currentlyLivingIn.city || user.currentlyLivingIn?.city || 'Delhi';
      user.currentlyLivingIn = {
        city,
        state: currentlyLivingIn.state || user.currentlyLivingIn?.state || '',
        country: currentlyLivingIn.country || user.currentlyLivingIn?.country || 'India',
      };
      user.currentCity = city;

      // If user did not pass live coordinates, set city center coordinates
      if (!coordinates && CITY_COORDINATES[city.toLowerCase()]) {
        user.location = {
          type: 'Point',
          coordinates: CITY_COORDINATES[city.toLowerCase()],
        };
      }
    }

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      user.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    }

    if (hideLiveLocation !== undefined) user.hideLiveLocation = Boolean(hideLiveLocation);
    if (college !== undefined) user.college = college.trim();
    if (course !== undefined) user.course = course.trim();
    if (profession !== undefined) user.profession = profession.trim();
    if (company !== undefined) user.company = company.trim();
    if (languages) user.languages = Array.isArray(languages) ? languages : [languages];
    if (skills) user.skills = Array.isArray(skills) ? skills : [skills];
    if (canHelpCategories) {
      user.canHelpCategories = Array.isArray(canHelpCategories)
        ? canHelpCategories
        : [canHelpCategories];
    }
    if (availability) user.availability = availability;
    if (profileVisibility) user.profileVisibility = profileVisibility;
    if (preferredContact) user.preferredContact = preferredContact;

    user.calculateProfileCompletion();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const target = await User.findById(req.params.id)
      .select('-password -otpCode -otpExpiresAt -resetPasswordToken -resetPasswordExpiresAt')
      .lean();

    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mask exact coordinates for privacy protection
    if (target.hideLiveLocation || !target.location?.coordinates) {
      target.approximateLocation = target.currentCity;
      delete target.location;
    } else {
      // Add slight privacy jitter to public coordinates (~500m)
      target.approximateCoordinates = [
        Math.round(target.location.coordinates[0] * 100) / 100,
        Math.round(target.location.coordinates[1] * 100) / 100,
      ];
    }

    res.status(200).json({
      success: true,
      user: target,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Discover people with filters
// @route   GET /api/users/discover
const discoverUsers = async (req, res) => {
  try {
    const {
      search,
      city,
      fromCity,
      college,
      skill,
      category,
      language,
      availability,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { status: 'active' };

    // Exclude logged in user
    if (req.user) {
      query._id = { $ne: req.user._id, $nin: req.user.blockedUsers || [] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { currentCity: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    if (city && city !== 'all') {
      query.currentCity = { $regex: `^${city.trim()}$`, $options: 'i' };
    }

    if (fromCity && fromCity !== 'all') {
      query['originallyFrom.city'] = { $regex: `^${fromCity.trim()}$`, $options: 'i' };
    }

    if (college && college !== 'all') {
      query.college = { $regex: college.trim(), $options: 'i' };
    }

    if (skill && skill !== 'all') {
      query.skills = { $regex: skill.trim(), $options: 'i' };
    }

    if (category && category !== 'all') {
      query.canHelpCategories = { $regex: category.trim(), $options: 'i' };
    }

    if (language && language !== 'all') {
      query.languages = { $regex: language.trim(), $options: 'i' };
    }

    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -otpCode -otpExpiresAt')
      .sort({ trustScore: -1, rewardPoints: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    // Obfuscate live coordinates for public discovery
    users.forEach((u) => {
      if (u.hideLiveLocation) {
        delete u.location;
      }
    });

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      users,
    });
  } catch (error) {
    console.error('[Discover Users Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby people with geospatial search
// @route   GET /api/users/nearby
const getNearbyUsers = async (req, res) => {
  try {
    let { lat, lng, city, radius = 25, category } = req.query;
    radius = parseFloat(radius) || 25; // km

    let coordinates = null;
    if (lat && lng) {
      coordinates = [parseFloat(lng), parseFloat(lat)];
    } else if (city && CITY_COORDINATES[city.toLowerCase()]) {
      coordinates = CITY_COORDINATES[city.toLowerCase()];
    } else if (req.user?.location?.coordinates) {
      coordinates = req.user.location.coordinates;
    } else {
      coordinates = CITY_COORDINATES['delhi'];
    }

    const query = {
      status: 'active',
      hideLiveLocation: { $ne: true },
    };

    if (req.user) {
      query._id = { $ne: req.user._id, $nin: req.user.blockedUsers || [] };
    }

    if (category && category !== 'all') {
      query.canHelpCategories = { $regex: category, $options: 'i' };
    }

    // Convert km to radians: 1 radian ~ 6378.1 km
    const radiusInRadians = radius / 6378.1;

    query.location = {
      $geoWithin: {
        $centerSphere: [coordinates, radiusInRadians],
      },
    };

    const users = await User.find(query)
      .select('-password -otpCode -otpExpiresAt')
      .limit(30)
      .lean();

    res.status(200).json({
      success: true,
      center: coordinates,
      radiusKm: radius,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('[Nearby Users Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block a user
// @route   POST /api/users/:id/block
const blockUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetId },
    });

    res.status(200).json({
      success: true,
      message: 'User has been blocked',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unblock a user
// @route   POST /api/users/:id/unblock
const unblockUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blockedUsers: targetId },
    });

    res.status(200).json({
      success: true,
      message: 'User has been unblocked',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  CITY_COORDINATES,
  updateProfile,
  getUserById,
  discoverUsers,
  getNearbyUsers,
  blockUser,
  unblockUser,
};
