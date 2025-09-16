// This utility generates a unique number for letters
// Example: OL-2024-XXXX for Offer Letter, EL-2024-XXXX for Experience Letter
export const generateLetterNumber = async (model, prefix) => {
    const year = new Date().getFullYear();
    const fullPrefix = `${prefix}-${year}`;
    
    const lastLetter = await model.findOne({ letterNumber: new RegExp(`^${fullPrefix}`) })
        .sort({ createdAt: -1 });

    let newSequence = 1;
    if (lastLetter) {
        const lastSequence = parseInt(lastLetter.letterNumber.split('-')[2], 10);
        newSequence = lastSequence + 1;
    }
    
    return `${fullPrefix}-${String(newSequence).padStart(4, '0')}`;
};