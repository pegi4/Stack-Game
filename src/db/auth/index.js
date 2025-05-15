import { supabase } from '../../utils/supabase'

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
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        
        if (error && error.code !== 'PGRST116') throw error
        
        if (!data) {
            // Create a default profile if one doesn't exist
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: userId,
                        username: 'Player',
                        avatar_url: null,
                    }
                ])
                .select()
                .single()
            
            if (insertError) throw insertError
            return newProfile
        }
        
        return data
    } catch (error) {
        throw error
    }
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
        // First, delete the previous avatar if exists
        try {
            // Get current profile data
            const profileData = await getProfile(userId);
            
            // If user has an existing avatar, delete it first
            if (profileData && profileData.avatar_url) {
                // Extract existing filename from URL
                const currentAvatarUrl = profileData.avatar_url;
                const currentFileName = currentAvatarUrl.split('/').pop();
                
                // Delete the file from storage
                await supabase.storage
                    .from('avatars')
                    .remove([currentFileName]);
                
                console.log('Previous avatar deleted:', currentFileName);
            }
        } catch (error) {
            // Just log but continue if there's an error deleting old avatar
            console.warn('Error deleting previous avatar:', error);
        }

        // 1. Upload new file to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
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
        console.log('Starting avatar deletion for user:', userId);
        
        // 1. Get current avatar URL
        const profileData = await getProfile(userId)
        
        // Check if profile exists and has an avatar_url
        if (!profileData || !profileData.avatar_url) {
            console.log('No avatar to delete or profile not found');
            return;
        }

        // 2. Extract filename from URL
        const avatarUrl = profileData.avatar_url;
        console.log('Avatar URL to delete:', avatarUrl);
        
        // URL could be in different formats, extract filename safely
        let fileName;
        try {
            // Try to get the file path from the URL
            const url = new URL(avatarUrl);
            const pathParts = url.pathname.split('/');
            // The last part should be the filename
            fileName = pathParts[pathParts.length - 1];
            
            // For Supabase URLs, the filename might include URL parameters, clean it up
            if (fileName.includes('?')) {
                fileName = fileName.split('?')[0];
            }
        } catch (error) {
            // If URL parsing fails, fall back to simple splitting
            fileName = avatarUrl.split('/').pop();
        }
        
        console.log('Extracted filename to delete:', fileName);

        // 3. Update profile to remove avatar URL first (to prevent orphaned references)
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating profile:', updateError);
            throw updateError;
        }
        
        console.log('Profile updated, removing avatar_url reference');

        // 4. Delete from storage (even if this fails, the profile is updated)
        console.log('Attempting to delete file from storage:', fileName);
        
        const { error: deleteError, data: deleteData } = await supabase.storage
            .from('avatars')
            .remove([fileName])
        
        if (deleteError) {
            console.error('Error deleting avatar file:', deleteError);
            // Also log details about the request
            console.error('Bucket: avatars, Filename:', fileName);
            // Don't throw here - we've already updated the profile
            console.warn('File might remain in storage, but avatar has been removed from profile');
        } else {
            console.log('Avatar file deleted successfully:', deleteData);
        }
        
        return true;
    } catch (error) {
        console.error('Delete avatar error:', error);
        throw error;
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
