import { supabase } from '../utils/supabase'

// Auth state management
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
}

export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
}

// Authentication functions
export const signUp = async ({ email, password, username }) => {
    try {
        // 1. Sign up the user
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        })
        if (signUpError) throw signUpError

        // 2. Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    username,
                    avatar_url: null,
                }
            ])
        if (profileError) throw profileError

        return { user }
    } catch (error) {
        throw error
    }
}

export const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if (error) throw error
    return data
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// Profile management
export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    
    if (error) throw error
    return data
}

export const updateProfile = async ({ userId, updates }) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
    
    if (error) throw error
    return data
}

// Avatar management
export const uploadAvatar = async (userId, file) => {
    try {
        // 1. Upload file to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file)
        
        if (uploadError) throw uploadError

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        // 3. Update profile with new avatar URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userId)

        if (updateError) throw updateError

        return publicUrl
    } catch (error) {
        throw error
    }
}

export const deleteAvatar = async (userId) => {
    try {
        // 1. Get current avatar URL
        const { data: profile } = await getProfile(userId)
        if (!profile.avatar_url) return

        // 2. Extract filename from URL
        const avatarUrl = profile.avatar_url
        const fileName = avatarUrl.split('/').pop()

        // 3. Delete from storage
        const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([fileName])
        
        if (deleteError) throw deleteError

        // 4. Update profile to remove avatar URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', userId)

        if (updateError) throw updateError
    } catch (error) {
        throw error
    }
}

// Password reset
export const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
}

export const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    })
    if (error) throw error
}

// Auth state change listener
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })
}
