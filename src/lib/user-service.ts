import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { cookies } from 'next/headers';
import { User } from '@/types';

const USERS_PATH = path.join(process.cwd(), 'src', 'data', 'users.csv');

// Simple Base64 "hash" for demonstration purposes as per plan
const hashPassword = (password: string) => Buffer.from(password).toString('base64');

export async function getUsers(): Promise<User[]> {
    if (!fs.existsSync(USERS_PATH)) {
        // Create folder if not exists
        const dir = path.dirname(USERS_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        return [];
    }
    const fileContent = fs.readFileSync(USERS_PATH, 'utf8');
    return new Promise((resolve) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as User[]),
            error: () => resolve([])
        });
    });
}

export async function registerUser(userData: Partial<User>): Promise<User | null> {
    try {
        const users = await getUsers();

        if (users.find(u => u.email === userData.email)) {
            throw new Error("Email already registered");
        }

        const newUser: User = {
            id: `user_${Date.now()}`,
            username: userData.username || 'Anonymous',
            handle: userData.handle || userData.username?.toLowerCase().replace(/\s/g, '_') || 'user',
            email: userData.email || '',
            password: userData.password ? hashPassword(userData.password) : '',
            bio: userData.bio || 'Explorer of the sound void.',
            avatar: userData.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData.username || Date.now()}`,
            joined: new Date().toISOString().split('T')[0],
            visibility: true,
            history: true,
            sync: true
        };

        const csvData = Papa.unparse([...users, newUser], { header: true });
        fs.writeFileSync(USERS_PATH, csvData);

        return newUser;
    } catch (error) {
        console.error("Error registering user:", error);
        return null;
    }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
    try {
        const users = await getUsers();
        const user = users.find(u => u.email === email && u.password === hashPassword(password));
        return user || null;
    } catch (error) {
        console.error("Error logging in user:", error);
        return null;
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId || !fs.existsSync(USERS_PATH)) return null;

        const users = await getUsers();
        const currentUser = users.find(u => u.id === userId);

        if (currentUser) {
            return {
                ...currentUser,
                visibility: String(currentUser.visibility) === 'true',
                history: String(currentUser.history) === 'true',
                sync: String(currentUser.sync) === 'true'
            };
        }
        return null;
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
        return null;
    }
}

export async function updateUserProfile(updatedUser: Partial<User>): Promise<boolean> {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    const allUsers = await getUsers();
    const index = allUsers.findIndex(u => u.id === currentUser.id);
    if (index === -1) return false;

    allUsers[index] = { ...allUsers[index], ...updatedUser };

    const csvData = Papa.unparse(allUsers, { header: true });
    fs.writeFileSync(USERS_PATH, csvData);

    return true;
}
