import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test function
export async function testConnection() {
    try {
        // Get current session (works even if no user is logged in)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
            console.error('Auth check failed:', error.message)
            return false
        }
        
        console.log('Connection successful! Auth status checked:', data)
        return true
    } catch (error) {
        console.error('Connection test error:', error.message)
        return false
    }
}