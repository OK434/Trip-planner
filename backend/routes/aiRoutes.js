const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
    try {
        const { budget, includeFlights, date, activities, country } = req.body;

        if (!country || !date || !budget) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const activitiesText = Array.isArray(activities)
            ? activities.join(', ')
            : activities || "general tourism";

const prompt = `
Create 3 detailed and practical travel plans.

Destination: ${country}
Duration: ${date} days
Budget: ${budget} USD (${includeFlights ? "including flights" : "excluding flights"})
Interests: ${activitiesText}

IMPORTANT:
- Plans must be realistic and based on real places.
- Include famous attractions, restaurants, and activities.
- Each activity MUST include:
  - real place name
  - short description
  - estimated cost in USD
  - booking link OR official website OR Instagram page (if available)

- Each day must include:
  - morning, afternoon, evening
  - total daily estimated budget

- Keep descriptions short (max 1 line).

Return ONLY pure JSON (no markdown, no text outside JSON).

FORMAT:

{
  "plans": [
    {
      "title": "Short attractive title",
      "totalEstimatedBudget": number,
      "days": [
        {
          "day": 1,
          "location": "City or area",
          "dailyBudget": number,
          "activities": [
            {
              "time": "Morning | Afternoon | Evening",
              "name": "Place name",
              "description": "Short description",
              "estimatedCost": number,
              "bookingLink": "URL (official site OR booking page OR Instagram)"
            }
          ]
        }
      ]
    }
  ]
}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            return res.json({ raw: text });
        }

        res.json({
            success: true,
            plans: data?.plans || []
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating plan" });
    }
});

module.exports = router;