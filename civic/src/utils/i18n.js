// ============================================
// Internationalization (i18n) Module
// English + Tamil support
// ============================================

const translations = {
  en: {
    // App
    appName: 'CivicPulse',
    appTagline: 'Smart Civic Issue Reporting',

    // Login
    loginTitle: 'CivicPulse',
    loginSubtitle: 'Report civic issues intelligently',
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter your name',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'Enter your phone number',
    languageLabel: 'Preferred Language',
    roleLabel: 'Login As',
    roleUser: 'Login as User',
    roleAdmin: 'Login as Admin',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending OTP...',
    otpSent: 'OTP sent successfully!',
    otpLabel: 'Enter OTP',
    verifyOtp: 'Verify OTP',
    verifying: 'Verifying...',
    invalidOtp: 'Invalid OTP. Please try again.',
    loginFooter: 'Secure login for civic engagement',
    fillAllFields: 'Please fill in all fields',
    validPhone: 'Please enter a valid phone number',
    generateOtp: 'Generate OTP',
    otpDisplayPrefix: 'Your OTP is:',
    duplicateUser: 'Login credentials already issued on another device',

    // Nav
    navDashboard: 'Dashboard',
    navReport: 'Report',
    navTrack: 'Track',
    navAdmin: 'Admin',
    navLogout: 'Logout',
    roleUserLabel: 'User',
    roleAdminLabel: 'Admin',

    // Dashboard
    dashboardGreeting: 'Welcome back',
    dashboardHeroTitle: 'Report a Civic Issue',
    dashboardHeroText: 'Help make your city better. Report issues and track their resolution in real-time.',
    reportIssueBtn: 'Report New Issue',
    workInProgress: 'Work in Progress',
    completedWorks: 'Completed Works',
    noActiveIssues: 'No active issues at the moment',
    noCompletedIssues: 'No completed works yet',
    issueSingular: 'issue',
    issuePlural: 'issues',

    // Report
    reportTitle: 'Report an Issue',
    reportSubtitle: 'Capture and report civic issues in your area',
    captureImage: 'Tap to capture image',
    cameraOnly: 'Camera capture only',
    cameraOnlyAlert: 'Only live camera capture is allowed. File uploads are disabled.',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the issue in detail...',
    descriptionRequired: 'Please describe the issue',
    voiceInput: 'Voice Input',
    voiceListening: 'Listening for voice input...',
    voiceStopped: 'Voice input stopped',
    voiceCaptured: 'Voice input captured',
    locationLabel: 'Location',
    locationDetecting: 'Auto-detecting location...',
    locationDetected: 'Location auto-detected',
    submitReport: 'Submit Report',
    submitting: 'Submitting...',
    backToDashboard: 'Back to Dashboard',

    // AI Processing
    aiTitle: 'AI Analysis',
    aiProcessing: 'Processing your report...',
    aiStep1: 'Analyzing image...',
    aiStep2: 'Detecting issue type...',
    aiStep3: 'Evaluating severity...',
    aiStep4: 'Checking duplicates...',
    aiComplete: 'Analysis Complete',
    aiIssueType: 'Issue Type',
    aiSeverity: 'Severity',
    aiDuplicate: 'Status',
    aiNewReport: 'New Report',
    aiDuplicateFound: 'Possible Duplicate -- This issue may already be reported',
    aiConfidence: 'Confidence',
    aiContinue: 'Continue',
    aiUploading: 'Uploading image...',

    // Confirmation
    confirmTitle: 'Issue Reported Successfully',
    confirmText: 'Your issue has been registered and will be reviewed by the authorities.',
    trackingId: 'Tracking ID',
    statusLabel: 'Status',
    statusReported: 'Reported',
    trackIssue: 'Track Issue',
    goToDashboard: 'Go to Dashboard',

    // Tracking
    trackTitle: 'Track Issue',
    trackSubtitle: 'Real-time status updates',
    issueType: 'Issue Type',
    severity: 'Severity',
    location: 'Location',
    reportedOn: 'Reported On',
    statusTimeline: 'Status Timeline',
    reported: 'Reported',
    assigned: 'Assigned',
    inProgress: 'In Progress',
    completed: 'Completed',
    estimatedTime: 'Estimated Time',
    pending: 'Pending',
    beforeLabel: 'Before',
    afterLabel: 'After',
    verifiedCompleted: 'Verified & Completed',

    // Timeline notes
    timelineReportedNote: 'Issue reported by citizen',
    timelineAssignedNote: 'Assigned to field team',
    timelineAssignedTo: 'Assigned to',
    timelineProgressNote: 'Work started on site',
    timelineCompletedNote: 'Issue resolved and verified',

    // Admin
    adminTitle: 'Admin Dashboard',
    adminSubtitle: 'Manage and monitor civic issues',
    issueMap: 'Issue Map',
    allIssues: 'All Issues',
    filterCategory: 'All Categories',
    filterStatus: 'All Statuses',
    filterLocation: 'All Locations',
    assignBtn: 'Assign Worker',
    manageBtn: 'Manage',
    mapLegendTitle: 'Severity',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    reportsSection: 'New Reports',
    wipSection: 'Work in Progress',
    completedSection: 'Completed Works',
    totalIssues: 'Total Issues',
    resolvedIssues: 'Resolved',
    pendingIssues: 'Pending',
    loading: 'Loading...',
    noReports: 'No new reports',
    noWip: 'No work in progress',
    noCompleted: 'No completed works',
    estPrefix: 'Est:',
    workerPrefix: 'Worker:',
    liveLabel: 'Live',

    // Task Management
    taskTitle: 'Task Management',
    assignWorker: 'Assign Worker',
    selectWorker: 'Select a worker...',
    selectWorkerWarning: 'Please select a worker to assign',
    updateStatus: 'Update Status',
    uploadProof: 'Upload Completion Proof',
    uploadProofText: 'Click to upload proof image',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    estimatedTimeLabel: 'Estimated Resolution Time',
    estimatedTimePlaceholder: 'e.g., 2 hours, 1 day...',
    workersAssigned: 'Workers have been assigned',

    // Severity
    severityHigh: 'High',
    severityMedium: 'Medium',
    severityLow: 'Low',

    // Status
    statusAssigned: 'Assigned',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',

    // Notifications
    notifIssueReported: 'Issue reported successfully',
    notifStatusUpdated: 'Status updated successfully',
    notifAssigned: 'Workers have been assigned',
    notifSaved: 'Changes saved successfully',
    notifLogout: 'Logged out successfully',
    notifUploadFailed: 'Image upload failed. Please try again.',
    notifDbError: 'Database error. Please try again.',
    welcomeGreeting: 'Welcome',
  },

  ta: {
    // App
    appName: 'CivicPulse',
    appTagline: 'புத்திசாலி குடிமை புகார் அமைப்பு',

    // Login
    loginTitle: 'CivicPulse',
    loginSubtitle: 'குடிமை சிக்கல்களை புத்திசாலியாக புகாரளிக்கவும்',
    nameLabel: 'முழு பெயர்',
    namePlaceholder: 'உங்கள் பெயரை உள்ளிடவும்',
    phoneLabel: 'தொலைபேசி எண்',
    phonePlaceholder: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    languageLabel: 'விருப்பமான மொழி',
    roleLabel: 'உள்நுழைவு முறை',
    roleUser: 'பயனராக உள்நுழை',
    roleAdmin: 'நிர்வாகியாக உள்நுழை',
    sendOtp: 'OTP அனுப்பு',
    sendingOtp: 'OTP அனுப்புகிறது...',
    otpSent: 'OTP வெற்றிகரமாக அனுப்பப்பட்டது!',
    otpLabel: 'OTP உள்ளிடவும்',
    verifyOtp: 'OTP சரிபார்',
    verifying: 'சரிபார்க்கிறது...',
    invalidOtp: 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.',
    loginFooter: 'குடிமை ஈடுபாட்டிற்கான பாதுகாப்பான உள்நுழைவு',
    fillAllFields: 'அனைத்து புலங்களையும் நிரப்பவும்',
    validPhone: 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்',
    generateOtp: 'OTP உருவாக்கு',
    otpDisplayPrefix: 'உங்கள் OTP:',
    duplicateUser: 'இந்த சான்றுகள் ஏற்கனவே வேறு சாதனத்தில் வழங்கப்பட்டுள்ளன',

    // Nav
    navDashboard: 'முகப்பு',
    navReport: 'புகார்',
    navTrack: 'கண்காணி',
    navAdmin: 'நிர்வாகம்',
    navLogout: 'வெளியேறு',
    roleUserLabel: 'பயனர்',
    roleAdminLabel: 'நிர்வாகி',

    // Dashboard
    dashboardGreeting: 'வரவேற்கிறோம்',
    dashboardHeroTitle: 'குடிமை சிக்கலை புகாரளிக்கவும்',
    dashboardHeroText: 'உங்கள் நகரத்தை சிறப்பாக மாற்ற உதவுங்கள். சிக்கல்களைப் புகாரளித்து நிகழ்நேரத்தில் கண்காணிக்கவும்.',
    reportIssueBtn: 'புதிய புகார் பதிவு',
    workInProgress: 'நடைபெற்றுக்கொண்டிருக்கும் பணிகள்',
    completedWorks: 'நிறைவடைந்த பணிகள்',
    noActiveIssues: 'தற்போது நடைபெறும் சிக்கல்கள் இல்லை',
    noCompletedIssues: 'நிறைவடைந்த பணிகள் இல்லை',
    issueSingular: 'சிக்கல்',
    issuePlural: 'சிக்கல்கள்',

    // Report
    reportTitle: 'சிக்கலைப் புகாரளிக்கவும்',
    reportSubtitle: 'உங்கள் பகுதியில் உள்ள குடிமை சிக்கல்களைப் படம்பிடித்து புகாரளிக்கவும்',
    captureImage: 'படம் எடுக்க தட்டவும்',
    cameraOnly: 'கேமரா படப்பிடிப்பு மட்டும்',
    cameraOnlyAlert: 'நேரடி கேமரா படப்பிடிப்பு மட்டுமே அனுமதிக்கப்படுகிறது. கோப்பு பதிவேற்றம் முடக்கப்பட்டுள்ளது.',
    descriptionLabel: 'விளக்கம்',
    descriptionPlaceholder: 'சிக்கலை விரிவாக விவரிக்கவும்...',
    descriptionRequired: 'சிக்கலை விவரிக்கவும்',
    voiceInput: 'குரல் உள்ளீடு',
    voiceListening: 'குரல் உள்ளீட்டிற்காக கேட்கிறது...',
    voiceStopped: 'குரல் உள்ளீடு நிறுத்தப்பட்டது',
    voiceCaptured: 'குரல் உள்ளீடு பதிவு செய்யப்பட்டது',
    locationLabel: 'இடம்',
    locationDetecting: 'இடத்தை தானியங்கி கண்டறிகிறது...',
    locationDetected: 'இடம் தானியங்கி கண்டறியப்பட்டது',
    submitReport: 'புகார் சமர்ப்பிக்கவும்',
    submitting: 'சமர்ப்பிக்கிறது...',
    backToDashboard: 'முகப்புக்கு திரும்பு',

    // AI Processing
    aiTitle: 'AI பகுப்பாய்வு',
    aiProcessing: 'உங்கள் புகாரை செயலாக்குகிறது...',
    aiStep1: 'படத்தை பகுப்பாய்வு செய்கிறது...',
    aiStep2: 'சிக்கல் வகையை கண்டறிகிறது...',
    aiStep3: 'தீவிரத்தை மதிப்பிடுகிறது...',
    aiStep4: 'நகல்களை சரிபார்க்கிறது...',
    aiComplete: 'பகுப்பாய்வு நிறைவடைந்தது',
    aiIssueType: 'சிக்கல் வகை',
    aiSeverity: 'தீவிரம்',
    aiDuplicate: 'நிலை',
    aiNewReport: 'புதிய புகார்',
    aiDuplicateFound: 'சாத்தியமான நகல் -- இந்த சிக்கல் ஏற்கனவே புகாரளிக்கப்பட்டிருக்கலாம்',
    aiConfidence: 'நம்பிக்கை',
    aiContinue: 'தொடரவும்',
    aiUploading: 'படத்தை பதிவேற்றுகிறது...',

    // Confirmation
    confirmTitle: 'சிக்கல் வெற்றிகரமாக புகாரளிக்கப்பட்டது',
    confirmText: 'உங்கள் சிக்கல் பதிவு செய்யப்பட்டு அதிகாரிகளால் மதிப்பாய்வு செய்யப்படும்.',
    trackingId: 'கண்காணிப்பு எண்',
    statusLabel: 'நிலை',
    statusReported: 'புகாரளிக்கப்பட்டது',
    trackIssue: 'சிக்கலை கண்காணி',
    goToDashboard: 'முகப்புக்குச் செல்',

    // Tracking
    trackTitle: 'சிக்கலை கண்காணி',
    trackSubtitle: 'நிகழ்நேர நிலை புதுப்பிப்புகள்',
    issueType: 'சிக்கல் வகை',
    severity: 'தீவிரம்',
    location: 'இடம்',
    reportedOn: 'புகாரளிக்கப்பட்ட நாள்',
    statusTimeline: 'நிலை காலக்கெடு',
    reported: 'புகாரளிக்கப்பட்டது',
    assigned: 'ஒதுக்கப்பட்டது',
    inProgress: 'நடைபெறுகிறது',
    completed: 'நிறைவடைந்தது',
    estimatedTime: 'மதிப்பிடப்பட்ட நேரம்',
    pending: 'நிலுவையில்',
    beforeLabel: 'முன்',
    afterLabel: 'பின்',
    verifiedCompleted: 'சரிபார்க்கப்பட்டு நிறைவடைந்தது',

    // Timeline notes
    timelineReportedNote: 'குடிமகனால் புகாரளிக்கப்பட்டது',
    timelineAssignedNote: 'களப்பணி குழுவுக்கு ஒதுக்கப்பட்டது',
    timelineAssignedTo: 'ஒதுக்கப்பட்டவர்',
    timelineProgressNote: 'தளத்தில் பணி தொடங்கியது',
    timelineCompletedNote: 'சிக்கல் தீர்க்கப்பட்டு சரிபார்க்கப்பட்டது',

    // Admin
    adminTitle: 'நிர்வாக முகப்பு',
    adminSubtitle: 'குடிமை சிக்கல்களை நிர்வகித்து கண்காணிக்கவும்',
    issueMap: 'சிக்கல் வரைபடம்',
    allIssues: 'அனைத்து சிக்கல்கள்',
    filterCategory: 'அனைத்து வகைகள்',
    filterStatus: 'அனைத்து நிலைகள்',
    filterLocation: 'அனைத்து இடங்கள்',
    assignBtn: 'பணியாளரை ஒதுக்கு',
    manageBtn: 'நிர்வகி',
    mapLegendTitle: 'தீவிரம்',
    high: 'அதிகம்',
    medium: 'நடுத்தரம்',
    low: 'குறைவு',
    reportsSection: 'புதிய புகார்கள்',
    wipSection: 'நடைபெறும் பணிகள்',
    completedSection: 'நிறைவடைந்த பணிகள்',
    totalIssues: 'மொத்த சிக்கல்கள்',
    resolvedIssues: 'தீர்க்கப்பட்டவை',
    pendingIssues: 'நிலுவையில்',
    loading: 'ஏற்றுகிறது...',
    noReports: 'புதிய புகார்கள் இல்லை',
    noWip: 'நடைபெறும் பணிகள் இல்லை',
    noCompleted: 'நிறைவடைந்த பணிகள் இல்லை',
    estPrefix: 'மதிப்பீடு:',
    workerPrefix: 'பணியாளர்:',
    liveLabel: 'நேரடி',

    // Task Management
    taskTitle: 'பணி மேலாண்மை',
    assignWorker: 'பணியாளரை ஒதுக்கு',
    selectWorker: 'பணியாளரை தேர்ந்தெடுக்கவும்...',
    selectWorkerWarning: 'ஒதுக்க ஒரு பணியாளரைத் தேர்ந்தெடுக்கவும்',
    updateStatus: 'நிலையை புதுப்பிக்கவும்',
    uploadProof: 'நிறைவு ஆதாரத்தை பதிவேற்றவும்',
    uploadProofText: 'ஆதார படத்தை பதிவேற்ற சொடுக்கவும்',
    saveChanges: 'மாற்றங்களை சேமி',
    saving: 'சேமிக்கிறது...',
    estimatedTimeLabel: 'மதிப்பிடப்பட்ட தீர்வு நேரம்',
    estimatedTimePlaceholder: 'எ.கா., 2 மணி நேரம், 1 நாள்...',
    workersAssigned: 'பணியாளர்கள் ஒதுக்கப்பட்டனர்',

    // Severity
    severityHigh: 'அதிகம்',
    severityMedium: 'நடுத்தரம்',
    severityLow: 'குறைவு',

    // Status
    statusAssigned: 'ஒதுக்கப்பட்டது',
    statusInProgress: 'நடைபெறுகிறது',
    statusCompleted: 'நிறைவடைந்தது',

    // Notifications
    notifIssueReported: 'சிக்கல் வெற்றிகரமாக புகாரளிக்கப்பட்டது',
    notifStatusUpdated: 'நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
    notifAssigned: 'பணியாளர்கள் வெற்றிகரமாக ஒதுக்கப்பட்டனர்',
    notifSaved: 'மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன',
    notifLogout: 'வெற்றிகரமாக வெளியேறியது',
    notifUploadFailed: 'பட பதிவேற்றம் தோல்வியுற்றது. மீண்டும் முயற்சிக்கவும்.',
    notifDbError: 'தரவுத்தள பிழை. மீண்டும் முயற்சிக்கவும்.',
    welcomeGreeting: 'வரவேற்கிறோம்',
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('civicLang', lang);
}

export function getLanguage() {
  return currentLang;
}

export function loadLanguage() {
  const saved = localStorage.getItem('civicLang');
  if (saved) {
    currentLang = saved;
  }
  return currentLang;
}

export function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}
