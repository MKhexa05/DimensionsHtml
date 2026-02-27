import Fraction from 'fraction.js';

export function floatToFraction(num: number, precision = 16) {
  const roundedDecimal = Math.round(num * precision) / precision;
  const fraction = new Fraction(roundedDecimal).toFraction(true);

  const parts = fraction.split(' ');
  if (parts.length === 2) {
    const wholeNumber = parts[0];
    const [numerator, denominator] = parts[1].split('/');
    return { wholeNumber, numerator, denominator };
  } else if (fraction.includes('/')) {
    const [numerator, denominator] = fraction.split('/');
    return { numerator, denominator };
  } else {
    return { wholeNumber: fraction };
  }
}

export function formatDimension(inches: number, useFeet = false): string {
  if (inches === 0) return '0"';

  if (useFeet && inches >= 48) { // Only use feet for larger dimensions (like 4ft+)
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    if (remainingInches === 0) return `${feet}'`;
    
    const frac = floatToFraction(remainingInches);
    let inchPart = '';
    if (frac.wholeNumber && frac.wholeNumber !== '0') {
      inchPart += frac.wholeNumber;
    }
    if (frac.numerator && frac.denominator) {
      inchPart += `${inchPart ? ' ' : ''}${frac.numerator}/${frac.denominator}`;
    }
    return `${feet}'${inchPart}"`;
  }

  const frac = floatToFraction(inches);
  let value = '';
  if (frac.wholeNumber && (frac.wholeNumber !== '0' || !frac.numerator)) {
    value += frac.wholeNumber;
  }
  if (frac.numerator && frac.denominator) {
    const space = (value && value !== '0') ? ' ' : '';
    value += `${space}${frac.numerator}/${frac.denominator}`;
  }
  return (value || '0') + '"';
}
