const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

exports.resolveDoubt = async (req, res) => {
    try {
        const { text } = req.body;
        const file = req.files?.file;
        const userId = req.user.id;

        // Validate input
        if (!text && !file) {
            return res.status(400).json({ message: "Text or file is required" });
        }

        // Validate API key
        console.log("Checking Gemini API Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Google Gemini API key is not configured" });
        }

        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare prompt
        const prompt = `
You are an expert academic tutor. The student has submitted a doubt, which may include text, an image, or a PDF. Your task is to provide a clear, step-by-step explanation of how to solve the problem without giving the final answer. Focus on the process, breaking it down into simple, numbered steps. Use the format "Step X: [Description]" for each step. Do not include the final result or solution. If the input is an image or PDF, extract relevant information (e.g., equations, diagrams) before providing steps. If the input is unclear, provide a message requesting clarification starting with "Clarification Needed: [Message]".

**Important**: Return the response as plain text, not JSON. Format steps as a numbered list (e.g., "Step 1: ...", "Step 2: ..."). If clarification is needed, return only the clarification message starting with "Clarification Needed:". Do not include any JSON structure or code block markers (e.g., \`\`\`json).

Input:
- Text: ${text || "None"}
- File: ${file ? file[0].originalname : "None"}
        `;

        // Prepare content for Gemini
        const content = [];
        if (text) {
            content.push({ text });
        }
        if (file) {
            const filePath = path.join(__dirname, "../", "src/public/uploads/doubts", file[0].filename);
            console.log("Multer File Path:", file[0].path);
            console.log("Resolved File Path:", filePath);
            const mimeType = file[0].mimetype;
            if (!fs.existsSync(filePath)) {
                console.error("File not found at:", filePath);
                return res.status(500).json({ message: `Uploaded file not found at ${filePath}` });
            }
            const fileData = fs.readFileSync(filePath);
            if (mimeType === "application/pdf" || mimeType.startsWith("image/")) {
                content.push({
                    inlineData: {
                        data: fileData.toString("base64"),
                        mimeType
                    }
                });
            } else {
                try {
                    fs.unlinkSync(filePath);
                } catch (cleanupError) {
                    console.error("File cleanup error:", cleanupError);
                }
                return res.status(400).json({ message: "Unsupported file type. Only JPEG, PNG, or PDF allowed." });
            }
            // Clean up file
            try {
                fs.unlinkSync(filePath);
                console.log("File deleted:", filePath);
            } catch (cleanupError) {
                console.error("File cleanup error:", cleanupError);
            }
        }

        // Call Gemini API
        const result = await model.generateContent(content.concat([{ text: prompt }]));
        const responseText = await result.response.text();
        console.log("Raw Gemini Response:", responseText);

        // Process the response as plain text
        let response = responseText.trim();
        if (!response) {
            response = "No guidance provided. Please try a clearer problem statement.";
        }

        res.status(200).json({
            message: "Doubt resolved successfully",
            response // Return plain text instead of structured JSON
        });
    } catch (error) {
        console.error("Doubt resolver error:", error);
        res.status(500).json({ message: "Error resolving doubt", error: error.message });
    }
};

module.exports = exports;