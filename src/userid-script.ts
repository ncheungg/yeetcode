// on load grab the leetcode username
const avatarImgUrl: string | null =
  (<any>window)?.LeetCodeData?.userStatus?.avatar ||
  document
    .getElementsByClassName('h-6 w-6 rounded-full object-cover')[0]
    ?.getAttribute('src');
const userID: string | undefined = avatarImgUrl?.split('/')[4];

console.log(avatarImgUrl, userID);
