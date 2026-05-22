const fs = require('fs');
const path = require('path');

const newTranslations = {
  en: {
    auth: {
      login: "Login",
      register: "Register",
      email: "Email Address",
      password: "Password",
      buyerLogin: "Buyer Login",
      sellerLogin: "Seller Login",
      createAccount: "Create Account",
      haveAccount: "Already have an account? Login",
      noAccount: "Don't have an account? Register",
      sendOtp: "Send OTP",
      verifyOtp: "Verify OTP",
      welcome: "Welcome back!",
      join: "Join AgroMitra",
      fullName: "Full Name",
      phone: "Phone Number",
      role: "Register As",
      gst: "GST Number (GSTIN)"
    },
    contact: {
      title: "Contact Us",
      name: "Your Name",
      email: "Your Email",
      message: "Message",
      send: "Send Message",
      success: "Message sent successfully!"
    }
  },
  hi: {
    auth: {
      login: "लॉगिन करें",
      register: "रजिस्टर करें",
      email: "ईमेल पता",
      password: "पासवर्ड",
      buyerLogin: "खरीदार लॉगिन",
      sellerLogin: "विक्रेता लॉगिन",
      createAccount: "खाता बनाएं",
      haveAccount: "क्या आपके पास पहले से खाता है? लॉगिन करें",
      noAccount: "खाता नहीं है? रजिस्टर करें",
      sendOtp: "OTP भेजें",
      verifyOtp: "OTP सत्यापित करें",
      welcome: "वापसी पर स्वागत है!",
      join: "एग्रोमित्रा से जुड़ें",
      fullName: "पूरा नाम",
      phone: "फोन नंबर",
      role: "के रूप में रजिस्टर करें",
      gst: "जीएसटी नंबर (GSTIN)"
    },
    contact: {
      title: "संपर्क करें",
      name: "आपका नाम",
      email: "आपका ईमेल",
      message: "संदेश",
      send: "संदेश भेजें",
      success: "संदेश सफलतापूर्वक भेजा गया!"
    }
  },
  gu: {
    auth: {
      login: "લોગિન કરો",
      register: "રજીસ્ટર કરો",
      email: "ઇમેઇલ સરનામું",
      password: "પાસવર્ડ",
      buyerLogin: "ખરીદનાર લોગિન",
      sellerLogin: "વિક્રેતા લોગિન",
      createAccount: "ખાતું બનાવો",
      haveAccount: "શું તમારી પાસે પહેલેથી જ ખાતું છે? લોગિન કરો",
      noAccount: "ખાતું નથી? રજીસ્ટર કરો",
      sendOtp: "OTP મોકલો",
      verifyOtp: "OTP ચકાસો",
      welcome: "પાછા સ્વાગત છે!",
      join: "એગ્રોમિત્રામાં જોડાઓ",
      fullName: "પૂરું નામ",
      phone: "ફોન નંબર",
      role: "તરીકે રજીસ્ટર કરો",
      gst: "GST નંબર (GSTIN)"
    },
    contact: {
      title: "સંપર્ક કરો",
      name: "તમારું નામ",
      email: "તમારું ઇમેઇલ",
      message: "સંદેશ",
      send: "સંદેશ મોકલો",
      success: "સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો!"
    }
  },
  pa: {
    auth: {
      login: "ਲਾਗਇਨ ਕਰੋ",
      register: "ਰਜਿਸਟਰ ਕਰੋ",
      email: "ਈਮੇਲ ਪਤਾ",
      password: "ਪਾਸਵਰਡ",
      buyerLogin: "ਖਰੀਦਦਾਰ ਲਾਗਇਨ",
      sellerLogin: "ਵਿਕਰੇਤਾ ਲਾਗਇਨ",
      createAccount: "ਖਾਤਾ ਬਣਾਓ",
      haveAccount: "ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ? ਲਾਗਇਨ ਕਰੋ",
      noAccount: "ਖਾਤਾ ਨਹੀਂ ਹੈ? ਰਜਿਸਟਰ ਕਰੋ",
      sendOtp: "OTP ਭੇਜੋ",
      verifyOtp: "OTP ਤਸਦੀਕ ਕਰੋ",
      welcome: "ਵਾਪਸੀ 'ਤੇ ਸੁਆਗਤ ਹੈ!",
      join: "ਐਗਰੋਮਿਤਰਾ ਨਾਲ ਜੁੜੋ",
      fullName: "ਪੂਰਾ ਨਾਮ",
      phone: "ਫੋਨ ਨੰਬਰ",
      role: "ਵਜੋਂ ਰਜਿਸਟਰ ਕਰੋ",
      gst: "GST ਨੰਬਰ (GSTIN)"
    },
    contact: {
      title: "ਸੰਪਰਕ ਕਰੋ",
      name: "ਤੁਹਾਡਾ ਨਾਮ",
      email: "ਤੁਹਾਡਾ ਈਮੇਲ",
      message: "ਸੁਨੇਹਾ",
      send: "ਸੁਨੇਹਾ ਭੇਜੋ",
      success: "ਸੁਨੇਹਾ ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ ਗਿਆ!"
    }
  },
  bn: {
    auth: {
      login: "লগইন করুন",
      register: "নিবন্ধন করুন",
      email: "ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      buyerLogin: "ক্রেতা লগইন",
      sellerLogin: "বিক্রেতা লগইন",
      createAccount: "অ্যাকাউন্ট তৈরি করুন",
      haveAccount: "ইতোমধ্যে একটি অ্যাকাউন্ট আছে? লগইন করুন",
      noAccount: "অ্যাকাউন্ট নেই? নিবন্ধন করুন",
      sendOtp: "OTP পাঠান",
      verifyOtp: "OTP যাচাই করুন",
      welcome: "ফিরে আসার জন্য স্বাগতম!",
      join: "এগ্রোমিত্রাতে যোগ দিন",
      fullName: "পুরো নাম",
      phone: "ফোন নম্বর",
      role: "হিসাবে নিবন্ধন করুন",
      gst: "GST নম্বর (GSTIN)"
    },
    contact: {
      title: "যোগাযোগ করুন",
      name: "আপনার নাম",
      email: "আপনার ইমেইল",
      message: "বার্তা",
      send: "বার্তা পাঠান",
      success: "বার্তা সফলভাবে পাঠানো হয়েছে!"
    }
  }
};

const localesDir = path.join(__dirname, 'locales');

['en', 'hi', 'gu', 'pa', 'bn'].forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.auth = newTranslations[lang].auth;
    data.contact = newTranslations[lang].contact;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
