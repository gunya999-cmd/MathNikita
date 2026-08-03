export type StudentProfile = {
  id: string;
  name: string;
  avatar: string;
  pinSalt: string;
  pinHash: string;
  createdAt: string;
  lastUsedAt: string;
};

type ProfileRegistry = {
  version: 1;
  profiles: StudentProfile[];
};

type ProfileStorageBundle = {
  version: 1;
  updatedAt: string;
  storage: Record<string, string>;
};

const ACCOUNT_PREFIX = 'mathnikita:accounts:';
const REGISTRY_KEY = `${ACCOUNT_PREFIX}registry:v1`;
const WORKSPACE_OWNER_KEY = `${ACCOUNT_PREFIX}workspace-owner:v1`;
const SESSION_KEY = `${ACCOUNT_PREFIX}session:v1`;
const PROFILE_DATA_PREFIX = `${ACCOUNT_PREFIX}profile-data:`;
const AVATARS = ['🐱', '🦊', '🐼', '🐯', '🐧', '🦁', '🐙', '🐨'];

function emptyRegistry(): ProfileRegistry {
  return { version: 1, profiles: [] };
}

function loadRegistry(): ProfileRegistry {
  try {
    const parsed = JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? 'null') as ProfileRegistry | null;
    if (parsed?.version === 1 && Array.isArray(parsed.profiles)) return parsed;
  } catch {
    // Ignore corrupted local registry and keep the login screen usable.
  }
  return emptyRegistry();
}

function saveRegistry(registry: ProfileRegistry) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

function profileDataKey(profileId: string) {
  return `${PROFILE_DATA_PREFIX}${profileId}:v1`;
}

function isStudentDataKey(key: string) {
  return !key.startsWith(ACCOUNT_PREFIX);
}

function collectLiveStudentStorage() {
  const storage: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !isStudentDataKey(key)) continue;
    const value = localStorage.getItem(key);
    if (value !== null) storage[key] = value;
  }
  return storage;
}

function clearLiveStudentStorage() {
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && isStudentDataKey(key)) keys.push(key);
  }
  keys.forEach(key => localStorage.removeItem(key));
}

function loadProfileStorage(profileId: string): Record<string, string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(profileDataKey(profileId)) ?? 'null') as ProfileStorageBundle | null;
    if (parsed?.version === 1 && parsed.storage && typeof parsed.storage === 'object') return parsed.storage;
  } catch {
    // A broken backup must not block the learner from opening the app.
  }
  return {};
}

function saveProfileStorage(profileId: string, storage: Record<string, string>) {
  const bundle: ProfileStorageBundle = {
    version: 1,
    updatedAt: new Date().toISOString(),
    storage,
  };
  localStorage.setItem(profileDataKey(profileId), JSON.stringify(bundle));
}

function restoreProfileStorage(profileId: string) {
  clearLiveStudentStorage();
  const storage = loadProfileStorage(profileId);
  Object.entries(storage).forEach(([key, value]) => localStorage.setItem(key, value));
}

function workspaceOwnerId() {
  return localStorage.getItem(WORKSPACE_OWNER_KEY);
}

function sessionProfileId() {
  return sessionStorage.getItem(SESSION_KEY);
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function randomHex(length = 16) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function pinDigest(pin: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

function cleanName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function makeProfileId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${randomHex(8)}`;
}

function validateName(name: string) {
  if (name.length < 2) throw new Error('Введите имя ученика — минимум 2 символа.');
  if (name.length > 24) throw new Error('Имя должно быть не длиннее 24 символов.');
}

function validatePin(pin: string) {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN должен состоять ровно из 4 цифр.');
}

export function getStudentProfiles() {
  return [...loadRegistry().profiles].sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
}

export function getAuthenticatedStudentProfile() {
  const id = sessionProfileId();
  if (!id || workspaceOwnerId() !== id) return null;
  return loadRegistry().profiles.find(profile => profile.id === id) ?? null;
}

export function hasUnassignedStudentProgress() {
  return loadRegistry().profiles.length === 0 && Object.keys(collectLiveStudentStorage()).length > 0;
}

export function saveCurrentStudentWorkspace() {
  const ownerId = workspaceOwnerId();
  if (!ownerId) return;
  const profileExists = loadRegistry().profiles.some(profile => profile.id === ownerId);
  if (!profileExists) return;
  saveProfileStorage(ownerId, collectLiveStudentStorage());
}

function activateWorkspace(profileId: string) {
  const ownerId = workspaceOwnerId();
  if (ownerId === profileId) {
    sessionStorage.setItem(SESSION_KEY, profileId);
    return;
  }
  if (ownerId) saveCurrentStudentWorkspace();
  restoreProfileStorage(profileId);
  localStorage.setItem(WORKSPACE_OWNER_KEY, profileId);
  sessionStorage.setItem(SESSION_KEY, profileId);
}

function markProfileUsed(profileId: string) {
  const registry = loadRegistry();
  const now = new Date().toISOString();
  registry.profiles = registry.profiles.map(profile => profile.id === profileId ? { ...profile, lastUsedAt: now } : profile);
  saveRegistry(registry);
}

export async function createStudentProfile(nameInput: string, pin: string, adoptExistingProgress: boolean) {
  const name = cleanName(nameInput);
  validateName(name);
  validatePin(pin);
  const registry = loadRegistry();
  if (registry.profiles.some(profile => profile.name.toLocaleLowerCase('ru-RU') === name.toLocaleLowerCase('ru-RU'))) {
    throw new Error('Ученик с таким именем уже есть на этом устройстве.');
  }

  const now = new Date().toISOString();
  const salt = randomHex(16);
  const profile: StudentProfile = {
    id: makeProfileId(),
    name,
    avatar: AVATARS[registry.profiles.length % AVATARS.length],
    pinSalt: salt,
    pinHash: await pinDigest(pin, salt),
    createdAt: now,
    lastUsedAt: now,
  };

  registry.profiles.push(profile);
  saveRegistry(registry);

  if (adoptExistingProgress && registry.profiles.length === 1) {
    localStorage.setItem(WORKSPACE_OWNER_KEY, profile.id);
    saveProfileStorage(profile.id, collectLiveStudentStorage());
    sessionStorage.setItem(SESSION_KEY, profile.id);
  } else {
    saveProfileStorage(profile.id, {});
    activateWorkspace(profile.id);
  }

  return profile;
}

export async function authenticateStudentProfile(profileId: string, pin: string) {
  validatePin(pin);
  const profile = loadRegistry().profiles.find(item => item.id === profileId);
  if (!profile) throw new Error('Профиль ученика не найден.');
  const hash = await pinDigest(pin, profile.pinSalt);
  if (hash !== profile.pinHash) throw new Error('Неверный PIN. Попробуйте ещё раз.');
  activateWorkspace(profile.id);
  markProfileUsed(profile.id);
  return profile;
}

export function switchStudentProfile() {
  saveCurrentStudentWorkspace();
  sessionStorage.removeItem(SESSION_KEY);
}

export function backupStudentProfileOnPageHide() {
  const sessionId = sessionProfileId();
  if (!sessionId || sessionId !== workspaceOwnerId()) return;
  try {
    saveCurrentStudentWorkspace();
  } catch {
    // The live workspace remains intact even if a best-effort backup cannot be written.
  }
}
