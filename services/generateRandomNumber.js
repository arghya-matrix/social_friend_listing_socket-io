function generateRandomThreeDigitNumber() {
    // Generate a random number between 100 and 999 (inclusive)
    const min = 100;
    const max = 999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

module.exports = generateRandomThreeDigitNumber;