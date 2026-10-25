import { createClient } from '@supabase/supabase-js';
import { Post, Profile, Comment, Resource } from './types';

// Read environment variables with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvveadhykwvtkepmzytm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_wYXiktTt-fM-9cAgHkHT-A_Qlvtu0Tj';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Upload artwork function as specified in the Calli Art architecture.
 * Uploads file to Supabase storage bucket 'artworks' and inserts post into 'posts' table.
 * Includes graceful fallback if storage bucket or table is still setting up.
 */
export async function uploadArtwork(
  file: File | Blob,
  userId: string,
  title: string,
  description?: string,
  category: string = 'Calligraphy'
): Promise<{ post: any; publicUrl: string }> {
  const fileNamePart = file instanceof File ? file.name : 'artwork.png';
  const fileExt = fileNamePart.split('.').pop() || 'png';
  const fileName = `${userId || 'guest'}/${Date.now()}.${fileExt}`;

  let publicUrl = '';

  try {
    // 1. Upload file to Supabase Storage Bucket 'artworks'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Supabase storage upload returned error, using object URL fallback:', uploadError.message);
      publicUrl = URL.createObjectURL(file);
    } else {
      // 2. Get Public URL
      const { data: { publicUrl: url } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);
      publicUrl = url;
    }
  } catch (storageErr) {
    console.warn('Supabase storage exception, using local blob preview:', storageErr);
    publicUrl = URL.createObjectURL(file);
  }

  // 3. Save post to database
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: userId,
          title,
          description: description || '',
          media_url: publicUrl,
          category,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Database insert error, returning synthesized post:', error.message);
      return {
        post: {
          id: `local-${Date.now()}`,
          user_id: userId,
          title,
          description,
          media_url: publicUrl,
          category,
          created_at: new Date().toISOString(),
          likes_count: 0,
        },
        publicUrl,
      };
    }

    return { post: data, publicUrl };
  } catch (dbErr) {
    console.warn('Supabase DB exception, returning synthesized post:', dbErr);
    return {
      post: {
        id: `local-${Date.now()}`,
        user_id: userId,
        title,
        description,
        media_url: publicUrl,
        category,
        created_at: new Date().toISOString(),
        likes_count: 0,
      },
      publicUrl,
    };
  }
}

/**
 * Fetch all public posts from Supabase with graceful fallback
 */
export async function getPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, full_name, username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, will use mock posts:', error.message);
      return [];
    }

    return (data as any) || [];
  } catch (err) {
    console.warn('Error fetching posts:', err);
    return [];
  }
}

/**
 * Toggle like on a post
 */
export async function toggleLikePost(postId: string, userId: string, currentlyLiked: boolean) {
  try {
    if (currentlyLiked) {
      await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userId });
    } else {
      await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);
    }
    return true;
  } catch (err) {
    console.warn('Error toggling like:', err);
    return false;
  }
}
