'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MessageCircle, 
  Upload, 
  Search, 
  Sparkles, 
  X, 
  Feather, 
  CheckCircle2, 
  Filter, 
  Image as ImageIcon,
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_POSTS, CREATOR_PROFILE } from '@/lib/mock-data';
import { Post, Comment } from '@/lib/types';
import { uploadArtwork, getPosts, toggleLikePost, isSupabaseConfigured } from '@/lib/supabase';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Comments state for posts
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    'post-1': [
      {
        id: 'c1',
        post_id: 'post-1',
        user_id: 'user-2',
        content: 'The flow and balance of the Nuqta proportions here is breathtaking! Which ink did you use?',
        created_at: '2026-10-24T16:00:00Z',
        author: {
          id: 'user-2',
          full_name: 'Elena Rostova',
          username: 'elena_scripts',
          avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        },
      },
      {
        id: 'c2',
        post_id: 'post-1',
        user_id: CREATOR_PROFILE.id,
        content: 'Thank you Elena! That is pure Sumi ink blended with a touch of ox gall for smooth qalam release on hand-dyed parchment.',
        created_at: '2026-10-24T16:45:00Z',
        author: CREATOR_PROFILE,
      },
    ],
  });
  const [newCommentText, setNewCommentText] = useState('');

  // Upload modal state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<Post['category']>('Arabic');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Check for preloaded canvas image from Studio via sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCanvas = sessionStorage.getItem('calli_studio_export');
      if (savedCanvas) {
        setUploadPreview(savedCanvas);
        setUploadTitle('Digital Calligraphy Masterpiece');
        setUploadCategory('Digital');
        setUploadDescription('Crafted using the Calli Art Web Studio broad nib pen.');
        setShowUploadModal(true);
        sessionStorage.removeItem('calli_studio_export');
      }
    }
  }, []);

  // Filter categories
  const categories = ['All', 'Arabic', 'Copperplate', 'Gothic', 'Modern Brush', 'Flourishing', 'Digital'];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.author?.full_name && post.author.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle Like
  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const currentlyLiked = !!likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !currentlyLiked }));

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes_count: currentlyLiked ? p.likes_count - 1 : p.likes_count + 1,
            user_has_liked: !currentlyLiked,
          };
        }
        return p;
      })
    );

    // Call Supabase like handler
    toggleLikePost(postId, CREATOR_PROFILE.id, currentlyLiked);
  };

  // Handle File Input for Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  // Submit artwork upload using uploadArtwork()
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a title for your artwork.');
      return;
    }
    if (!uploadFile && !uploadPreview) {
      setUploadError('Please select or create an artwork image.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let fileToUpload: File | Blob;
      if (uploadFile) {
        fileToUpload = uploadFile;
      } else if (uploadPreview) {
        // Convert data URL to Blob
        const res = await fetch(uploadPreview);
        fileToUpload = await res.blob();
      } else {
        throw new Error('No image available');
      }

      // Execute uploadArtwork
      const { post, publicUrl } = await uploadArtwork(
        fileToUpload,
        CREATOR_PROFILE.id,
        uploadTitle,
        uploadDescription,
        uploadCategory
      );

      const newPostObj: Post = {
        id: post.id || `post-${Date.now()}`,
        user_id: CREATOR_PROFILE.id,
        title: uploadTitle,
        description: uploadDescription,
        media_url: publicUrl || uploadPreview || '',
        category: uploadCategory,
        likes_count: 0,
        created_at: new Date().toISOString(),
        author: CREATOR_PROFILE,
        user_has_liked: false,
      };

      setPosts([newPostObj, ...posts]);
      setIsUploading(false);
      setShowUploadModal(false);

      // Reset form
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle('');
      setUploadDescription('');

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b88e1a', '#1c1917', '#e5d5b7'],
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed. Please check your connection.');
      setIsUploading(false);
    }
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPost) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      post_id: selectedPost.id,
      user_id: CREATOR_PROFILE.id,
      content: newCommentText.trim(),
      created_at: new Date().toISOString(),
      author: CREATOR_PROFILE,
    };

    setComments((prev) => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), newComment],
    }));

    setNewCommentText('');
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-8 sm:py-12">
      
      {/* Header Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title & Upload Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Community Gallery</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Community Feed & Showcase
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              Read access is open to all visitors. Share your sacred strokes, Arabic ligatures, and flourishing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold shadow-sm transition-all"
            >
              <Feather className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Draw in Studio</span>
            </Link>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold shadow-md shadow-stone-900/15 transition-all"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              <span>Upload Artwork</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calligraphy, artists..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
            />
          </div>
        </div>

        {/* =========================================================================
            Responsive Grid Section as Specified in User Request
            Desktop: Multi-column Grid (4 cols) | Tablet (2-3 cols) | Mobile (1 col)
        ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPosts.map((post) => {
            const isLiked = likedPosts[post.id] ?? post.user_has_liked;
            const postCommentsCount = comments[post.id]?.length || 0;

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                    <img
                      src={post.media_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={post.title}
                    />
                    <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="font-semibold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </div>

                {/* Footer with author & interactions */}
                <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={post.author?.full_name || 'artist'}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[100px]">@{post.author?.username || 'artist'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleLike(e, post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-rose-600 font-semibold' : 'text-stone-400 hover:text-stone-700'
                      }`}
                      aria-label="Like artwork"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>

                    <div className="flex items-center gap-1 text-stone-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>{postCommentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300 p-8">
            <Feather className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-stone-900">No artworks found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              No artworks matched your category filter or query. Be the first to publish an artwork!
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* =========================================================================
          Artwork Detail Modal
      ========================================================================= */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
            
            {/* Left Image View */}
            <div className="md:w-3/5 bg-stone-950 flex items-center justify-center p-4 relative group">
              <img
                src={selectedPost.media_url}
                alt={selectedPost.title}
                className="max-h-[60vh] md:max-h-[80vh] w-auto object-contain rounded-xl"
              />
              <span className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-amber-300 text-xs font-semibold px-3 py-1 rounded-full">
                {selectedPost.category}
              </span>
            </div>

            {/* Right Information & Comments Column */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={selectedPost.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={selectedPost.author?.full_name || 'artist'}
                      className="w-9 h-9 rounded-full object-cover border border-amber-300"
                    />
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm leading-tight">
                        {selectedPost.author?.full_name}
                      </h4>
                      <p className="text-xs text-stone-500 font-mono">@{selectedPost.author?.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    {selectedPost.title}
                  </h2>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    {selectedPost.description}
                  </p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-stone-100 text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleLike(e, selectedPost.id)}
                      className="flex items-center gap-1 text-rose-600 font-medium"
                    >
                      <Heart className={`w-4 h-4 ${likedPosts[selectedPost.id] ? 'fill-rose-500' : ''}`} />
                      <span>{selectedPost.likes_count} likes</span>
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Discussion ({comments[selectedPost.id]?.length || 0})
                  </h4>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {(comments[selectedPost.id] || []).map((comment) => (
                      <div key={comment.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900">
                            {comment.author?.full_name}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-stone-600 leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                    {(!comments[selectedPost.id] || comments[selectedPost.id].length === 0) && (
                      <p className="text-xs text-stone-400 italic">No comments yet. Start the conversation!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="pt-4 border-t border-stone-100 mt-4 flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment or critique..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-50"
                >
                  Post
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Upload Artwork Modal (Connected to uploadArtwork())
      ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Upload Artwork</h3>
                  <p className="text-xs text-stone-500">Connected to Supabase bucket: <code className="text-amber-800">artworks</code></p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Image Uploader & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Artwork Media (Image)
                </label>
                {uploadPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 h-48 flex items-center justify-center group">
                    <img src={uploadPreview} alt="Preview" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-all">
                    <ImageIcon className="w-10 h-10 text-stone-400 mb-2" />
                    <span className="text-sm font-semibold text-stone-800">Click to upload photo</span>
                    <span className="text-xs text-stone-500 mt-1">PNG, JPG, WebP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Diwani Composition - Light Upon Light"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                >
                  <option value="Arabic">Arabic / Islamic</option>
                  <option value="Copperplate">Copperplate / Pointed Pen</option>
                  <option value="Gothic">Gothic / Blackletter</option>
                  <option value="Modern Brush">Modern Brush Script</option>
                  <option value="Flourishing">Flourishing & Illumination</option>
                  <option value="Digital">Digital Calligraphy</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Description & Tools Used
                </label>
                <textarea
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Mention nib type, ink, paper, angle, or script details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold shadow-md disabled:opacity-50 transition-all"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Publish Artwork</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
