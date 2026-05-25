const DISCOUNT_TIERS = [
  { members: 10, discount: 25 },
  { members: 5, discount: 15 },
  { members: 3, discount: 10 },
  { members: 2, discount: 5 },
  { members: 1, discount: 0 },
];

export const calculateDiscount = (totalMembers = 1) => {
  const memberCount = Math.max(1, Number(totalMembers || 1));
  return DISCOUNT_TIERS.find((tier) => memberCount >= tier.members)?.discount || 0;
};

export const getNextDiscountMilestone = (totalMembers = 1) => {
  const memberCount = Math.max(1, Number(totalMembers || 1));
  const ascendingTiers = [...DISCOUNT_TIERS].sort((a, b) => a.members - b.members);
  const nextTier = ascendingTiers.find((tier) => tier.members > memberCount);

  if (!nextTier) {
    return {
      nextMembers: null,
      nextDiscount: null,
      membersNeeded: 0,
      message: "Maximum discount unlocked",
    };
  }

  return {
    nextMembers: nextTier.members,
    nextDiscount: nextTier.discount,
    membersNeeded: nextTier.members - memberCount,
    message: `${nextTier.members - memberCount} more user${nextTier.members - memberCount === 1 ? "" : "s"} needed to unlock ${nextTier.discount}%`,
  };
};

export const getDiscountTier = (totalMembers = 1) => {
  const memberCount = Math.max(1, Number(totalMembers || 1));
  return DISCOUNT_TIERS.find((tier) => memberCount >= tier.members)?.members || 1;
};
