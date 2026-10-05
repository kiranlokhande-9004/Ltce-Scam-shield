// ---------------------------------------------------------------------------
// i18n.js — local translation dictionary (English / Hindi / Marathi).
//
// No translation framework and NO calls to Kimi for UI text. Every string the
// app shows lives here so the interface works fully offline.
// ---------------------------------------------------------------------------

export const LANGUAGES = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिंदी", speech: "hi-IN" },
  { code: "mr", label: "मराठी", speech: "mr-IN" },
];

export const STRINGS = {
  en: {
    // App / shell
    appTitle: "ScamShield",
    appSubtitle: "Verify before you click, pay or share.",
    language: "Language",
    modeMessage: "Message Scan",
    modeCall: "Scam Call",
    footer:
      "ScamShield gives guidance, not guarantees. Always verify through official channels.",

    // Upload
    uploadTitle: "Upload a suspicious screenshot",
    uploadHint: "PNG, JPG or WEBP · up to 15 MB",
    analyze: "Analyze Screenshot",
    analyzing: "Analyzing…",
    clear: "Clear",

    // Risk
    verdict: "Verdict",
    riskHigh: "High Risk",
    riskMedium: "Medium Risk",
    riskLow: "Low Risk",
    riskCritical: "Critical Risk",
    riskSafe: "Looks Safe",

    // Result sections
    summary: "Summary",
    organization: "Organization",
    claim: "Claim",
    requestedAction: "Requested Action",
    urgency: "Urgency",
    suspiciousEvidence: "Suspicious Evidence",
    whySuspicious: "Why Suspicious?",
    attackChain: "Attack Chain",
    urlVerification: "URL Verification",
    officialWebsite: "Official Website",
    safeActions: "Safe Actions",

    // URL / verification
    detectedUrl: "Detected URL",
    officialDomain: "Official domain",
    result: "Result",
    reason: "Reason",
    noUrl: "No URL detected in this screenshot.",
    orgUnknown: "Official domain unavailable for verification.",
    orgNotConfident: "Official website could not be confidently identified.",
    verifyUnavailable:
      "Verification unavailable. Use the organization's official website manually.",
    visitOfficial: "Visit Official Website",
    statusSafe: "SAFE",
    statusSuspicious: "SUSPICIOUS",
    statusUnknown: "UNKNOWN",

    // Cybercrime response
    needHelp: "Need Help?",
    cyberHelpline: "National Cyber Crime Helpline",
    cyberPortal: "Official Cyber Crime Portal",
    reportCyber: "Report Cyber Crime",
    call1930: "Call 1930",
    cyberNote:
      "If you lost money or shared details, report immediately. Reporting within 24 hours improves recovery chances.",

    // Voice
    explain: "Explain",
    listen: "Listen",
    stop: "Stop",
    voiceTitle: "Voice Explanation",
    voiceUnsupported: "Voice playback is not supported by this browser.",

    // Error handling
    aiUnavailable: "AI analysis is temporarily unavailable.",
    analysisFailed: "Analysis failed.",

    // Deterministic safe actions
    doNotClick: "Do not click the link",
    doNotShareOtp: "Do not share OTP",
    doNotSharePin: "Do not share PIN",
    doNotShareCvv: "Do not share CVV",
    doNotSharePassword: "Do not share passwords",
    verifyOfficial: "Verify through the official website",
    contactOfficialNumber: "Contact the organization using an official number",
    report1930: "Report financial cyber fraud through 1930 if money was lost",

    notIdentified: "Not identified",
    notApplicable: "Not applicable",
    noEvidence: "No specific suspicious phrases detected.",
    noReason: "No additional reasoning provided.",
    noChain: "No multi-step attack chain identified.",

    // Simulated scam call mode
    simulateNote:
      "This is a safe simulation. No real call is placed and nothing is dialed.",
    simulateCall: "Simulate Incoming Scam Call",
    incomingCall: "Incoming Call",
    unknownNumber: "Unknown Number",
    possibleFraud: "Possible Fraud",
    decline: "Decline",
    answer: "Answer",
    callInProgress: "Call In Progress",
    claimedOrganization: "Claimed organization",
    caller: "Caller",
    you: "You",
    scamDetected: "Scam Detected",
    callEnded: "Call Ended",
    endCall: "End Call",
    callEndedNote: "Simulation finished. No real call was made.",
    restartCall: "Start Again",
    doNotShare: "Do not share:",
    callChainTitle: "Attack Chain",
    indicatorImpersonation: "Bank Impersonation",
    indicatorUrgency: "Urgency",
    indicatorAccountThreat: "Account Threat",
    indicatorOtp: "OTP Request",
    indicatorPin: "PIN Request",
    indicatorCvv: "CVV Request",
    indicatorPassword: "Password Request",
    indicatorPayment: "Payment Request",
    callChain1: "Impersonate trusted organization",
    callChain2: "Create fear or urgency",
    callChain3: "Ask for sensitive information",
    callChain4: "Attempt account takeover or financial fraud",

    // Call Safety (real-time call protection)
    callSafety: "Call Safety",
    callProtection: "Real-Time Call Protection",
    callSafetyIntro:
      "ScamShield monitors calls only after you grant the required Android permissions.",
    monitoring: "Monitoring",
    monitoringActive: "Call Monitoring Active",
    monitoringStopped: "Monitoring stopped.",
    audioPrivacy: "Audio is processed only while monitoring is active.",
    callMonitoringActive: "Call Safety Monitoring Active",
    incomingCallDetected: "Incoming call detected",
    unknownCaller: "Unknown caller",
    callStatus: "Call Status",
    active: "Active",
    idle: "Idle",
    liveTranscript: "Live Transcript",
    detectedIndicators: "Detected Indicators",
    recommendedAction: "Recommended Action",
    startLiveDemo: "Start Live Call Demo",
    stopMonitoring: "Stop Monitoring",
    demoScript: "Demo Script",
    localDetection: "Local detection",
    aiAnalysis: "AI analysis",
    total: "Total",
    aiModel: "AI model",
    demoMode: "Demo Mode",
    demoModeNote:
      "Live microphone mode: ScamShield transcribes your speech on-device. This is not a recorded phone call.",
    modeA: "Mode A · Real permitted call monitoring (device permitting)",
    modeB: "Mode B · Live microphone demo (this session)",
    micUnsupported:
      "Speech recognition is not supported by this browser. Please use Chrome or Android Chrome.",
    transcriptPlaceholder: "Recognized speech appears here…",
    sensitiveDetected: "Sensitive information request detected",
    kycDetected: "KYC / account claim detected",
    urgencyDetected: "Urgency + account threat detected",
    otpCritical: "OTP request detected",
    scamshieldWarning: "ScamShield Warning",
    possibleFraudCall: "Possible Fraud Call",
    risk: "Risk",
    doNotShareList: "Do not share:",
    verifyOrganization: "🔎 Verify Organization",
    officialWebsiteUnavailable:
      "Official website could not be confidently identified.",
    verifyOfficially: "Verify Officially",
    paymentSafetyCheck: "Payment Safety Check",
    paymentWarning:
      "Are you about to send money to an unverified recipient?",
    cancelPayment: "Cancel Payment",
    proceedAnyway: "Proceed Anyway",
    callTimeline: "Call Timeline",
    actionEndCall: "End the call immediately.",
    actionDoNotShare: "Do not share OTP, PIN, CVV or passwords.",
    actionDoNotPay: "Do not make any payment.",
    actionVerify: "Verify by calling the organization's official number.",
    actionReport: "If money was lost, report on 1930.",
    monitoringStoppedNote: "Monitoring stopped. Audio capture has ended.",
    demoReadAloud: "Read this aloud to the microphone:",
    noIndicatorsYet: "No scam indicators detected yet.",
    indOtp: "OTP request",
    indPin: "PIN request",
    indCvv: "CVV request",
    indPassword: "Password request",
    indUpi: "UPI / payment request",
    indScreenShare: "Screen-sharing request",
    indRemoteAccess: "Remote-access request",
    indKyc: "KYC threat",
    indAccountBlock: "Account-blocking threat",
    indPolice: "Police / legal threat",
    indPrize: "Prize / refund scam",
    indUrgency: "Urgency",
    indFear: "Fear / intimidation",
    indInstallApp: "App-install request",
    indImpersonation: "Impersonation",
    indBankingInfo: "Banking information request",

    // Voice explanation templates
    voiceLead:
      "ScamShield has detected a {risk} message that appears to impersonate {org}.",
    voiceReason: "The main suspicious reason is: {reason}.",
    voiceAsk: "The sender wants you to: {action}.",
    voiceSafe:
      "Do not click the link, and never share your OTP, PIN, CVV or password.",
    voiceVerifyWebsite: "Verify only through the official website {website}.",
    voiceVerifyManual: "Verify only through the organization's official website.",
    voiceHelp:
      "If money was lost, report it on the national cyber crime helpline 1 9 3 0.",
    voiceUnknownOrg: "an unknown organization",
  },

  hi: {
    appTitle: "स्कैमशील्ड",
    appSubtitle: "क्लिक करने, भुगतान करने या साझा करने से पहले सत्यापित करें।",
    language: "भाषा",
    modeMessage: "मैसेज स्कैन",
    modeCall: "स्कैम कॉल",
    footer:
      "स्कैमशील्ड मार्गदर्शन देता है, गारंटी नहीं। हमेशा आधिकारिक माध्यमों से सत्यापित करें।",

    uploadTitle: "संदिग्ध स्क्रीनशॉट अपलोड करें",
    uploadHint: "PNG, JPG या WEBP · 15 MB तक",
    analyze: "स्क्रीनशॉट का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है…",
    clear: "साफ़ करें",

    verdict: "निष्कर्ष",
    riskHigh: "उच्च जोखिम",
    riskMedium: "मध्यम जोखिम",
    riskLow: "कम जोखिम",
    riskCritical: "गंभीर जोखिम",
    riskSafe: "सुरक्षित लगता है",

    summary: "सारांश",
    organization: "संस्था",
    claim: "दावा",
    requestedAction: "मांगी गई कार्रवाई",
    urgency: "तात्कालिकता",
    suspiciousEvidence: "संदिग्ध साक्ष्य",
    whySuspicious: "संदेह क्यों?",
    attackChain: "हमले की शृंखला",
    urlVerification: "URL सत्यापन",
    officialWebsite: "आधिकारिक वेबसाइट",
    safeActions: "सुरक्षित कार्रवाई",

    detectedUrl: "पाई गई URL",
    officialDomain: "आधिकारिक डोमेन",
    result: "परिणाम",
    reason: "कारण",
    noUrl: "इस स्क्रीनशॉट में कोई URL नहीं मिला।",
    orgUnknown: "सत्यापन के लिए आधिकारिक डोमेन उपलब्ध नहीं है।",
    orgNotConfident: "आधिकारिक वेबसाइट की विश्वसनीय पहचान नहीं हो सकी।",
    verifyUnavailable:
      "सत्यापन उपलब्ध नहीं है। संस्था की आधिकारिक वेबसाइट से मैन्युअल रूप से जांच करें।",
    visitOfficial: "आधिकारिक वेबसाइट खोलें",
    statusSafe: "सुरक्षित",
    statusSuspicious: "संदिग्ध",
    statusUnknown: "अज्ञात",

    needHelp: "मदद चाहिए?",
    cyberHelpline: "राष्ट्रीय साइबर अपराध हेल्पलाइन",
    cyberPortal: "आधिकारिक साइबर अपराध पोर्टल",
    reportCyber: "साइबर अपराध की रिपोर्ट करें",
    call1930: "1930 पर कॉल करें",
    cyberNote:
      "यदि पैसा चला गया या जानकारी साझा की गई हो, तो तुरंत रिपोर्ट करें। 24 घंटे में रिपोर्ट करने से राशि वापसी की संभावना बढ़ती है।",

    explain: "समझाएँ",
    listen: "सुनें",
    stop: "रोकें",
    voiceTitle: "आवाज़ में व्याख्या",
    voiceUnsupported: "यह ब्राउज़र आवाज़ चलाने का समर्थन नहीं करता।",

    aiUnavailable: "AI विश्लेषण फिलहाल उपलब्ध नहीं है।",
    analysisFailed: "विश्लेषण विफल रहा।",

    doNotClick: "लिंक पर क्लिक न करें",
    doNotShareOtp: "OTP साझा न करें",
    doNotSharePin: "PIN साझा न करें",
    doNotShareCvv: "CVV साझा न करें",
    doNotSharePassword: "पासवर्ड साझा न करें",
    verifyOfficial: "आधिकारिक वेबसाइट से सत्यापित करें",
    contactOfficialNumber: "संस्था से आधिकारिक नंबर पर संपर्क करें",
    report1930:
      "पैसा चला गया हो तो 1930 पर वित्तीय साइबर धोखाधड़ी की रिपोर्ट करें",

    notIdentified: "पहचान नहीं हुई",
    notApplicable: "लागू नहीं",
    noEvidence: "कोई विशिष्ट संदिग्ध वाक्यांश नहीं मिला।",
    noReason: "कोई अतिरिक्त कारण नहीं दिया गया।",
    noChain: "कोई बहु-चरणीय हमला शृंखला नहीं मिली।",

    simulateNote:
      "यह एक सुरक्षित सिम्युलेशन है। कोई वास्तविक कॉल नहीं की जाती और कोई नंबर नहीं मिलाया जाता।",
    simulateCall: "स्कैम कॉल शुरू करें",
    incomingCall: "इनकमिंग कॉल",
    unknownNumber: "अज्ञात नंबर",
    possibleFraud: "संभावित धोखाधड़ी",
    decline: "अस्वीकार करें",
    answer: "उत्तर दें",
    callInProgress: "कॉल जारी है",
    claimedOrganization: "दावा की गई संस्था",
    caller: "कॉलर",
    you: "आप",
    scamDetected: "स्कैम पकड़ा गया",
    callEnded: "कॉल समाप्त",
    endCall: "कॉल समाप्त करें",
    callEndedNote: "सिम्युलेशन समाप्त। कोई वास्तविक कॉल नहीं की गई।",
    restartCall: "फिर से शुरू करें",
    doNotShare: "ये साझा न करें:",
    callChainTitle: "हमले की शृंखला",
    indicatorImpersonation: "बैंक की नकल",
    indicatorUrgency: "तात्कालिकता",
    indicatorAccountThreat: "खाते की धमकी",
    indicatorOtp: "OTP की मांग",
    indicatorPin: "PIN की मांग",
    indicatorCvv: "CVV की मांग",
    indicatorPassword: "पासवर्ड की मांग",
    indicatorPayment: "भुगतान की मांग",
    callChain1: "विश्वसनीय संस्था की नकल करना",
    callChain2: "डर या तात्कालिकता पैदा करना",
    callChain3: "गोपनीय जानकारी मांगना",
    callChain4: "खाता हड़पने या वित्तीय धोखाधड़ी का प्रयास",

    // Call Safety (रीयल-टाइम कॉल सुरक्षा)
    callSafety: "कॉल सुरक्षा",
    callProtection: "रीयल-टाइम कॉल सुरक्षा",
    callSafetyIntro:
      "स्कैमशील्ड कॉल की निगरानी तभी करता है जब आप आवश्यक Android अनुमतियाँ देते हैं।",
    monitoring: "निगरानी",
    monitoringActive: "कॉल निगरानी सक्रिय",
    monitoringStopped: "निगरानी बंद।",
    audioPrivacy: "ऑडियो केवल निगरानी सक्रिय रहने तक ही प्रोसेस होता है।",
    callMonitoringActive: "कॉल सुरक्षा निगरानी सक्रिय",
    incomingCallDetected: "इनकमिंग कॉल का पता चला",
    unknownCaller: "अज्ञात कॉलर",
    callStatus: "कॉल स्थिति",
    active: "सक्रिय",
    idle: "निष्क्रिय",
    liveTranscript: "लाइव ट्रांसक्रिप्ट",
    detectedIndicators: "पाए गए संकेतक",
    recommendedAction: "अनुशंसित कार्रवाई",
    startLiveDemo: "लाइव कॉल डेमो शुरू करें",
    stopMonitoring: "निगरानी बंद करें",
    demoScript: "डेमो स्क्रिप्ट",
    localDetection: "लोकल पहचान",
    aiAnalysis: "AI विश्लेषण",
    total: "कुल",
    aiModel: "AI मॉडल",
    demoMode: "डेमो मोड",
    demoModeNote:
      "लाइव माइक्रोफ़ोन मोड: स्कैमशील्ड आपकी आवाज़ को डिवाइस पर ट्रांसक्राइब करता है। यह रिकॉर्ड की गई कॉल नहीं है।",
    modeA: "मोड A · वास्तविक अनुमत कॉल निगरानी (डिवाइस अनुमति देने पर)",
    modeB: "मोड B · लाइव माइक्रोफ़ोन डेमो (यह सेशन)",
    micUnsupported:
      "यह ब्राउज़र स्पीच रिकग्निशन का समर्थन नहीं करता। कृपया Chrome या Android Chrome उपयोग करें।",
    transcriptPlaceholder: "पहचानी गई आवाज़ यहाँ दिखेगी…",
    sensitiveDetected: "संवेदनशील जानकारी की मांग पाई गई",
    kycDetected: "KYC / खाते का दावा पाया गया",
    urgencyDetected: "तात्कालिकता + खाते की धमकी पाई गई",
    otpCritical: "OTP की मांग पाई गई",
    scamshieldWarning: "स्कैमशील्ड चेतावनी",
    possibleFraudCall: "संभावित फ्रॉड कॉल",
    risk: "जोखिम",
    doNotShareList: "ये साझा न करें:",
    verifyOrganization: "🔎 संस्था सत्यापित करें",
    officialWebsiteUnavailable:
      "आधिकारिक वेबसाइट की विश्वसनीय पहचान नहीं हो सकी।",
    verifyOfficially: "आधिकारिक रूप से सत्यापित करें",
    paymentSafetyCheck: "भुगतान सुरक्षा जाँच",
    paymentWarning:
      "क्या आप किसी असत्यापित प्राप्तकर्ता को पैसे भेजने वाले हैं?",
    cancelPayment: "भुगतान रद्द करें",
    proceedAnyway: "फिर भी जारी रखें",
    callTimeline: "कॉल टाइमलाइन",
    actionEndCall: "तुरंत कॉल समाप्त करें।",
    actionDoNotShare: "OTP, PIN, CVV या पासवर्ड साझा न करें।",
    actionDoNotPay: "कोई भुगतान न करें।",
    actionVerify: "संस्था के आधिकारिक नंबर पर कॉल करके सत्यापित करें।",
    actionReport: "पैसा चला गया हो तो 1930 पर रिपोर्ट करें।",
    monitoringStoppedNote: "निगरानी बंद। ऑडियो कैप्चर समाप्त हो गया।",
    demoReadAloud: "इसे माइक्रोफ़ोन पर ज़ोर से पढ़ें:",
    noIndicatorsYet: "अभी तक कोई स्कैम संकेतक नहीं मिला।",
    indOtp: "OTP की मांग",
    indPin: "PIN की मांग",
    indCvv: "CVV की मांग",
    indPassword: "पासवर्ड की मांग",
    indUpi: "UPI / भुगतान की मांग",
    indScreenShare: "स्क्रीन शेयर करने की मांग",
    indRemoteAccess: "रिमोट एक्सेस की मांग",
    indKyc: "KYC धमकी",
    indAccountBlock: "खाता बंद करने की धमकी",
    indPolice: "पुलिस / कानूनी धमकी",
    indPrize: "इनाम / रिफंड घोटाला",
    indUrgency: "तात्कालिकता",
    indFear: "डर / धमकी",
    indInstallApp: "ऐप इंस्टॉल करने की मांग",
    indImpersonation: "नकल",
    indBankingInfo: "बैंकिंग जानकारी की मांग",

    voiceLead:
      "स्कैमशील्ड ने {risk} वाला संदेश पाया है, जो {org} के नाम पर ठगी करने का प्रयास करता है।",
    voiceReason: "संदेह का मुख्य कारण: {reason}।",
    voiceAsk: "भेजने वाला आपसे यह चाहता है: {action}।",
    voiceSafe:
      "लिंक पर क्लिक न करें और अपना OTP, PIN, CVV या पासवर्ड कभी साझा न करें।",
    voiceVerifyWebsite: "केवल आधिकारिक वेबसाइट {website} से सत्यापित करें।",
    voiceVerifyManual: "केवल संस्था की आधिकारिक वेबसाइट से सत्यापित करें।",
    voiceHelp:
      "यदि पैसा चला गया हो, तो राष्ट्रीय साइबर अपराध हेल्पलाइन 1 9 3 0 पर रिपोर्ट करें।",
    voiceUnknownOrg: "एक अज्ञात संस्था",
  },

  mr: {
    appTitle: "स्कॅमशील्ड",
    appSubtitle:
      "क्लिक करण्यापूर्वी, पैसे भरण्यापूर्वी किंवा माहिती सामायिक करण्यापूर्वी पडताळा.",
    language: "भाषा",
    modeMessage: "मेसेज स्कॅन",
    modeCall: "स्कॅम कॉल",
    footer:
      "स्कॅमशील्ड मार्गदर्शन देते, हमी नाही. नेहमी अधिकृत माध्यमांद्वारे पडताळा.",

    uploadTitle: "संशयास्पद स्क्रीनशॉट अपलोड करा",
    uploadHint: "PNG, JPG किंवा WEBP · 15 MB पर्यंत",
    analyze: "स्क्रीनशॉटचे विश्लेषण करा",
    analyzing: "विश्लेषण सुरू आहे…",
    clear: "साफ करा",

    verdict: "निष्कर्ष",
    riskHigh: "उच्च धोका",
    riskMedium: "मध्यम धोका",
    riskLow: "कमी धोका",
    riskCritical: "गंभीर धोका",
    riskSafe: "सुरक्षित वाटते",

    summary: "सारांश",
    organization: "संस्था",
    claim: "दावा",
    requestedAction: "मागितलेली कृती",
    urgency: "तातडी",
    suspiciousEvidence: "संशयास्पद पुरावा",
    whySuspicious: "संशय का?",
    attackChain: "हल्ल्याची साखळी",
    urlVerification: "URL पडताळणी",
    officialWebsite: "अधिकृत वेबसाइट",
    safeActions: "सुरक्षित कृती",

    detectedUrl: "आढळलेली URL",
    officialDomain: "अधिकृत डोमेन",
    result: "निकाल",
    reason: "कारण",
    noUrl: "या स्क्रीनशॉटमध्ये URL आढळली नाही.",
    orgUnknown: "पडताळणीसाठी अधिकृत डोमेन उपलब्ध नाही.",
    orgNotConfident: "अधिकृत वेबसाइटची विश्वासार्ह ओळख पटली नाही.",
    verifyUnavailable:
      "पडताळणी उपलब्ध नाही. संस्थेच्या अधिकृत वेबसाइटवरून स्वतः तपासा.",
    visitOfficial: "अधिकृत वेबसाइट उघडा",
    statusSafe: "सुरक्षित",
    statusSuspicious: "संशयास्पद",
    statusUnknown: "अज्ञात",

    needHelp: "मदत हवी?",
    cyberHelpline: "राष्ट्रीय सायबर गुन्हे हेल्पलाइन",
    cyberPortal: "अधिकृत सायबर गुन्हे पोर्टल",
    reportCyber: "सायबर गुन्ह्याची तक्रार करा",
    call1930: "1930 वर कॉल करा",
    cyberNote:
      "पैसे गेले किंवा माहिती सामायिक केली असल्यास त्वरित तक्रार करा. 24 तासांत तक्रार केल्यास रक्कम परत मिळण्याची शक्यता वाढते.",

    explain: "समजावून सांगा",
    listen: "ऐका",
    stop: "थांबा",
    voiceTitle: "आवाजातील स्पष्टीकरण",
    voiceUnsupported: "हा ब्राउझर आवाज चालवण्यास समर्थन देत नाही.",

    aiUnavailable: "AI विश्लेषण सध्या उपलब्ध नाही.",
    analysisFailed: "विश्लेषण अयशस्वी झाले.",

    doNotClick: "लिंकवर क्लिक करू नका",
    doNotShareOtp: "OTP सामायिक करू नका",
    doNotSharePin: "PIN सामायिक करू नका",
    doNotShareCvv: "CVV सामायिक करू नका",
    doNotSharePassword: "पासवर्ड सामायिक करू नका",
    verifyOfficial: "अधिकृत वेबसाइटवरून पडताळा",
    contactOfficialNumber: "संस्थेशी अधिकृत क्रमांकावर संपर्क करा",
    report1930:
      "पैसे गेले असल्यास 1930 वर आर्थिक सायबर फसवणुकीची तक्रार करा",

    notIdentified: "ओळख पटली नाही",
    notApplicable: "लागू नाही",
    noEvidence: "कोणतीही विशिष्ट संशयास्पद वाक्ये आढळली नाहीत.",
    noReason: "अतिरिक्त कारण दिलेले नाही.",
    noChain: "कोणतीही बहु-टप्प्यातील हल्ल्याची साखळी आढळली नाही.",

    simulateNote:
      "हे एक सुरक्षित सिम्युलेशन आहे. खरा कॉल केला जात नाही आणि कोणताही क्रमांक मिलवला जात नाही.",
    simulateCall: "स्कॅम कॉल सुरू करा",
    incomingCall: "येणारा कॉल",
    unknownNumber: "अज्ञात क्रमांक",
    possibleFraud: "संभाव्य फसवणूक",
    decline: "नाकारा",
    answer: "उत्तर द्या",
    callInProgress: "कॉल सुरू आहे",
    claimedOrganization: "दावा केलेली संस्था",
    caller: "कॉलर",
    you: "तुम्ही",
    scamDetected: "स्कॅम आढळला",
    callEnded: "कॉल संपला",
    endCall: "कॉल संपवा",
    callEndedNote: "सिम्युलेशन संपले. खरा कॉल केला गेला नाही.",
    restartCall: "पुन्हा सुरू करा",
    doNotShare: "हे सामायिक करू नका:",
    callChainTitle: "हल्ल्याची साखळी",
    indicatorImpersonation: "बँकेची बनावट",
    indicatorUrgency: "तातडी",
    indicatorAccountThreat: "खात्याची धमकी",
    indicatorOtp: "OTP मागणी",
    indicatorPin: "PIN मागणी",
    indicatorCvv: "CVV मागणी",
    indicatorPassword: "पासवर्डची मागणी",
    indicatorPayment: "पैसे भरण्याची मागणी",
    callChain1: "विश्वासार्ह संस्थेची बनावट करणे",
    callChain2: "भीती किंवा तातडी निर्माण करणे",
    callChain3: "गोपनीय माहिती मागणे",
    callChain4: "खाते ताब्यात घेण्याचा किंवा आर्थिक फसवणुकीचा प्रयत्न",

    // Call Safety (रिअल-टाइम कॉल संरक्षण)
    callSafety: "कॉल सुरक्षा",
    callProtection: "रिअल-टाइम कॉल संरक्षण",
    callSafetyIntro:
      "स्कॅमशील्ड कॉलचे निरीक्षण तेव्हाच करते जेव्हा तुम्ही आवश्यक Android परवानग्या देता.",
    monitoring: "निरीक्षण",
    monitoringActive: "कॉल निरीक्षण सक्रिय",
    monitoringStopped: "निरीक्षण थांबले.",
    audioPrivacy: "ऑडिओ फक्त निरीक्षण सक्रिय असतानाच प्रोसेस होतो.",
    callMonitoringActive: "कॉल सुरक्षा निरीक्षण सक्रिय",
    incomingCallDetected: "येणारा कॉल आढळला",
    unknownCaller: "अज्ञात कॉलर",
    callStatus: "कॉल स्थिती",
    active: "सक्रिय",
    idle: "निष्क्रिय",
    liveTranscript: "लाइव्ह ट्रान्स्क्रिप्ट",
    detectedIndicators: "आढळलेले संकेतक",
    recommendedAction: "शिफारस केलेली कृती",
    startLiveDemo: "लाइव्ह कॉल डेमो सुरू करा",
    stopMonitoring: "निरीक्षण थांबवा",
    demoScript: "डेमो स्क्रिप्ट",
    localDetection: "स्थानिक ओळख",
    aiAnalysis: "AI विश्लेषण",
    total: "एकूण",
    aiModel: "AI मॉडेल",
    demoMode: "डेमो मोड",
    demoModeNote:
      "लाइव्ह मायक्रोफोन मोड: स्कॅमशील्ड तुमचा आवाज डिव्हाइसवर ट्रान्स्क्राइब करते. हा रेकॉर्ड केलेला कॉल नाही.",
    modeA: "मोड A · खरे अनुमत कॉल निरीक्षण (डिव्हाइस परवानगी दिल्यास)",
    modeB: "मोड B · लाइव्ह मायक्रोफोन डेमो (हे सत्र)",
    micUnsupported:
      "हा ब्राउझर स्पीच रिकग्निशनला समर्थन देत नाही. कृपया Chrome किंवा Android Chrome वापरा.",
    transcriptPlaceholder: "ओळखलेला आवाज येथे दिसेल…",
    sensitiveDetected: "संवेदनशील माहितीची मागणी आढळली",
    kycDetected: "KYC / खात्याचा दावा आढळला",
    urgencyDetected: "तातडी + खात्याची धमकी आढळली",
    otpCritical: "OTP मागणी आढळली",
    scamshieldWarning: "स्कॅमशील्ड इशारा",
    possibleFraudCall: "संभाव्य फसवणूक कॉल",
    risk: "धोका",
    doNotShareList: "हे सामायिक करू नका:",
    verifyOrganization: "🔎 संस्था पडताळा",
    officialWebsiteUnavailable:
      "अधिकृत वेबसाइटची विश्वासार्ह ओळख पटली नाही.",
    verifyOfficially: "अधिकृतपणे पडताळा",
    paymentSafetyCheck: "पेमेंट सुरक्षा तपासणी",
    paymentWarning:
      "तुम्ही असत्यापित प्राप्तकर्त्याला पैसे पाठवणार आहात का?",
    cancelPayment: "पेमेंट रद्द करा",
    proceedAnyway: "तरीही पुढे जा",
    callTimeline: "कॉल टाइमलाइन",
    actionEndCall: "त्वरित कॉल संपवा.",
    actionDoNotShare: "OTP, PIN, CVV किंवा पासवर्ड सामायिक करू नका.",
    actionDoNotPay: "कोणतेही पेमेंट करू नका.",
    actionVerify: "संस्थेच्या अधिकृत क्रमांकावर कॉल करून पडताळा.",
    actionReport: "पैसे गेले असल्यास 1930 वर तक्रार करा.",
    monitoringStoppedNote: "निरीक्षण थांबले. ऑडिओ कॅप्चर संपले.",
    demoReadAloud: "हे मायक्रोफोनवर मोठ्याने वाचा:",
    noIndicatorsYet: "अद्यापि कोणतेही स्कॅम संकेतक आढळले नाहीत.",
    indOtp: "OTP मागणी",
    indPin: "PIN मागणी",
    indCvv: "CVV मागणी",
    indPassword: "पासवर्ड मागणी",
    indUpi: "UPI / पेमेंट मागणी",
    indScreenShare: "स्क्रीन शेअर मागणी",
    indRemoteAccess: "रिमोट ॲक्सेस मागणी",
    indKyc: "KYC धमकी",
    indAccountBlock: "खाते बंद होण्याची धमकी",
    indPolice: "पोलीस / कायदेशीर धमकी",
    indPrize: "बक्षीस / परतावा घोटाळा",
    indUrgency: "तातडी",
    indFear: "भीती / धमकी",
    indInstallApp: "ॲप इन्स्टॉल मागणी",
    indImpersonation: "बनावट",
    indBankingInfo: "बँक माहिती मागणी",

    voiceLead:
      "स्कॅमशील्डला {risk} असलेला संदेश आढळला आहे, जो {org} च्या नावाने फसवणूक करण्याचा प्रयत्न करतो.",
    voiceReason: "संशयाचे मुख्य कारण: {reason}.",
    voiceAsk: "पाठवणारा तुमच्याकडून हे मागत आहे: {action}.",
    voiceSafe:
      "लिंकवर क्लिक करू नका आणि तुमचा OTP, PIN, CVV किंवा पासवर्ड कधीही सामाविष्ट करू नका.",
    voiceVerifyWebsite: "फक्त अधिकृत वेबसाइट {website} वरून पडताळा.",
    voiceVerifyManual: "फक्त संस्थेच्या अधिकृत वेबसाइटवरून पडताळा.",
    voiceHelp:
      "पैसे गेले असल्यास राष्ट्रीय सायबर गुन्हे हेल्पलाइन 1 9 3 0 वर तक्रार करा.",
    voiceUnknownOrg: "अज्ञात संस्था",
  },
};

// Pick the dictionary for a language, falling back to English.
export function getDictionary(lang) {
  return STRINGS[lang] || STRINGS.en;
}

// Translate a key, with optional {placeholder} interpolation.
export function translate(lang, key, vars) {
  const dict = getDictionary(lang);
  let value = dict[key];

  if (value === undefined) value = STRINGS.en[key];
  if (value === undefined) return key;

  if (vars) {
    value = String(value).replace(/\{(\w+)\}/g, (_, name) =>
      vars[name] !== undefined && vars[name] !== null ? vars[name] : ""
    );
  }

  return value;
}

// Map a risk level to its translated label.
export function riskLabel(lang, level) {
  const key = String(level || "").toUpperCase();
  if (key === "HIGH") return translate(lang, "riskHigh");
  if (key === "MEDIUM") return translate(lang, "riskMedium");
  if (key === "LOW") return translate(lang, "riskLow");
  if (key === "CRITICAL") return translate(lang, "riskCritical");
  if (key === "SAFE") return translate(lang, "riskSafe");
  return translate(lang, "riskMedium");
}

// Speech-synthesis locale for a language code.
export function speechLang(lang) {
  const match = LANGUAGES.find((entry) => entry.code === lang);
  return match ? match.speech : "en-IN";
}