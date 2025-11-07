const Challenge = require('../models/challengeModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const cloudinaryController = require('./cloudinarycontroller');
const { getValuesFromToken } = require('../services/jwt');
const Ranking = require('../models/rankingModel');

exports.getAllChallanges = async (req, res) => {
    try {
        const challenges = await Challenge.find();

        if (!challenges) {
            return res.status(404).json({ message: 'No challenges found' });
        }

        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching challenges', error });
    }
}

exports.getChallangeById = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.status(200).json(challenge);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching challenge', error });
    }
}

exports.createChallange = async (req, res) => {
    const { title, description, instructions, points } = req.body;
    try {
        const newChallenge = new Challenge({
            title,
            description,
            instructions,
            points
        });
        await newChallenge.save();
        res.status(201).json(newChallenge);
    } catch (error) {
        res.status(500).json({ message: 'Error creating challenge', error });
    }

}

exports.deleteChallange = async (req, res) => {
    try {
        const challenge = await Challenge.findByIdAndDelete(req.params.id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.status(204).json({ message: 'Challenge deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting challenge', error });
    }
}

exports.submitEntry = async (req, res) => {
    const token = getValuesFromToken(req);
    const challengeId = req.params.challengeId || req.body.challengeId;
    const { description } = req.body;

    try {
        if (!token?.id) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        const user = await User.findById(token.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!challengeId) {
            return res.status(400).json({ message: 'challengeId is required (params or body)' });
        }
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // New: Prevent re-submission if user is already recorded as a completor
        const requesterIdStr = String(token.id);
        const completors = (challenge.completors || []).map(c => String(c));
        if (completors.includes(requesterIdStr)) {
            return res.status(400).json({ message: 'User has already completed/submitted this challenge' });
        }

        // Prevent duplicate submissions: one submission per user per challenge (db-level guard)
        const existingSubmission = await Submission.findOne({ userId: token.id, challengeId: challenge._id });
        if (existingSubmission) {
            return res.status(400).json({ message: 'User has already submitted an entry to this challenge' });
        }

        // Require proof (file or proof URL) only after duplicate check to avoid unnecessary uploads
        if (!req.file && !req.body.proof) {
            return res.status(400).json({ message: 'Image proof is required' });
        }

        let proofUrl = null;
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const mockRes = {
                    status: (code) => ({
                        json: (data) => {
                            if (code === 200) resolve(data);
                            else reject(data);
                        }
                    })
                };
                cloudinaryController.upToCloudinary(req, mockRes);
            });
            proofUrl = uploadResult?.imageUrl || null;
        } else {
            proofUrl = req.body.proof;
        }

        const newSubmission = {
            userId: token.id,
            challengeId,
            username: user.username,
            proof: proofUrl,
            description
        };

        const created = await Submission.create(newSubmission);

        // record user as a completor on the challenge (avoid duplicates)
        try {
            const userId = token.id;
            if (challenge) {
                const existing = (challenge.completors || []).map(c => c?.toString());
                if (!existing.includes(String(userId))) {
                    challenge.completors = [...(challenge.completors || []), userId];
                    await challenge.save();
                }
            }
        } catch (err) {
            console.error('Error updating challenge completors:', err);
            // continue — don't fail the submission if completor update fails
        }

        let updatedRanking = null;
        try {
            const pointsToAdd = Number(challenge.points) || 0;
            let ranking = await Ranking.findOne({ userId: token.id });

            if (ranking) {
                ranking.points = (Number(ranking.points) || 0) + pointsToAdd;
                const newRank = Ranking.getRankByPoints(ranking.points);
                if (newRank) ranking.rank = newRank;
                await ranking.save();
            } else {
                const initialPoints = pointsToAdd;
                const initialRank = Ranking.getRankByPoints(initialPoints) || 'Bronze';
                ranking = await Ranking.create({ userId: token.id, points: initialPoints, rank: initialRank });
            }

            updatedRanking = ranking;
        } catch (err) {
            console.error('Error updating ranking after submission:', err);
        }

        res.status(201).json({ message: 'Submission successful', submission: created, ranking: updatedRanking });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting entry', error });
    }
};