// utils/generateCertificateNumber.js
import CertificateRequest from '../models/CertificateRequest.js';

export const generateCertificateNumber = async () => {
    const prefix = 'TDS008';
    const currentYear = new Date().getFullYear();

    // 1. Is saal ka sabse aakhri certificate number dhoondein
    const lastRequest = await CertificateRequest.findOne({
        // Sirf un numbers ko dhoondo jo 'TDS008-YYYY-' se shuru hote hain
        certificateNumber: { $regex: `^${prefix}-${currentYear}-` }
    })
    .sort({ certificateNumber: -1 }); // Number ke hisaab se descending sort karein taaki sabse bada number upar aaye

    let nextSequence = 1; // Default sequence 1 hai (agar is saal ka pehla certificate hai)

    if (lastRequest && lastRequest.certificateNumber) {
        // 2. Agar pichla number mila, to usse sequence nikaalein
        const lastSequence = parseInt(lastRequest.certificateNumber.split('-')[2], 10);
        nextSequence = lastSequence + 1;
    }

    // 3. Naye sequence ko 3-digit format mein pad karein (e.g., 1 -> '001', 12 -> '012')
    const paddedSequence = String(nextSequence).padStart(3, '0');

    // 4. Poora number banakar return karein
    return `${prefix}-${currentYear}-${paddedSequence}`;
};