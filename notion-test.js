import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const notionIntegrationToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

// Middleware to enable CORS
app.use(cors({ origin: "https://notion-time.vercel.app/" })); // Replace with your frontend URL
app.use(express.json());

app.post("/save-to-notion", async (req, res) => {
    const { task, startTime, stopTime } = req.body;

    const notionUrl = "https://api.notion.com/v1/pages";
    const data = {
        parent: { database_id: databaseId },
        properties: {
            Name: { title: [{ text: { content: task } }] },
            Date: {
                date: {
                    start: new Date(startTime).toISOString(),
                    end: new Date(stopTime).toISOString(),
                },
            },
        },
    };

    try {
        const response = await fetch(notionUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${notionIntegrationToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            res.status(200).json({ message: "Task saved successfully." });
        } else {
            const errorDetails = await response.json();
            res.status(500).json({ error: "Failed to save task to Notion.", details: errorDetails });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
