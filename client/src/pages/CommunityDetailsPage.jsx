import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Globe2,
  Users,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Send,
  Heart,
  MessageCircle,
} from 'lucide-react';

const CommunityDetailsPage = () => {
  const { id } = useParams();
  const [communityData, setCommunityData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchCommunityData();
    fetchPosts();
  }, [id]);

  const fetchCommunityData = async () => {
    try {
      const res = await api.get(`/communities/${id}`);
      if (res.data.success) {
        setCommunityData(res.data.community);
      }
    } catch (err) {
      toast.error('Failed to load community');
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/communities/${id}/posts`);
      if (res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('[Fetch posts error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const res = await api.post(`/communities/${id}/posts`, {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
      });
      if (res.data.success) {
        toast.success('Post published!');
        setNewPostTitle('');
        setNewPostContent('');
        setPosts([res.data.post, ...posts]);
      }
    } catch (err) {
      toast.error('Failed to publish post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/communities/posts/${postId}/comments`, {
        text: text.trim(),
      });
      if (res.data.success) {
        setPosts(posts.map((p) => (p._id === postId ? res.data.post : p)));
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  if (!communityData) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">Loading community...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/communities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Communities</span>
      </Link>

      {/* Community Info Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
              {communityData.category}
            </span>
            {communityData.city && (
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {communityData.city}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {communityData.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-xl">
            {communityData.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xl font-extrabold text-indigo-600">
              {communityData.memberCount || 1}
            </span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Members</p>
          </div>
        </div>
      </div>

      {/* Create New Post Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Start a Discussion</h3>
        <form onSubmit={handleCreatePost} className="space-y-3">
          <input
            type="text"
            required
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Post topic or question..."
            className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
          <textarea
            rows={3}
            required
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share details, transit questions, local recommendations..."
            className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
          <div className="text-right">
            <button
              type="submit"
              disabled={isPosting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isPosting ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>

      {/* Discussion Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Community Posts ({posts.length})</h2>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 text-xs text-slate-500">
            No discussion posts yet. Be the first to start a conversation!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      post.author?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={post.author?.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{post.author?.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString()} • {post.author?.currentCity}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{post.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Comments Section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Comments ({post.comments?.length || 0})
                </p>

                {post.comments?.map((comment, cIdx) => (
                  <div key={cIdx} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{comment.author?.name || 'Member'}</span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600">{comment.text}</p>
                  </div>
                ))}

                {/* Comment input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={commentInputs[post._id] || ''}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddComment(post._id)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityDetailsPage;
