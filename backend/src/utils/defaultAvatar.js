/**
 * Default avatar pool for users without custom avatars
 * Uses S3-hosted Labubu character images
 */
const DEFAULT_AVATARS = [
  'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/avatar/labubu1.jpeg',
  'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/avatar/labubu2.jpeg',
  'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/avatar/labubu3.jpeg',
  'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/avatar/labubu4.jpeg',
  'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/avatar/labubu5.jpeg',
  'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/avatar/labubu6.jpeg',
  'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/avatar/labubu7.jpeg',
];

/**
 * Get a deterministic default avatar based on user identifier
 * Same user always gets the same avatar
 * @param {string} identifier - User email, username, or ID
 * @returns {string} Avatar URL
 */
const getDefaultAvatar = (identifier = '') => {
  const key = String(identifier || 'default');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[idx];
};

/**
 * Get a random default avatar
 * @returns {string} Avatar URL
 */
const getRandomDefaultAvatar = () => {
  const idx = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  return DEFAULT_AVATARS[idx];
};

module.exports = {
  DEFAULT_AVATARS,
  getDefaultAvatar,
  getRandomDefaultAvatar,
};
