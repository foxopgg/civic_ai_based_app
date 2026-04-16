// ============================================
// Supabase Data Layer
// All data operations go through Supabase.
// No mock data - everything is live from the database.
// ============================================

import { supabase, STORAGE_BUCKET } from '../utils/supabase.js';

let currentUser = null;

// --- User management (localStorage, no auth table) ---

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
  localStorage.setItem('civicUser', JSON.stringify(user));
}

export function loadUser() {
  const saved = localStorage.getItem('civicUser');
  if (saved) {
    currentUser = JSON.parse(saved);
    return currentUser;
  }
  return null;
}

export function logout() {
  currentUser = null;
  localStorage.removeItem('civicUser');
}

// --- Image upload to Supabase Storage ---

export async function uploadImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `reports/${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}

export async function uploadProofImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `proof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `proofs/${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Proof upload error:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}

// --- Fetch reports from Supabase ---

export async function getIssues() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('getIssues error:', error); return []; }
  return data || [];
}

export async function getIssueById(id) {
  // id can be numeric or UUID
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error) { console.error('getIssueById error:', error); return null; }
  return data;
}

export async function getIssuesByStatus(...statuses) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .in('status', statuses)
    .order('created_at', { ascending: false });

  if (error) { console.error('getIssuesByStatus error:', error); return []; }
  return data || [];
}

export async function getActiveIssues() {
  return getIssuesByStatus('In Progress', 'Assigned');
}

export async function getCompletedIssues() {
  return getIssuesByStatus('Completed');
}

export async function getReportedIssues() {
  return getIssuesByStatus('Reported');
}

// --- Analytics counts ---

export async function getAnalytics() {
  const { data: all, error: e1 } = await supabase
    .from('reports')
    .select('id', { count: 'exact' });

  const { data: resolved, error: e2 } = await supabase
    .from('reports')
    .select('id', { count: 'exact' })
    .eq('status', 'Completed');

  const { data: pending, error: e3 } = await supabase
    .from('reports')
    .select('id', { count: 'exact' })
    .in('status', ['Reported', 'Assigned', 'In Progress']);

  // For count queries supabase returns count in the response headers
  // But with select('id', {count:'exact'}) it's in data.length
  return {
    total: all?.length ?? 0,
    resolved: resolved?.length ?? 0,
    pending: pending?.length ?? 0,
  };
}

// --- Insert new report ---

export async function addIssue(issue) {
  const user = getUser();

  const row = {
    user_id: issue.user_id || user?.id || null,
    image_url: issue.image_url || null,
    description: issue.description,
    location: issue.location,
    location_lat: issue.location_lat || null,
    location_lng: issue.location_lng || null,
    issue_type: issue.issue_type,
    severity: issue.severity,
    status: 'Reported',
  };

  console.log('📤 Inserting report into Supabase:', row);

  let { data, error } = await supabase
    .from('reports')
    .insert(row)
    .select()
    .single();

  // If column doesn't exist, retry with base columns only
  if (error && (error.code === '42703' || error.message?.includes('column') || error.code === 'PGRST204')) {
    console.warn('⚠️ Some columns missing, retrying with base columns...');

    const baseRow = {
      user_id: issue.user_id || user?.id || null,
      image_url: issue.image_url || null,
      description: issue.description,
      location: issue.location,
      issue_type: issue.issue_type,
      severity: issue.severity,
      status: 'Reported',
    };

    const result = await supabase
      .from('reports')
      .insert(baseRow)
      .select()
      .single();

    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('❌ addIssue error:', error);
    console.error('  → Code:', error.code);
    console.error('  → Message:', error.message);
    console.error('  → Details:', error.details);
    console.error('  → Hint:', error.hint);
    throw error;
  }

  console.log('✅ Report inserted successfully:', data);
  return data;
}

// --- Update status ---

export async function updateIssueStatus(issueId, status) {
  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', issueId)
    .select()
    .single();

  if (error) { console.error('updateStatus error:', error); throw error; }
  return data;
}

// --- Assign worker + estimated time ---

export async function assignWorker(issueId, workerName, estimatedTime) {
  let { data, error } = await supabase
    .from('reports')
    .update({
      status: 'Assigned',
      assigned_worker: workerName,
      estimated_time: estimatedTime,
    })
    .eq('id', issueId)
    .select()
    .single();

  // Fallback if assigned_worker column doesn't exist
  if (error && (error.code === '42703' || error.message?.includes('column'))) {
    console.warn('⚠️ assigned_worker column missing, updating status + estimated_time only');
    const result = await supabase
      .from('reports')
      .update({ status: 'Assigned', estimated_time: estimatedTime || workerName })
      .eq('id', issueId)
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) { console.error('assignWorker error:', error); throw error; }
  return data;
}

// --- Upload completion proof ---

export async function setCompletionProof(issueId, proofUrl) {
  let { data, error } = await supabase
    .from('reports')
    .update({
      status: 'Completed',
      completion_proof_url: proofUrl,
    })
    .eq('id', issueId)
    .select()
    .single();

  // Fallback if completion_proof_url column doesn't exist
  if (error && (error.code === '42703' || error.message?.includes('column'))) {
    console.warn('⚠️ completion_proof_url column missing, updating status only');
    const result = await supabase
      .from('reports')
      .update({ status: 'Completed' })
      .eq('id', issueId)
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) { console.error('setCompletionProof error:', error); throw error; }
  return data;
}

// --- Duplicate check ---

export async function checkDuplicate(location, issueType) {
  const { data, error } = await supabase
    .from('reports')
    .select('id, issue_type, location, status')
    .eq('location', location)
    .eq('issue_type', issueType)
    .neq('status', 'Completed');

  if (error) { console.error('checkDuplicate error:', error); return []; }
  return data || [];
}

// --- Simulated AI logic (no real AI API) ---

export function simulateAI(description) {
  const desc = (description || '').toLowerCase();

  // Issue type detection based on keywords
  let issueType = 'Pothole'; // default
  if (desc.includes('garbage') || desc.includes('trash') || desc.includes('waste') || desc.includes('dump')) {
    issueType = 'Garbage';
  } else if (desc.includes('water') || desc.includes('leak') || desc.includes('pipe') || desc.includes('flood')) {
    issueType = 'Water Leakage';
  } else if (desc.includes('light') || desc.includes('lamp') || desc.includes('dark') || desc.includes('street light')) {
    issueType = 'Streetlight';
  } else if (desc.includes('road') || desc.includes('crack') || desc.includes('broken road') || desc.includes('surface')) {
    issueType = 'Road Damage';
  } else if (desc.includes('pothole') || desc.includes('hole') || desc.includes('pit')) {
    issueType = 'Pothole';
  }

  // Severity detection based on keywords
  let severity = 'Low';
  const highWords = ['big', 'danger', 'accident', 'severe', 'major', 'critical', 'hazard', 'emergency', 'urgent', 'serious', 'large'];
  const medWords = ['moderate', 'problem', 'medium', 'concern', 'noticeable', 'significant'];

  if (highWords.some(w => desc.includes(w))) {
    severity = 'High';
  } else if (medWords.some(w => desc.includes(w))) {
    severity = 'Medium';
  }

  const confidence = (85 + Math.random() * 14).toFixed(1);

  return { issueType, severity, confidence };
}

// --- Locations list (for UI dropdowns / auto-detect) ---

const locations = [
  { name: 'Anna Nagar, Chennai', lat: 13.085, lng: 80.209 },
  { name: 'T Nagar, Chennai', lat: 13.040, lng: 80.233 },
  { name: 'Adyar, Chennai', lat: 13.006, lng: 80.256 },
  { name: 'Velachery, Chennai', lat: 12.975, lng: 80.221 },
  { name: 'Mylapore, Chennai', lat: 13.034, lng: 80.269 },
  { name: 'Kodambakkam, Chennai', lat: 13.053, lng: 80.224 },
  { name: 'Guindy, Chennai', lat: 13.009, lng: 80.213 },
  { name: 'Porur, Chennai', lat: 13.035, lng: 80.157 },
  { name: 'Ambattur, Chennai', lat: 13.115, lng: 80.161 },
  { name: 'Tambaram, Chennai', lat: 12.924, lng: 80.118 },
];

export function getLocations() {
  return [...locations];
}

// --- Workers list ---

const workers = [
  { id: 'W001', name: 'Rajesh Kumar' },
  { id: 'W002', name: 'Suresh Babu' },
  { id: 'W003', name: 'Priya Sharma' },
  { id: 'W004', name: 'Karthik Rajan' },
  { id: 'W005', name: 'Anitha Devi' },
];

export function getWorkers() {
  return [...workers];
}

// --- Issue types list ---

const issueTypes = ['Pothole', 'Garbage', 'Water Leakage', 'Streetlight', 'Road Damage'];

export function getIssueTypes() {
  return [...issueTypes];
}
