// Haversine formula to compute distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Smart Matching Engine for ApnaCircle
 * Formula:
 * Match Score =
 * (0.35 × Skill Score) +
 * (0.25 × Language Score) +
 * (0.20 × Distance Score) +
 * (0.10 × Trust Score) +
 * (0.10 × Availability Score)
 */
function computeHelperMatch(helpRequest, helper) {
  // 1. Skill & Category Score (0 - 100)
  let skillScore = 0;
  const categoryMatch = helper.canHelpCategories?.some(
    (c) => c.toLowerCase() === helpRequest.category.toLowerCase()
  );

  const matchedSkills = [];
  if (helpRequest.requiredSkills && helpRequest.requiredSkills.length > 0) {
    helpRequest.requiredSkills.forEach((reqSkill) => {
      const hasSkill = helper.skills?.some(
        (s) => s.toLowerCase() === reqSkill.toLowerCase()
      );
      if (hasSkill) matchedSkills.push(reqSkill);
    });
    const skillRatio = matchedSkills.length / helpRequest.requiredSkills.length;
    skillScore = (categoryMatch ? 50 : 0) + skillRatio * 50;
  } else {
    skillScore = categoryMatch ? 100 : (helper.skills?.length > 0 ? 40 : 10);
  }

  // 2. Language Score (0 - 100)
  let languageScore = 20;
  const prefLang = helpRequest.preferredLanguage || 'Hindi';
  const speaksPreferred = helper.languages?.some(
    (l) => l.toLowerCase() === prefLang.toLowerCase()
  );
  if (speaksPreferred) {
    languageScore = 100;
  } else if (
    helper.languages?.some((l) => ['hindi', 'english'].includes(l.toLowerCase()))
  ) {
    languageScore = 60;
  }

  // 3. Distance Score (0 - 100)
  let distanceScore = 50;
  let distanceKm = null;
  const reqCoords = helpRequest.location?.coordinates;
  const helperCoords = helper.location?.coordinates;

  if (
    reqCoords &&
    helperCoords &&
    reqCoords.length === 2 &&
    helperCoords.length === 2 &&
    !helper.hideLiveLocation
  ) {
    distanceKm = calculateDistanceKm(
      reqCoords[1],
      reqCoords[0],
      helperCoords[1],
      helperCoords[0]
    );
  }

  const isSameCity =
    helper.currentCity &&
    helpRequest.city &&
    helper.currentCity.toLowerCase() === helpRequest.city.toLowerCase();

  if (distanceKm !== null) {
    if (distanceKm <= 5) distanceScore = 100;
    else if (distanceKm <= 15) distanceScore = 85;
    else if (distanceKm <= 30) distanceScore = 70;
    else if (distanceKm <= 50) distanceScore = 55;
    else distanceScore = Math.max(10, Math.round(55 - (distanceKm - 50) * 0.4));
  } else if (isSameCity) {
    distanceScore = 80;
    distanceKm = 4.5; // Approximate city distance
  } else {
    distanceScore = 25;
  }

  // 4. Trust Score (0 - 100)
  const trustScore = Math.max(0, Math.min(100, helper.trustScore || 80));

  // 5. Availability Score (0 - 100)
  let availabilityScore = 100;
  if (helper.availability === 'Busy') availabilityScore = 40;
  if (helper.availability === 'Unavailable') availabilityScore = 0;

  // Final Weighted Match Score
  const rawScore =
    0.35 * skillScore +
    0.25 * languageScore +
    0.2 * distanceScore +
    0.1 * trustScore +
    0.1 * availabilityScore;

  const matchScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Generate reason explanation
  const reasons = [];
  if (categoryMatch) reasons.push(`Specializes in ${helpRequest.category}`);
  if (matchedSkills.length > 0) reasons.push(`Matches skills: ${matchedSkills.join(', ')}`);
  if (speaksPreferred) reasons.push(`Speaks ${prefLang}`);
  if (isSameCity || (distanceKm && distanceKm <= 20)) {
    reasons.push(distanceKm ? `Within ~${distanceKm} km in ${helper.currentCity}` : `In ${helper.currentCity}`);
  }
  if (helper.trustScore >= 85) reasons.push(`High trust score (${helper.trustScore}%)`);
  if (helper.helpCompletedCount > 0) reasons.push(`${helper.helpCompletedCount} people helped`);

  const reason = reasons.length > 0 ? reasons.join(' • ') : 'Community member willing to assist';

  return {
    helper,
    matchScore,
    breakdown: {
      skillScore: Math.round(skillScore),
      languageScore: Math.round(languageScore),
      distanceScore: Math.round(distanceScore),
      trustScore: Math.round(trustScore),
      availabilityScore: Math.round(availabilityScore),
    },
    distanceKm,
    matchingSkills: matchedSkills,
    reason,
  };
}

module.exports = {
  calculateDistanceKm,
  computeHelperMatch,
};
