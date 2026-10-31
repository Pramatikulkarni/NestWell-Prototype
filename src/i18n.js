// Language support for the entry screens (landing + login). The rest of the prototype is English.
export const LANGS = [['en', 'English'], ['hi', 'हिन्दी'], ['mr', 'मराठी']];
const D = {
  en: { title: 'Log in to NestWell', sub: 'Choose how you use NestWell.', login: 'Log in', privacy: 'Privacy', about: 'About', swipe: 'Swipe or use the arrows, then tap a card',
    patient: 'Patient', clinician: 'Clinician', admin: 'Admin',
    b_patient: 'Track your vitals, devices and care plan, and stay connected to your care team.', b_clinician: 'Review patient readings, spot changes early and respond to your patients.', b_admin: 'Manage programmes, devices and access so every patient stays connected.',
    loginTitle: 'login', loginSub: 'Choose your care provider, then enter your ID and password.', provider: 'Care provider', selectHosp: 'Select your hospital', password: 'Password', pwPh: 'Enter your password', keep: 'Keep me signed in on this device', theme: 'Switch theme', lang: 'Language' },
  hi: { title: 'NestWell में लॉग इन करें', sub: 'चुनें कि आप NestWell का उपयोग कैसे करते हैं।', login: 'लॉग इन', privacy: 'गोपनीयता', about: 'परिचय', swipe: 'कार्ड स्वाइप करें या तीर दबाएँ, फिर कार्ड पर टैप करें',
    patient: 'रोगी', clinician: 'चिकित्सक', admin: 'प्रशासक',
    b_patient: 'अपने वाइटल्स, डिवाइस और केयर प्लान देखें, और अपनी केयर टीम से जुड़े रहें।', b_clinician: 'रोगियों की रीडिंग देखें, बदलाव जल्दी पहचानें और रोगियों को जवाब दें।', b_admin: 'कार्यक्रम, डिवाइस और पहुँच प्रबंधित करें ताकि हर रोगी जुड़ा रहे।',
    loginTitle: 'लॉग इन', loginSub: 'अपना केयर प्रोवाइडर चुनें, फिर अपना आईडी और पासवर्ड दर्ज करें।', provider: 'केयर प्रोवाइडर', selectHosp: 'अपना अस्पताल चुनें', password: 'पासवर्ड', pwPh: 'अपना पासवर्ड दर्ज करें', keep: 'इस डिवाइस पर साइन इन रखें', theme: 'थीम बदलें', lang: 'भाषा' },
  mr: { title: 'NestWell मध्ये लॉग इन करा', sub: 'तुम्ही NestWell कसे वापरता ते निवडा.', login: 'लॉग इन', privacy: 'गोपनीयता', about: 'आमच्याबद्दल', swipe: 'कार्ड स्वाइप करा किंवा बाण वापरा, मग कार्डवर टॅप करा',
    patient: 'रुग्ण', clinician: 'चिकित्सक', admin: 'प्रशासक',
    b_patient: 'तुमचे व्हायटल्स, डिव्हाइस आणि केअर प्लॅन पहा आणि तुमच्या केअर टीमशी जोडलेले राहा.', b_clinician: 'रुग्णांच्या रीडिंग तपासा, बदल लवकर ओळखा आणि रुग्णांना प्रतिसाद द्या.', b_admin: 'कार्यक्रम, डिव्हाइस आणि प्रवेश व्यवस्थापित करा जेणेकरून प्रत्येक रुग्ण जोडलेला राहील.',
    loginTitle: 'लॉग इन', loginSub: 'तुमचा केअर प्रोव्हायडर निवडा, मग तुमचा आयडी आणि पासवर्ड टाका.', provider: 'केअर प्रोव्हायडर', selectHosp: 'तुमचे रुग्णालय निवडा', password: 'पासवर्ड', pwPh: 'तुमचा पासवर्ड टाका', keep: 'या डिव्हाइसवर साइन इन ठेवा', theme: 'थीम बदला', lang: 'भाषा' },
};
export const t = (st, k) => ((D[(st && st.lang) || 'en'] || D.en)[k]) || D.en[k];
