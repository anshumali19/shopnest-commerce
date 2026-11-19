export const FIN_TONE = { Paid: 'green', Pending: 'yellow', Refunded: 'gray' };
export const FUL_TONE = { Fulfilled: 'gray', Unfulfilled: 'yellow' };
export const thumb = (url, w = 160) => (url || '').replace(/w=\d+/, `w=${w}`);
