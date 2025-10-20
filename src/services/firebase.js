// ==============================
// Firebase 初始化配置部分
// ==============================
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// 这是你的 Firebase 项目信息
const firebaseConfig = {
  apiKey: 'AIzaSyBAOvnvPY6h1jjHkTsbOBZdiRmJIs9Ot2A',
  authDomain: 'week7-weifeng.firebaseapp.com',
  projectId: 'week7-weifeng',
  storageBucket: 'week7-weifeng.appspot.com',
  messagingSenderId: '504670832668',
  appId: '1:504670832668:web:f12b081d8858914655b7d9',
}

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig)

// 初始化 Auth 和 Firestore
export const auth = getAuth(app)
export const db = getFirestore(app)

// ==============================
// Firestore 用户操作封装部分
// ==============================
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

// 获取所有用户
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// 添加用户
export async function addUser(userData) {
  const usersRef = collection(db, 'users')
  await addDoc(usersRef, {
    ...userData,
    registeredAt: new Date().toISOString(),
  })
}

// 检查用户名是否存在
export async function isUsernameExists(username) {
  const q = query(collection(db, 'users'), where('username', '==', username))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}
