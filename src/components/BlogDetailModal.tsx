import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface BlogDetailModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

const BlogDetailModal = ({ post, isOpen, onClose }: BlogDetailModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes || 0);
  const [comments, setComments] = useState([
    { id: 1, author: 'John Doe', text: 'Great article! Very informative.', time: '2 hours ago' },
    { id: 2, author: 'Jane Smith', text: 'Thanks for sharing this valuable information.', time: '1 hour ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: 'Current User',
        text: newComment,
        time: 'Just now'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  if (!post) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{post.authorImage}</span>
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <span>{post.readTime}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="prose max-w-none">
                <div className="text-lg text-gray-600 mb-6">{post.excerpt}</div>
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-6 py-6 border-t border-b my-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {likes}
                </Button>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  {comments.length}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  {post.views}
                </div>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
                
                {/* Comment Input */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none"
                  />
                  <Button 
                    onClick={handleAddComment}
                    className="bg-gradient-to-r from-orange-500 to-red-500"
                    disabled={!newComment.trim()}
                  >
                    Post Comment
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">{comment.author}</span>
                        <span className="text-sm text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlogDetailModal;
