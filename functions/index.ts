import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";
import Stripe from "stripe";
import { Resend } from "resend";
import { sendIdeaGeneratedEmail, sendBuildCompleteEmail, sendSubscriptionUpdateEmail } from "./lib/email/notifications";

admin.initializeApp();
const db = admin.firestore();

// IMPORTANT: Set these in your Firebase environment configuration
// firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
// firebase functions:config:set stripe.secret="YOUR_STRIPE_SECRET_KEY"
// firebase functions:config:set stripe.webhook_secret="YOUR_STRIPE_WEBHOOK_SECRET"
// firebase functions:config:set resend.key="YOUR_RESEND_API_KEY"
// firebase functions:config:set stripe.founder_price_id="YOUR_FOUNDER_PRICE_ID"
// firebase functions:config:set stripe.team_price_id="YOUR_TEAM_PRICE_ID"
// firebase functions:config:set stripe.enterprise_price_id="YOUR_ENTERPRISE_PRICE_ID"
// firebase functions:config:set app.url="https://your-app-url.com"

const geminiAI = new GoogleGenAI({apiKey: functions.config().gemini.key});
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2024-06-20",
});
const resend = new Resend(functions.config().resend.key);

const FREE_PLAN_LIMITS = {
  ideasPerMonth: 5,
  buildsPerMonth: 2,
  maxActiveProjects: 1,
  storageLimit: 1, // GB
  bandwidthLimit: 5, // GB
  seats: 1,
};

const FOUNDER_PLAN_LIMITS = {
  ideasPerMonth: 50,
  buildsPerMonth: 20,
  maxActiveProjects: 5,
  storageLimit: 10,
  bandwidthLimit: 50,
  seats: 1,
};

const TEAM_PLAN_LIMITS = {
  ideasPerMonth: 1000,
  buildsPerMonth: 100,
  maxActiveProjects: 20,
  storageLimit: 50,
  bandwidthLimit: 250,
  seats: 5,
};

const ENTERPRISE_PLAN_LIMITS = {
    ideasPerMonth: -1, // Unlimited
    buildsPerMonth: -1, // Unlimited
    maxActiveProjects: -1, // Unlimited
    storageLimit: 1000,
    bandwidthLimit: 5000,
    seats: 50, // Default, can be customized
};

const PLAN_CONFIG: { [key: string]: { name: string, limits: any } } = {
    [functions.config().stripe.founder_price_id]: { name: 'founder', limits: FOUNDER_PLAN_LIMITS },
    [functions.config().stripe.team_price_id]: { name: 'team', limits: TEAM_PLAN_LIMITS },
    [functions.config().stripe.enterprise_price_id]: { name: 'enterprise', limits: ENTERPRISE_PLAN_LIMITS },
};

const cors = (req: functions.https.Request, res: functions.Response) => {
    res.set("Access-Control-Allow-Origin", "*"); 
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "GET, POST");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.set("Access-Control-Max-Age", "3600");
        res.status(204).send("");
        return true;
    }
    return false;
}

const verifyToken = async (req: functions.https.Request): Promise<string> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new functions.https.HttpsError('unauthenticated', 'No token provided.');
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
};

const verifyAdmin = async (req: functions.https.Request): Promise<string> => {
    const uid = await verifyToken(req);
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }
    return uid;
};

const generateReferralCode = (uid: string): string => {
    return uid.substring(0, 8).toUpperCase();
};

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email } = user;
    const userRef = db.collection("users").doc(uid);

    const newUser = {
        id: uid,
        email: email || "",
        plan: "free",
        usage: { ideasGenerated: 0, buildsStarted: 0, activeProjects: 0, storageUsed: 0, bandwidthUsed: 0 },
        limits: FREE_PLAN_LIMITS,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastResetAt: admin.firestore.FieldValue.serverTimestamp(),
        isNewUser: true,
        role: "owner", // Default to owner for their own projects/team
        status: "active",
        referrals: {
            referralCode: generateReferralCode(uid),
            referredCount: 0,
        },
    };

    try {
        await userRef.set(newUser);
        console.log(`Successfully created user document for ${uid}`);
    } catch (error) {
        console.error(`Error creating user document for ${uid}:`, error);
    }
});

export const generateIdea = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const { userId } = req.body;
    if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
    }

    try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        await userRef.update({
            "usage.ideasGenerated": admin.firestore.FieldValue.increment(1)
        });

        const prompt = `Generate a creative and viable SaaS product idea. Return ONLY a single, valid JSON object with the following schema. Do not include markdown formatting.`;
        
        const response = await geminiAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      problem: { type: Type.STRING },
                      solution: { type: Type.STRING },
                      targetAudience: { type: Type.STRING },
                      techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                      features: { type: Type.ARRAY, items: { type: Type.STRING } },
                      monetization: { type: Type.STRING },
                      marketSize: { type: Type.STRING },
                      competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
                      slavkoScore: { type: Type.NUMBER },
                    },
                    required: ["title", "description", "slavkoScore"]
                }
            }
        });

        const ideaData = JSON.parse(response.text);

        const docRef = await db.collection("ideas").add({
            ...ideaData,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            userId: userId,
        });

        await sendIdeaGeneratedEmail(resend, ideaData, userDoc.data()?.email);

        res.status(200).json({ id: docRef.id, idea: {id: docRef.id, ...ideaData} });

    } catch (error) {
        console.error("Error generating idea with Gemini:", error);
        res.status(500).json({ error: "Failed to generate idea" });
    }
});

export const startBuild = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;

    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const { ideaId, target, userId } = req.body;
    if (!ideaId || !userId) {
        res.status(400).json({ error: "ideaId and userId are required" });
        return;
    }

    const userRef = db.collection("users").doc(userId);
    await userRef.update({
        "usage.buildsStarted": admin.firestore.FieldValue.increment(1)
    });

    const validTargets = ["Vercel", "Firebase Hosting"];
    const deploymentTarget = target && validTargets.includes(target) ? target : "Vercel";

    const ideaRef = db.collection("ideas").doc(ideaId);
    const buildRef = db.collection("builds").doc();

    try {
        await db.runTransaction(async (transaction) => {
            const ideaDoc = await transaction.get(ideaRef);
            if (!ideaDoc.exists) {
                throw new Error("Idea document not found!");
            }
            const ideaData = ideaDoc.data();
            if(!ideaData) {
                throw new Error("Idea data is empty!");
            }

            transaction.update(ideaRef, { status: "building" });
            
            transaction.set(buildRef, {
                ideaId: ideaId,
                ideaTitle: ideaData.title,
                status: "queued",
                startedAt: admin.firestore.FieldValue.serverTimestamp(),
                logs: [`Build process initiated for deployment to ${deploymentTarget}...`],
                deploymentTarget: deploymentTarget,
                userId: userId, // Link build to user
            });
        });

        res.status(200).json({ success: true, buildId: buildRef.id });

    } catch (error) {
        console.error("Error starting build:", error);
        res.status(500).json({ error: "Failed to start build process." });
    }
});

export const onBuildUpdate = functions.firestore
    .document('builds/{buildId}')
    .onUpdate(async (change) => {
        const before = change.before.data();
        const after = change.after.data();

        if (before.status !== 'success' && after.status === 'success') {
             const userId = after.userId;
             if (!userId) return;

             const userRef = db.collection("users").doc(userId);
             await userRef.update({
                'usage.activeProjects': admin.firestore.FieldValue.increment(1),
                'latestProjectUrl': after.stagingUrl || after.productionUrl || null
             });
        }

        if (before.status !== after.status && (after.status === 'success' || after.status === 'failed')) {
            console.log(`Build ${change.after.id} completed with status: ${after.status}`);
            
            const userId = after.userId;
            if (!userId) {
                console.error("No userId found on build document. Cannot send email.");
                return;
            }
            const userDoc = await db.collection("users").doc(userId).get();
            if (!userDoc.exists) {
                 console.error(`User ${userId} not found. Cannot send email.`);
                 return;
            }
            const userEmail = userDoc.data()?.email;

            await sendBuildCompleteEmail(resend, {
                ideaTitle: after.ideaTitle,
                status: after.status,
                stagingUrl: after.stagingUrl,
            }, userEmail);
        }
    });


export const createCheckoutSession = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;

    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    try {
        const { plan, userId } = req.body;

        if (!plan || !userId) {
            return res.status(400).json({ error: "Plan and userId are required."});
        }
        
        const validPlans = ['founder', 'team', 'enterprise'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({ error: `Invalid plan specified. Received: ${plan}` });
        }

        const priceId = functions.config().stripe[`${plan}_price_id`];

        if (!priceId) {
             functions.logger.error(`Stripe price ID not found for plan '${plan}'. Looked for 'stripe.${plan}_price_id' in Firebase config.`);
             return res.status(500).json({ error: "Server configuration error for pricing." });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: "subscription",
            success_url: `${functions.config().app.url || 'http://localhost:5173'}/#/dashboard?success=true`,
            cancel_url: `${functions.config().app.url || 'http://localhost:5173'}/#/pricing?canceled=true`,
            metadata: {
                userId,
                plan,
            },
        });

        return res.status(200).json({ sessionId: session.id });

    } catch (error: any) {
        console.error("Stripe checkout session creation failed:", error);
        return res.status(500).json({ error: error.message });
    }
});

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = functions.config().stripe.webhook_secret;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const dataObject = event.data.object as any;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = dataObject as Stripe.Checkout.Session;
                const { userId, plan } = session.metadata || {};
                if (!userId || !plan) throw new Error("Missing metadata in session");
                
                const userDoc = await db.collection('users').doc(userId).get();
                if(!userDoc.exists) throw new Error(`User ${userId} not found.`);

                const priceId = session.line_items?.data[0]?.price?.id;
                const planInfo = PLAN_CONFIG[priceId || ""];
                
                await db.collection('users').doc(userId).update({
                    plan: plan,
                    limits: planInfo?.limits || FREE_PLAN_LIMITS,
                    stripeCustomerId: session.customer,
                    subscriptionId: session.subscription,
                    subscriptionStatus: 'active',
                });
                await sendSubscriptionUpdateEmail(resend, {planName: plan, status: 'active'}, userDoc.data()?.email);
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = dataObject as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const users = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
                if (users.empty) throw new Error(`User not found for customer ${customerId}`);
                const userDoc = users.docs[0];

                const priceId = subscription.items.data[0]?.price.id;
                const planInfo = PLAN_CONFIG[priceId];
                
                await userDoc.ref.update({
                    plan: planInfo ? planInfo.name : 'free',
                    limits: planInfo ? planInfo.limits : FREE_PLAN_LIMITS,
                    subscriptionStatus: subscription.status,
                });
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = dataObject as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const users = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
                if (users.empty) break; 
                const userDoc = users.docs[0];

                await userDoc.ref.update({
                    plan: 'free',
                    limits: FREE_PLAN_LIMITS,
                    subscriptionStatus: 'canceled',
                    subscriptionId: admin.firestore.FieldValue.delete(),
                });
                await sendSubscriptionUpdateEmail(resend, {planName: 'Free', status: 'canceled'}, userDoc.data()?.email);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('Error handling webhook event:', error);
        return res.status(500).json({ error: 'Webhook handler failed.' });
    }

    res.status(200).send();
});


export const checkLimits = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    
    try {
        const { userId, action } = req.body;
        if (!userId || !action) {
            res.status(400).json({ error: "userId and action are required" });
            return;
        }

        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const user = userDoc.data();
        if (!user) {
            throw new Error("User data is empty");
        }
        
        const now = new Date();
        const updates: { [key: string]: any } = {};
        
        // Monthly reset
        const lastReset = (user.lastResetAt as admin.firestore.Timestamp).toDate();
        if (now.getUTCMonth() !== lastReset.getUTCMonth() || now.getUTCFullYear() !== lastReset.getUTCFullYear()) {
            updates["usage.ideasGenerated"] = 0;
            updates["usage.buildsStarted"] = 0;
            updates.lastResetAt = admin.firestore.Timestamp.fromDate(now);
            user.usage.ideasGenerated = 0;
            user.usage.buildsStarted = 0;
        }
        
        if (Object.keys(updates).length > 0) {
            await userRef.update(updates);
        }

        let canProceed = true;
        let reason = "";
        const ideasLimit = user.limits.ideasPerMonth;
        const buildsLimit = user.limits.buildsPerMonth;

        switch (action) {
            case "generate_idea":
                if (ideasLimit !== -1 && user.usage.ideasGenerated >= ideasLimit) {
                    canProceed = false;
                    reason = `You've used ${user.usage.ideasGenerated}/${ideasLimit} ideas this month. Upgrade for more.`;
                }
                break;
            case "start_build":
                if (buildsLimit !== -1 && user.usage.buildsStarted >= buildsLimit) {
                    canProceed = false;
                    reason = `You've used ${user.usage.buildsStarted}/${buildsLimit} builds this month. Upgrade for more.`;
                }
                break;
        }

        res.status(200).json({
            canProceed,
            reason,
            usage: user.usage,
            limits: user.limits,
            plan: user.plan,
        });

    } catch (error) {
        console.error("Error checking limits:", error);
        res.status(500).json({ error: "Failed to check limits." });
    }
});

// =================================================================================
//  GROWTH PACK FUNCTIONS
// =================================================================================

export const socialShareReward = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        const uid = await verifyToken(req);
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            'limits.buildsPerMonth': admin.firestore.FieldValue.increment(2)
        });
        res.status(200).json({ success: true, bonus: 2 });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

export const getLeaderboard = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        const snapshot = await db.collection('users')
            .orderBy('usage.buildsStarted', 'desc')
            .limit(10)
            .get();
        
        const leaders = snapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email,
            builds: doc.data().usage.buildsStarted,
            deployments: doc.data().usage.activeProjects,
            fastestBuild: doc.data().analytics?.fastestBuild || 1.8 // Mock data
        }));

        res.status(200).json(leaders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
});

export const getGlobalDeployments = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        // In a real app, you'd query recent successful builds that have location data.
        // For this demo, we'll return mock data.
        const mockDeployments = [
            { id: '1', longitude: 10, latitude: 52, project: 'AI-CRM', user: 'user1' }, // Europe
            { id: '2', longitude: 78, latitude: 35, project: 'SaaS Kit', user: 'user2' }, // US West
            { id: '3', longitude: 95, latitude: 39, project: 'Data Viz Tool', user: 'user3' }, // US East
            { id: '4', longitude: 139, latitude: 35, project: 'Fintech App', user: 'user4' }, // Japan
            { id: '5', longitude: 151, latitude: -33, project: 'E-commerce', user: 'user5' }, // Australia
        ].map(d => ({...d, longitude: (d.longitude/180)*50+25, latitude: (-d.latitude/90)*50+50})); // Normalize for simple % based display
        
        res.status(200).json(mockDeployments);

    } catch(error) {
        res.status(500).json({ error: 'Failed to fetch deployments.' });
    }
});


// =================================================================================
//  ADMIN FUNCTIONS
// =================================================================================

const handleAdminError = (error: any, res: functions.Response) => {
    if (error instanceof functions.https.HttpsError) {
        res.status(error.httpErrorCode.status).json({ error: error.message });
    } else {
        console.error("Admin function error:", error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
};

export const adminGetStats = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        await verifyAdmin(req);
        
        const usersSnapshot = await db.collection("users").get();
        const ideasSnapshot = await db.collection("ideas").get();
        const buildsSnapshot = await db.collection("builds").where("status", "==", "success").get();
        
        const users = usersSnapshot.docs.map(doc => doc.data());
        
        const mrr = users.reduce((acc, user) => {
            if (user.plan === 'founder') return acc + 49;
            if (user.plan === 'team') return acc + 99;
            if (user.plan === 'enterprise') return acc + 999; // Example enterprise value
            return acc;
        }, 0);

        const stats = {
            totalUsers: users.length,
            mrr,
            ideasGenerated: ideasSnapshot.size,
            buildsCompleted: buildsSnapshot.size,
        };
        
        res.status(200).json(stats);
    } catch (error) {
        handleAdminError(error, res);
    }
});

export const adminGetUsers = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        await verifyAdmin(req);
        const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(users);
    } catch (error) {
        handleAdminError(error, res);
    }
});

export const adminSuspendUser = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        await verifyAdmin(req);
        const { userId, suspend } = req.body;
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }

        await admin.auth().updateUser(userId, { disabled: suspend });
        await db.collection('users').doc(userId).update({ status: suspend ? 'suspended' : 'active' });

        res.status(200).json({ success: true, status: suspend ? 'suspended' : 'active' });
    } catch (error) {
        handleAdminError(error, res);
    }
});

// Mock cost functions for the validation phase
export const adminGetVercelCosts = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        await verifyAdmin(req);
        res.status(200).json({ cost: 15.78 + Math.random() * 5 });
    } catch (error) { handleAdminError(error, res); }
});
export const adminGetKVCosts = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        await verifyAdmin(req);
        res.status(200).json({ cost: 2.34 + Math.random() });
    } catch (error) { handleAdminError(error, res); }
});
export const adminGetGeminiCosts = functions.https.onRequest(async (req, res) => {
    if (cors(req, res)) return;
    try {
        await verifyAdmin(req);
        res.status(200).json({ cost: 42.11 + Math.random() * 10 });
    } catch (error) { handleAdminError(error, res); }
});
