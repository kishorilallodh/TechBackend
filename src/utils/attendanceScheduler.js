// utils/attendanceScheduler.js (Complete Code)

import cron from 'node-cron';
import User from '../models/userModel.js';
import Attendance from '../models/Attendance.js';

// Helper function to get the start of the day (midnight)
const getStartOfDay = (date) => {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0); // Use UTC for consistency
    return start;
};

const markAbsentUsers = async () => {
    console.log(`[${new Date().toISOString()}] Running daily job to mark absent users...`);
    
    // 1. Kal ki date nikaalo (UTC time me)
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const dateToMark = getStartOfDay(yesterday);

    // 2. Weekend (Saturday/Sunday) par job na chalayein
    const dayOfWeek = dateToMark.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log(`Skipping absent marking for weekend: ${dateToMark.toISOString()}`);
        return;
    }

    try {
        // 3. Sabhi active users ko find karo (jinka role 'user' hai)
        const allUsers = await User.find({ role: 'user' }).select('_id');
        if (!allUsers.length) {
            console.log('No active users found to check for absence.');
            return;
        }
        const userIds = allUsers.map(user => user._id);

        // 4. Un users ko find karo jinhone kal attendance lagayi thi
        const presentUsers = await Attendance.find({
            date: dateToMark,
            user: { $in: userIds }
        }).select('user');
        const presentUserIds = new Set(presentUsers.map(att => att.user.toString()));

        // 5. Absent users ko find karo (jin users ne attendance nahi lagayi)
        const absentUserIds = userIds.filter(id => !presentUserIds.has(id.toString()));

        if (absentUserIds.length > 0) {
            const absentRecords = absentUserIds.map(userId => ({
                user: userId,
                date: dateToMark,
                status: 'Absent',
                workPlan: 'Auto-marked as Absent Because Employee not Mark Attendance!',
                clockInTime: dateToMark, 
            }));
            await Attendance.insertMany(absentRecords);
            console.log(`Successfully marked ${absentUserIds.length} users as absent for ${dateToMark.toISOString()}.`);
        } else {
            console.log(`All users marked their attendance for ${dateToMark.toISOString()}.`);
        }

    } catch (error) {
        console.error('Error in marking absent users:', error);
    }
};

// Roz subah 2 baje yeh job chalegi (server time ke hisaab se)
export const startAttendanceScheduler = () => {
    cron.schedule('0 2 * * *', markAbsentUsers, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Apne timezone ke hisaab se set karein
    });
    console.log('Attendance scheduler started. Will run every day at 2:00 AM.');
};