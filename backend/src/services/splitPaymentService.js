import { calculateDiscount, getDiscountTier, getNextDiscountMilestone } from "./discountService.js";

export const calculateSplitPayment = ({ productPrice = 0, totalMembers = 1 }) => {
  const members = Math.max(1, Number(totalMembers || 1));
  const originalPrice = Number(productPrice || 0);
  const discountPercentage = calculateDiscount(members);
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const finalDiscountedPrice = originalPrice - discountAmount;
  const perUserAmount = finalDiscountedPrice / members;

  return {
    originalPrice,
    discountPercentage,
    discountAmount: Number(discountAmount.toFixed(2)),
    finalDiscountedPrice: Number(finalDiscountedPrice.toFixed(2)),
    perUserAmount: Number(perUserAmount.toFixed(2)),
    discountTier: getDiscountTier(members),
    nextMilestone: getNextDiscountMilestone(members),
  };
};
