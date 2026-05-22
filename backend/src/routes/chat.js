import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, lang } = req.body;

    // ✅ Validation
    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    console.log("👤 User:", message);
    console.log("🌐 Lang:", lang);

    // 🔥 Detect explicit override from user (optional)
    const textLower = message.toLowerCase();
    const wantsHindi = /[\u0900-\u097F]/.test(message) || textLower.includes("hindi");
    const wantsGujarati = /[\u0A80-\u0AFF]/.test(message) || textLower.includes("gujarati");
    const wantsPunjabi = /[\u0A00-\u0A7F]/.test(message) || textLower.includes("punjabi");
    const wantsBengali = /[\u0980-\u09FF]/.test(message) || textLower.includes("bengali");
    const wantsEnglish = textLower.includes("english");

    // 🎯 FINAL LANGUAGE DECISION
    let finalLang = lang || "en";
    if (wantsHindi) finalLang = "hi";
    else if (wantsGujarati) finalLang = "gu";
    else if (wantsPunjabi) finalLang = "pa";
    else if (wantsBengali) finalLang = "bn";
    else if (wantsEnglish) finalLang = "en";

    // 🧠 SYSTEM PROMPT (STRICT + CONTROLLED)
    const prompts = {
      en: `You are AgroMitra AI, a smart farming assistant.
Rules:
- Reply ONLY in English
- Keep answers short and practical
- Use bullet points when helpful
- Avoid complex words
- Focus on real farming solutions`,
      hi: `आप AgroMitra AI हैं, एक स्मार्ट कृषि सहायक।
नियम:
- केवल हिंदी में उत्तर दें
- उत्तर छोटा, स्पष्ट और उपयोगी रखें
- बुलेट पॉइंट्स में जवाब दें
- कठिन शब्दों से बचें
- केवल किसान से संबंधित व्यावहारिक सलाह दें`,
      gu: `તમે એગ્રોમિત્રા AI છો, સ્માર્ટ કૃષિ સહાયક.
નિયમો:
- ફક્ત ગુજરાતીમાં જ જવાબ આપો
- જવાબો ટૂંકા અને વ્યવહારુ રાખો
- બુલેટ પોઇન્ટ્સનો ઉપયોગ કરો
- જટિલ શબ્દો ટાળો
- ફક્ત ખેતીના ઉકેલો પર ધ્યાન કેન્દ્રિત કરો`,
      pa: `ਤੁਸੀਂ ਐਗਰੋਮਿਤਰਾ AI ਹੋ, ਇੱਕ ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ।
ਨਿਯਮ:
- ਸਿਰਫ਼ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ
- ਜਵਾਬ ਛੋਟੇ ਅਤੇ ਵਿਵਹਾਰਕ ਰੱਖੋ
- ਬੁਲੇਟ ਪੁਆਇੰਟਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ
- ਗੁੰਝਲਦਾਰ ਸ਼ਬਦਾਂ ਤੋਂ ਬਚੋ
- ਸਿਰਫ਼ ਖੇਤੀ ਦੇ ਹੱਲਾਂ 'ਤੇ ਧਿਆਨ ਦਿਓ`,
      bn: `আপনি এগ্রোमित्रा এআই, একজন স্মার্ট কৃষি সহকারী।
নিয়মাবলী:
- শুধুমাত্র বাংলায় উত্তর দিন
- উত্তর সংক্ষিপ্ত এবং ব্যবহারিক রাখুন
- বুলেট পয়েন্ট ব্যবহার করুন
- জটিল শব্দ এড়িয়ে চলুন
- শুধুমাত্র চাষের সমাধানে মনোযোগ দিন`
    };

    const systemPrompt = prompts[finalLang] || prompts.en;

    // 🚀 API CALL
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.5 // more stable answers
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // ✅ SAFE RESPONSE PARSE
    const reply =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "No response from AI";

    console.log("🤖 AI:", reply);

    return res.json({ reply });

  } catch (err) {
    console.error("❌ FULL ERROR:", err.message);
    if (err.response) {
      console.error("❌ RESPONSE:", err.response?.data);
    }

    return res.status(500).json({
      reply: "⚠️ Server error. Please try again."
    });
  }
});

export default router;