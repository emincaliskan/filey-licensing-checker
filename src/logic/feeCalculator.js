/**
 * Calculate the fee for a licence, applying any applicable discounts.
 *
 * @param {number|null} baseFee - The standard fee
 * @param {object} discounts - The discount rules from borough data
 * @param {object} flags - User-selected flags { accredited_landlord, epc_rating }
 * @returns {{ baseFee, discountAmount, finalFee, appliedDiscounts }}
 */
export function calculateFee(baseFee, discounts, flags) {
  if (baseFee === null || baseFee === undefined) {
    return {
      baseFee: null,
      discountAmount: 0,
      finalFee: null,
      appliedDiscounts: [],
      feeNote: 'Contact council for current fee',
    };
  }

  let discountAmount = 0;
  const appliedDiscounts = [];

  if (!discounts || !flags) {
    return { baseFee, discountAmount: 0, finalFee: baseFee, appliedDiscounts };
  }

  // Accredited landlord discount
  if (flags.accredited_landlord && discounts.accredited_landlord) {
    discountAmount += discounts.accredited_landlord;
    appliedDiscounts.push({
      reason: 'Accredited landlord',
      amount: discounts.accredited_landlord,
    });
  }

  // EPC discounts - check for specific rating or generic abc
  if (flags.epc_abc) {
    if (discounts.epc_abc) {
      discountAmount += discounts.epc_abc;
      appliedDiscounts.push({
        reason: 'EPC rating A/B/C',
        amount: discounts.epc_abc,
      });
    } else if (flags.epc_rating === 'B' && discounts.epc_b) {
      discountAmount += discounts.epc_b;
      appliedDiscounts.push({
        reason: 'EPC rating B',
        amount: discounts.epc_b,
      });
    } else if (flags.epc_rating === 'C' && discounts.epc_c) {
      discountAmount += discounts.epc_c;
      appliedDiscounts.push({
        reason: 'EPC rating C',
        amount: discounts.epc_c,
      });
    } else if (discounts.epc_b) {
      // Default to the better discount if no specific rating
      discountAmount += discounts.epc_b;
      appliedDiscounts.push({
        reason: 'EPC rating A/B/C',
        amount: discounts.epc_b,
      });
    }
  }

  // Multiple flats discount
  if (flags.multiple_flats_same_block && discounts.multiple_flats_same_block) {
    discountAmount += discounts.multiple_flats_same_block;
    appliedDiscounts.push({
      reason: 'Multiple flats in same block',
      amount: discounts.multiple_flats_same_block,
    });
  }

  const finalFee = Math.max(0, baseFee - discountAmount);

  return { baseFee, discountAmount, finalFee, appliedDiscounts };
}
