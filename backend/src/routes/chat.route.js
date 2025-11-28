const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
// Explicit model names to avoid v1/v1beta mismatch
const MODEL_CANDIDATES = [
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
    "models/gemini-pro",
];

const SYSTEM_PROMPT =
    "You are MilkyBloom store assistant. Be concise, friendly, and helpful about toys, orders, shipping, and store policies.";

router.post("/gemini", async (req, res) => {
    try {
        if (!GEMINI_KEY) {
            return res.status(503).json({
                success: false,
                message: "Gemini API key not configured",
            });
        }

        const { message, history = [] } = req.body || {};
        if (!message || typeof message !== "string") {
            return res
                .status(400)
                .json({ success: false, message: "message is required" });
        }

        // map history to Gemini format
        const formattedHistory = history
            .filter((h) => h?.content)
            .map((h) => ({
                role: h.role === "model" ? "model" : "user",
                parts: [{ text: String(h.content) }],
            }));

        // init model per request to allow fallback names
        const genAI = new GoogleGenerativeAI({
            apiKey: GEMINI_KEY,
            apiEndpoint: "https://generativelanguage.googleapis.com",
        });
        let chat = null;
        let lastErr = null;

        for (const name of MODEL_CANDIDATES) {
            try {
                const current = genAI.getGenerativeModel({ model: name });
                chat = current.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: SYSTEM_PROMPT }],
                        },
                        ...formattedHistory,
                    ],
                    generationConfig: {
                        maxOutputTokens: 200,
                    },
                });
                break;
            } catch (e) {
                lastErr = e;
            }
        }

        if (!chat) {
            throw lastErr || new Error("No Gemini model available");
        }

        const result = await chat.sendMessage(message);
        const reply = result?.response?.text?.() || "Sorry, I could not answer that.";

        return res.json({ success: true, reply });
    } catch (err) {
        const apiError =
            err?.response?.error?.message ||
            err?.response?.statusText ||
            err?.message ||
            JSON.stringify(err) ||
            "Unknown error";

        console.error("Gemini chat error:", apiError);

        return res.status(500).json({
            success: false,
            message: `Gemini service error: ${apiError}`,
        });
    }
});

module.exports = router;
