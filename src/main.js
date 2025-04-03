import './style.css';
import { testConnection } from './utils/supabase';

// Test Supabase connection
async function initApp() {
    try {
        const isConnected = await testConnection()
        if (isConnected) {
            console.log('Ready to use Supabase!')
        } else {
            console.error('Failed to connect to Supabase')
        }
    } catch (error) {
        console.error('Initialization error:', error)
    }
}

initApp()