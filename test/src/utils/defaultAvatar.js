// Default avatar pool (public S3 links)
export const DEFAULT_AVATARS = [
  'https://346141380929-azck26so.ap-southeast-2.console.aws.amazon.com/s3/object/toy-store-project-of-springwang?region=ap-southeast-2&prefix=defaults/avatar/labubu1.jpeg',
  'https://346141380929-azck26so.ap-southeast-2.console.aws.amazon.com/s3/object/toy-store-project-of-springwang?region=ap-southeast-2&prefix=defaults/avatar/labubu2.jpeg',
  'https://346141380929-azck26so.ap-southeast-2.console.aws.amazon.com/s3/object/toy-store-project-of-springwang?region=ap-southeast-2&prefix=defaults/avatar/labubu3.jpeg',
  'https://346141380929-azck26so.ap-southeast-2.console.aws.amazon.com/s3/object/toy-store-project-of-springwang?region=ap-southeast-2&prefix=defaults/avatar/labubu4.jpeg',
  'https://346141380929-azck26so.ap-southeast-2.console.aws.amazon.com/s3/object/toy-store-project-of-springwang?region=ap-southeast-2&prefix=defaults/avatar/labubu5.jpeg',
  'https://346141380929-azck26so.ap-southeast-2.console.aws.amazon.com/s3/object/toy-store-project-of-springwang?region=ap-southeast-2&prefix=defaults/avatar/labubu6.jpeg',
  'https://346141380929-azck26so.ap-southeast-2.console.aws.amazon.com/s3/object/toy-store-project-of-springwang?region=ap-southeast-2&prefix=defaults/avatar/labubu7.jpeg',
];

// Deterministic pick based on user data so avatar stays stable across renders
export const getDefaultAvatar = (user = {}) => {
  const key = user._id || user.id || user.email || user.username || user.fullname || 'default';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[idx];
};
