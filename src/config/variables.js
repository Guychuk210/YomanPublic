const RENDER_URL = 'https://yoman-server.onrender.com';
const LOCAL_URL = 'http://192.168.1.101:5000';

export const API_URL = __DEV__ ? LOCAL_URL : RENDER_URL;
// If you want to force LOCAL_URL, uncomment this:
// export const API_URL = LOCAL_URL;
