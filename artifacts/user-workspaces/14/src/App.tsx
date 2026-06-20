function App() {
  const { useState, useEffect, useRef, useCallback } = React;
  const {
    Heart, MessageCircle, Send, Bookmark, PlusCircle,
    Search, Home, User, MoreHorizontal, Camera,
    Instagram, Menu, X
  } = lucide;

  // --- Mock Data Generation ---
  const generatePosts = () => {
    const users = [
      { username: 'jessica.smith', avatar: 'J' },
      { username: 'mike_studio', avatar: 'M' },
      { username: 'laura_photo', avatar: 'L' },
      { username: 'travel_bug', avatar: 'T' },
      { username: 'foodie_master', avatar: 'F' },
    ];
    const captions = [
      'Golden hour vibes ✨',
      'Lazy Sunday afternoons ☕',
      'New adventures await 🗺️',
      'Homemade goodness 🍝',
      'City lights never get old 🌃',
    ];
    const comments = [
      [{ user: 'alex_d', text: 'Stunning!' }, { user: 'emily_r', text: 'Love this 😍' }],
      [{ user: 'john_doe', text: 'Where is this?' }],
      [],
      [{ user: 'sarah_c', text: 'Delicious 👌' }],
      [{ user: 'chris_p', text: 'Incredible shot' }, { user: 'megan_l', text: 'Goals' }],
    ];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      user: users[i],
      imageUrl: `https://picsum.photos/400/400?random=${i + 10}`,
      caption: captions[i],
      likes: Math.floor(Math.random() * 200) + 10,
      isLiked: false,
      isBookmarked: false,
      comments: comments[i],
      timestamp: `${Math.floor(Math.random() * 10) + 1}h ago`,
    }));
  };

  const generateStories = () => {
    const users = [
      { username: 'alex_d', avatar: 'A' },
      { username: 'emily_r', avatar: 'E' },
      { username: 'john_doe', avatar: 'J' },
      { username: 'sarah_c', avatar: 'S' },
      { username: 'chris_p', avatar: 'C' },
      { username: 'megan_l', avatar: 'M' },
      { username: 'leo_n', avatar: 'L' },
      { username: 'zoe_t', avatar: 'Z' },
    ];
    return users.map((u, idx) => ({ ...u, id: idx + 1 }));
  };

  // --- State ---
  const [activeTab, setActiveTab] = useState('home');
  const [stories] = useState(generateStories());
  const [posts, setPosts] = useState(generatePosts());
  const [commentTexts, setCommentTexts] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const [currentUser] = useState({ username: 'you_photohub', avatar: 'Y' });
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // --- Handlers ---
  const handleLike = useCallback((postId) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, []);

  const handleBookmark = useCallback((postId) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );
  }, []);

  const handleCommentSubmit = useCallback((postId) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { user: currentUser.username, text }] }
          : p
      )
    );
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  }, [commentTexts, currentUser]);

  const toggleCommentInput = useCallback((postId) => {
    setShowCommentInput(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    // Clear comment text when toggling
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  }, []);

  const handleCommentKeyDown = useCallback((e, postId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(postId);
    }
  }, [handleCommentSubmit]);

  // --- Navigation ---
  const navItems = [
    { id: 'home', icon: <Home size={22} />, label: 'Home' },
    { id: 'search', icon: <Search size={22} />, label: 'Search' },
    { id: 'create', icon: <Camera size={22} />, label: 'Create' },
    { id: 'activity', icon: <Heart size={22} />, label: 'Activity' },
    { id: 'profile', icon: <User size={22} />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white font-sans relative">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            PhotoHub
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button className="p-1 rounded-full hover:bg-white/10 transition-colors" aria-label="Messages">
            <Send size={20} />
          </button>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center pt-20 px-4">
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
          <div className="w-full max-w-md">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search PhotoHub..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              aria-label="Search input"
            />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Recent searches will appear here</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`${activeTab === 'home' ? 'pb-20' : 'hidden'}`}>
        {/* Stories Section */}
        <section
          className="flex gap-4 overflow-x-auto px-4 py-4 no-scrollbar scrollbar-hide"
          aria-label="Stories"
          role="list"
        >
          {/* Your Story */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group" role="listitem">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0d0d12] flex items-center justify-center relative">
                <span className="text-lg font-bold text-purple-400">{currentUser.avatar}</span>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-purple-600 rounded-full border-2 border-[#0d0d12] flex items-center justify-center">
                  <PlusCircle size={14} strokeWidth={3} />
                </div>
              </div>
            </div>
            <span className="text-xs mt-1 text-gray-300">Your story</span>
          </div>
          {/* Other stories */}
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer group" role="listitem">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0d0d12] flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-400">{story.avatar}</span>
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-300">{story.username}</span>
            </div>
          ))}
        </section>

        {/* Feed */}
        <div className="space-y-4 mx-auto max-w-[470px] px-2">
          {posts.map(post => (
            <article
              key={post.id}
              className="bg-[#1a1a24] rounded-xl overflow-hidden shadow-lg border border-white/5 transition-all hover:border-white/10"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold"
                    aria-label={post.user.username}
                  >
                    {post.user.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.user.username}</p>
                    <p className="text-xs text-gray-400">{post.timestamp}</p>
                  </div>
                </div>
                <button className="p-1 rounded-full hover:bg-white/10 transition-colors" aria-label="More options">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              {/* Post Image */}
              <div className="relative w-full bg-black/30">
                <img
                  src={post.imageUrl}
                  alt={`Photo by ${post.user.username}`}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
              </div>
              {/* Post Actions */}
              <div className="px-3 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`p-1 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      post.isLiked ? 'text-pink-500 scale-110' : 'text-white hover:text-pink-400'
                    }`}
                    aria-label={post.isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart size={24} fill={post.isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => toggleCommentInput(post.id)}
                    className="p-1 rounded-full hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Comment"
                  >
                    <MessageCircle size={24} />
                  </button>
                  <button
                    className="p-1 rounded-full hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Share"
                    title="Share"
                  >
                    <Send size={24} />
                  </button>
                </div>
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`p-1 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    post.isBookmarked ? 'text-purple-500' : 'text-white hover:text-purple-400'
                  }`}
                  aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                  <Bookmark size={24} fill={post.isBookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>
              {/* Likes */}
              <div className="px-3 pt-1">
                <p className="text-sm font-semibold">{post.likes.toLocaleString()} likes</p>
              </div>
              {/* Caption */}
              <div className="px-3 pt-1 pb-2">
                <p className="text-sm">
                  <span className="font-semibold mr-1">{post.user.username}</span>
                  {post.caption}
                </p>
              </div>
              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="px-3 pb-2 text-sm">
                  {post.comments.map((comment, idx) => (
                    <p key={idx} className="flex gap-1">
                      <span className="font-semibold">{comment.user}</span>
                      <span className="text-gray-300">{comment.text}</span>
                    </p>
                  ))}
                </div>
              )}
              {/* Comment Input */}
              {showCommentInput[post.id] && (
                <div className="px-3 pb-3 border-t border-white/10 pt-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                      value={commentTexts[post.id] || ''}
                      onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => handleCommentKeyDown(e, post.id)}
                      aria-label="Comment input"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!commentTexts[post.id]?.trim()}
                      className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label="Submit comment"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
              {/* Always visible quick comment (inline toggle) */}
              {!showCommentInput[post.id] && (
                <div className="px-3 pb-3">
                  <button
                    onClick={() => toggleCommentInput(post.id)}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    aria-label="Add a comment"
                  >
                    Add a comment...
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>

      {/* Profile / other tabs placeholder */}
      {activeTab !== 'home' && (
        <div className="flex items-center justify-center h-screen pb-20">
          <p className="text-gray-400 text-lg animate-pulse">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tab</p>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-t border-white/10 flex justify-around items-center py-2 px-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-1 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              activeTab === item.id ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
            }`}
            aria-label={item.label}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Global styles for scrollbar-hide and animations */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}