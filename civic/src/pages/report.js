// ============================================
// Report Issue Page - Supabase Integration
// Camera-only capture via getUserMedia API
// AI image analysis via Gemini Vision API
// ============================================

import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { addIssue, getLocations, simulateAI, uploadImage, checkDuplicate, getUser } from '../data/mockData.js';
import { analyzeImage } from '../utils/aiAnalysis.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { showNotification } from '../components/notification.js';
import { icons } from '../utils/icons.js';

let capturedFile = null;
let capturedPreview = null;
let isRecording = false;
let cameraStream = null;
let cameraOpen = false; // guard against double-open

export function renderReportPage() {
  const app = document.getElementById('app');
  const randomLocation = getLocations()[Math.floor(Math.random() * getLocations().length)];
  capturedFile = null;
  capturedPreview = null;
  cameraOpen = false;

  // Mutable location data — can be updated by user
  const currentLocation = {
    name: randomLocation.name,
    lat: randomLocation.lat,
    lng: randomLocation.lng,
  };

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <div class="report-page">
        <button class="back-btn" id="btn-back-dash">
          ${icons.arrowLeft}
          ${t('backToDashboard')}
        </button>
        
        <div class="page-header">
          <h1 class="page-title">${t('reportTitle')}</h1>
          <p class="page-subtitle">${t('reportSubtitle')}</p>
        </div>

        <!-- Camera Capture Card -->
        <div class="card" style="margin-bottom: 24px; overflow: visible">
          <div class="card-body">
            <div class="camera-capture" id="camera-capture-area">
              <div class="camera-icon">
                ${icons.camera}
              </div>
              <p class="camera-text">${t('captureImage')}</p>
              <p class="camera-subtext">${t('cameraOnly')}</p>
            </div>
          </div>
        </div>

        <!-- Description Card -->
        <div class="card" style="margin-bottom: 24px">
          <div class="card-body">
            <div class="form-group" style="margin-bottom: 0">
              <label class="form-label">${t('descriptionLabel')}</label>
              <div class="voice-input-row">
                <textarea class="form-textarea" id="issue-description" placeholder="${t('descriptionPlaceholder')}" rows="4"></textarea>
                <button class="voice-btn" id="voice-btn" title="${t('voiceInput')}">
                  ${icons.mic}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Location Card (Editable) -->
        <div class="card" style="margin-bottom: 24px">
          <div class="card-body">
            <label class="form-label">${t('locationLabel')}</label>
            <div class="form-group" style="margin-bottom: 0">
              <input type="text" class="form-input" id="location-input" placeholder="${t('locationDetecting')}" value="" />
              <p id="location-coords" style="font-size:0.78rem; color:var(--text-muted); margin-top:6px">---</p>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-submit-report">
          ${t('submitReport')}
        </button>
      </div>
    </div>
  `;

  attachNavListeners();
  attachReportListeners(currentLocation);

  // Auto-detect location after 1.5s
  setTimeout(() => {
    const locInput = document.getElementById('location-input');
    const locCoords = document.getElementById('location-coords');
    if (locInput && locCoords) {
      locInput.value = currentLocation.name;
      locCoords.textContent = `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
    }
  }, 1500);
}

// ------------------------------------
// Camera capture via getUserMedia API
// Robust fallback + loading state
// ------------------------------------
function openCameraCapture() {
  return new Promise((resolve, reject) => {
    // Create fullscreen camera overlay
    const overlay = document.createElement('div');
    overlay.id = 'camera-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: #000; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    `;

    // --- Loading spinner shown while camera initializes ---
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'color: white; text-align: center; font-family: Inter, sans-serif;';
    loadingDiv.innerHTML = `
      <div style="width:48px;height:48px;border:3px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;animation:cam-spin 1s linear infinite;margin:0 auto 16px"></div>
      <p style="font-size:1rem;opacity:0.9">Starting camera…</p>
      <style>@keyframes cam-spin{to{transform:rotate(360deg)}}</style>
    `;
    overlay.appendChild(loadingDiv);
    document.body.appendChild(overlay);

    // --- Video element (hidden until stream is ready) ---
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.style.cssText = `
      width: 100%; max-height: 75vh; object-fit: cover;
      background: #111;
    `;

    // --- Button row ---
    const btnRow = document.createElement('div');
    btnRow.style.cssText = `
      display: flex; gap: 24px; align-items: center;
      justify-content: center; padding: 24px;
    `;

    const captureBtn = document.createElement('button');
    captureBtn.style.cssText = `
      width: 72px; height: 72px; border-radius: 50%;
      background: white; border: 4px solid rgba(255,255,255,0.3);
      cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      transition: transform 0.15s;
    `;
    captureBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#1B5E20" stroke-width="2.5" width="28" height="28" style="display:block;margin:auto"><circle cx="12" cy="12" r="10"/></svg>`;

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      width: 48px; height: 48px; border-radius: 50%;
      background: rgba(255,255,255,0.15); border: none;
      cursor: pointer; color: white; font-size: 1.4rem;
      display: flex; align-items: center; justify-content: center;
    `;
    closeBtn.innerHTML = '✕';

    btnRow.appendChild(closeBtn);
    btnRow.appendChild(captureBtn);
    const spacer = document.createElement('div');
    spacer.style.width = '48px';
    btnRow.appendChild(spacer);

    let stream = null;

    function cleanup() {
      if (stream) {
        stream.getTracks().forEach(tr => tr.stop());
        stream = null;
      }
      cameraStream = null;
      cameraOpen = false;
      if (overlay.parentNode) overlay.remove();
    }

    // --- Capture photo handler ---
    captureBtn.addEventListener('click', () => {
      if (!stream) return;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          cleanup();
          resolve({ file, dataUrl });
        } else {
          cleanup();
          reject(new Error('Failed to capture image'));
        }
      }, 'image/jpeg', 0.85);
    });

    // --- Close camera handler ---
    closeBtn.addEventListener('click', () => {
      cleanup();
      reject(new Error('Camera closed by user'));
    });

    // --- Start camera with progressive fallback ---
    (async () => {
      const constraintsList = [
        { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } },
        { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: true },
      ];

      for (const constraints of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('✅ Camera started with:', JSON.stringify(constraints));
          break;
        } catch (err) {
          console.warn('⚠️ Camera constraint failed:', JSON.stringify(constraints), err.message);
        }
      }

      // All constraints failed — show error UI inside the overlay
      if (!stream) {
        loadingDiv.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" width="48" height="48" style="margin:0 auto 16px;display:block">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p style="font-size:1rem;color:#ff6b6b;margin-bottom:8px">Camera access failed</p>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.6);margin-bottom:20px">
            Please allow camera permission in your browser and try again.
          </p>
          <button id="cam-err-close" style="padding:10px 24px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;color:white;cursor:pointer;font-size:0.9rem;font-family:Inter,sans-serif">Close</button>
        `;
        document.getElementById('cam-err-close')?.addEventListener('click', () => {
          cleanup();
          reject(new Error('Camera closed by user'));
        });
        return;
      }

      // Stream acquired — attach to video element
      cameraStream = stream;
      video.srcObject = stream;

      // Wait for video metadata to load so dimensions are available
      await new Promise((res) => {
        video.onloadedmetadata = () => {
          video.play().then(res).catch(res);
        };
        // Safety timeout — don't hang forever
        setTimeout(res, 5000);
      });

      // Swap loading spinner for live camera view
      overlay.innerHTML = '';
      overlay.appendChild(video);
      overlay.appendChild(btnRow);
    })();
  });
}

function attachReportListeners(locationData) {
  document.getElementById('btn-back-dash')?.addEventListener('click', () => navigate('dashboard'));

  // Camera capture — getUserMedia only, NO file input
  const captureArea = document.getElementById('camera-capture-area');

  captureArea?.addEventListener('click', async () => {
    // Prevent opening multiple camera overlays
    if (cameraOpen) return;
    cameraOpen = true;

    try {
      const result = await openCameraCapture();
      capturedFile = result.file;
      capturedPreview = result.dataUrl;
      captureArea.classList.add('has-image');
      captureArea.innerHTML = `<img src="${capturedPreview}" alt="Captured issue" />`;
    } catch (err) {
      if (err.message !== 'Camera closed by user') {
        showNotification(t('cameraOnlyAlert'), 'warning');
        console.error('Camera error:', err);
      }
    } finally {
      cameraOpen = false;
    }
  });

  // Block drag-and-drop file uploads
  captureArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  captureArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showNotification(t('cameraOnlyAlert'), 'warning');
  });

  // Location input — update locationData when user edits
  const locationInput = document.getElementById('location-input');
  locationInput?.addEventListener('input', (e) => {
    locationData.name = e.target.value.trim();
  });

  // Voice button (UI simulation)
  const voiceBtn = document.getElementById('voice-btn');
  voiceBtn?.addEventListener('click', () => {
    if (isRecording) {
      voiceBtn.classList.remove('recording');
      isRecording = false;
      showNotification(t('voiceStopped'), 'info');
    } else {
      voiceBtn.classList.add('recording');
      isRecording = true;
      showNotification(t('voiceListening'), 'info');
      setTimeout(() => {
        if (isRecording) {
          voiceBtn.classList.remove('recording');
          isRecording = false;
          const textarea = document.getElementById('issue-description');
          if (textarea && !textarea.value) {
            textarea.value = 'There is a significant issue here that needs immediate attention. The damage appears to be affecting the surrounding area.';
          }
          showNotification(t('voiceCaptured'), 'success');
        }
      }, 3000);
    }
  });

  // Submit
  const submitBtn = document.getElementById('btn-submit-report');
  submitBtn?.addEventListener('click', async () => {
    const description = document.getElementById('issue-description')?.value.trim();

    // Read current location from the input (user may have edited it)
    const locInput = document.getElementById('location-input');
    if (locInput && locInput.value.trim()) {
      locationData.name = locInput.value.trim();
    }

    if (!description) {
      showNotification(t('descriptionRequired'), 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="spinner"></div> ${t('submitting')}`;

    await showAIProcessing(description, capturedFile, locationData);
  });
}

async function showAIProcessing(description, imageFile, locationData) {
  // ── Start AI analysis in background (runs in parallel with step animation) ──
  const aiAnalysisPromise = (async () => {
    // Try Gemini Vision API if an image was captured
    if (capturedPreview) {
      try {
        const aiResult = await analyzeImage(capturedPreview, description);
        if (aiResult) {
          console.log('🤖 Using Gemini Vision AI result');
          return aiResult;
        }
      } catch (err) {
        console.warn('🤖 AI image analysis failed, falling back to keywords:', err);
      }
    }
    // Fallback: keyword-based analysis from description text
    console.log('🔤 Using keyword-based analysis');
    return simulateAI(description);
  })();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'ai-overlay';
  overlay.id = 'ai-overlay';
  overlay.innerHTML = `
    <div class="ai-card">
      <div class="ai-brain">
        <div class="ai-brain-circle"></div>
        <div class="ai-brain-inner"></div>
        <div class="ai-brain-core"></div>
      </div>
      <h2 style="font-size: 1.3rem; color: var(--primary); margin-bottom: 4px">${t('aiTitle')}</h2>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px">${t('aiProcessing')}</p>
      
      <div class="ai-steps" id="ai-steps">
        <div class="ai-step" id="ai-step-0">
          <div class="ai-step-icon">1</div>
          <span>${t('aiStep1')}</span>
        </div>
        <div class="ai-step" id="ai-step-1">
          <div class="ai-step-icon">2</div>
          <span>${t('aiStep2')}</span>
        </div>
        <div class="ai-step" id="ai-step-2">
          <div class="ai-step-icon">3</div>
          <span>${t('aiStep3')}</span>
        </div>
        <div class="ai-step" id="ai-step-3">
          <div class="ai-step-icon">4</div>
          <span>${t('aiStep4')}</span>
        </div>
      </div>

      <div id="ai-result-container" style="display: none"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate steps with realistic delays
  const steps = ['ai-step-0', 'ai-step-1', 'ai-step-2', 'ai-step-3'];
  for (let i = 0; i < steps.length; i++) {
    const stepEl = document.getElementById(steps[i]);
    if (stepEl) {
      stepEl.classList.add('active');
      await delay(1000 + Math.random() * 800);
      stepEl.classList.remove('active');
      stepEl.classList.add('done');
      const iconEl = stepEl.querySelector('.ai-step-icon');
      if (iconEl) {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>`;
      }
    }
  }

  // ── Await the AI result (may already be resolved) ──
  const aiResult = await aiAnalysisPromise;

  // Check for duplicates in Supabase
  let isDuplicate = false;
  try {
    const duplicates = await checkDuplicate(locationData.name, aiResult.issueType);
    isDuplicate = duplicates.length > 0;
  } catch (e) {
    console.error('Duplicate check failed:', e);
  }

  // Show result
  const sevClass = aiResult.severity.toLowerCase();
  const sevLabel = aiResult.severity === 'High' ? t('severityHigh') :
                   aiResult.severity === 'Medium' ? t('severityMedium') : t('severityLow');

  const resultContainer = document.getElementById('ai-result-container');
  if (resultContainer) {
    const brain = overlay.querySelector('.ai-brain');
    if (brain) brain.style.display = 'none';
    const titleEl = overlay.querySelector('h2');
    if (titleEl) titleEl.textContent = t('aiComplete');
    const subtitleEl = overlay.querySelector('p');
    if (subtitleEl) subtitleEl.style.display = 'none';

    resultContainer.style.display = 'block';
    resultContainer.innerHTML = `
      <div class="ai-result">
        <div class="ai-result-item">
          <span class="ai-result-label">${t('aiIssueType')}</span>
          <span class="ai-result-value">${aiResult.issueType}</span>
        </div>
        <div class="ai-result-item">
          <span class="ai-result-label">${t('aiSeverity')}</span>
          <span class="badge badge-${sevClass}">${sevLabel}</span>
        </div>
        <div class="ai-result-item">
          <span class="ai-result-label">${t('aiDuplicate')}</span>
          <span class="ai-result-value" style="color: ${isDuplicate ? 'var(--severity-medium)' : 'var(--secondary)'}; font-size: 0.82rem">
            ${isDuplicate ? t('aiDuplicateFound') : t('aiNewReport')}
          </span>
        </div>
        <div class="ai-result-item">
          <span class="ai-result-label">${t('aiConfidence')}</span>
          <span class="ai-result-value">${aiResult.confidence}%</span>
        </div>

        <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: 20px" id="btn-ai-continue">
          ${t('aiContinue')}
        </button>
      </div>
    `;

    document.getElementById('btn-ai-continue')?.addEventListener('click', async () => {
      // Disable button to prevent double clicks
      const continueBtn = document.getElementById('btn-ai-continue');
      continueBtn.disabled = true;
      continueBtn.innerHTML = `<div class="spinner"></div> ${t('aiUploading')}`;

      try {
        // Upload image to Supabase Storage (non-fatal if fails)
        let imageUrl = null;
        if (imageFile) {
          try {
            imageUrl = await uploadImage(imageFile);
            console.log('✅ Image uploaded:', imageUrl);
          } catch (uploadErr) {
            console.warn('⚠️ Image upload failed (proceeding without image):', uploadErr);
            imageUrl = null;
          }
        }

        // Insert into Supabase
        const newIssue = await addIssue({
          image_url: imageUrl,
          description: description,
          location: locationData.name,
          location_lat: locationData.lat,
          location_lng: locationData.lng,
          issue_type: aiResult.issueType,
          severity: aiResult.severity,
        });

        overlay.remove();
        navigate('confirmation', { issue: newIssue });
      } catch (err) {
        console.error('Submit error:', err);
        showNotification(t('notifDbError'), 'error');
        continueBtn.disabled = false;
        continueBtn.innerHTML = t('aiContinue');
      }
    });
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
