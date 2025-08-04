'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PickupLine {
  id: number;
  content: string;
  image?: string;
  category: string;
  author: string;
  createdAt: string;
  reactions?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  userReaction?: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  avatar?: string;
  replies?: Reply[];
  reactions?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  userReaction?: string;
}

interface Reply {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  avatar?: string;
  reactions?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  userReaction?: string;
}

interface Notification {
  id: number;
  type: 'reply' | 'reaction';
  from: string;
  content: string;
  postId: string;
  commentId?: number;
  createdAt: string;
  read: boolean;
}

export default function PickupLineDetail({ pickupLineId }: { pickupLineId: string }) {
  const [pickupLine, setPickupLine] = useState<PickupLine | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState<{type: 'post' | 'comment' | 'reply', id: number | string} | null>(null);
  const router = useRouter();

  const reactionEmojis = [
    { type: 'like', emoji: '👍', label: 'Thích' },
    { type: 'love', emoji: '❤️', label: 'Yêu thích' },
    { type: 'haha', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Buồn' },
    { type: 'angry', emoji: '😡', label: 'Giận dữ' }
  ];

  useEffect(() => {
    // Get pickup line
    const savedLines = localStorage.getItem('pickupLines');
    if (savedLines) {
      const lines = JSON.parse(savedLines);
      const line = lines.find((l: PickupLine) => l.id.toString() === pickupLineId);
      if (line) {
        // Initialize reactions if not exist
        if (!line.reactions) {
          line.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
        }
        setPickupLine(line);
      }
    }

    // Get comments for this pickup line
    const savedComments = localStorage.getItem(`comments_pickup_${pickupLineId}`);
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      // Initialize reactions for comments if not exist
      parsedComments.forEach((comment: Comment) => {
        if (!comment.reactions) {
          comment.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
        }
        if (!comment.replies) comment.replies = [];
        comment.replies?.forEach((reply: Reply) => {
          if (!reply.reactions) {
            reply.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
          }
        });
      });
      setComments(parsedComments);
    }

    // Get current user
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, [pickupLineId]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      author: currentUser.displayName || currentUser.username,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      avatar: currentUser.avatar || '',
      replies: [],
      reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`comments_pickup_${pickupLineId}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  const handleAddReply = (commentId: number) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!replyContent.trim()) return;

    const reply: Reply = {
      id: Date.now(),
      author: currentUser.displayName || currentUser.username,
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      avatar: currentUser.avatar || '',
      reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }
    };

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const updatedReplies = [...(comment.replies || []), reply];
        
        // Add notification for comment author
        if (comment.author !== currentUser.displayName && comment.author !== currentUser.username) {
          addNotification({
            type: 'reply',
            from: currentUser.displayName || currentUser.username,
            content: `đã trả lời bình luận của bạn`,
            postId: pickupLineId,
            commentId: commentId
          }, comment.author);
        }
        
        return { ...comment, replies: updatedReplies };
      }
      return comment;
    });

    setComments(updatedComments);
    localStorage.setItem(`comments_pickup_${pickupLineId}`, JSON.stringify(updatedComments));
    setReplyContent('');
    setReplyingTo(null);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>, targetUser: string) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      read: false
    };

    const existingNotifications = JSON.parse(localStorage.getItem(`notifications_${targetUser}`) || '[]');
    const updatedNotifications = [newNotification, ...existingNotifications];
    localStorage.setItem(`notifications_${targetUser}`, JSON.stringify(updatedNotifications));
  };

  const handleReaction = (type: 'post' | 'comment' | 'reply', id: number | string, reactionType: string) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (type === 'post') {
      const savedLines = localStorage.getItem('pickupLines');
      if (savedLines) {
        const lines = JSON.parse(savedLines);
        const lineIndex = lines.findIndex((l: PickupLine) => l.id.toString() === pickupLineId);
        if (lineIndex !== -1) {
          const line = lines[lineIndex];
          if (!line.reactions) {
            line.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
          }
          
          // Remove previous reaction if exists
          if (line.userReaction) {
            line.reactions[line.userReaction as keyof typeof line.reactions]--;
          }
          
          // Add new reaction
          if (line.userReaction !== reactionType) {
            line.reactions[reactionType as keyof typeof line.reactions]++;
            line.userReaction = reactionType;
          } else {
            line.userReaction = undefined;
          }
          
          lines[lineIndex] = line;
          localStorage.setItem('pickupLines', JSON.stringify(lines));
          setPickupLine(line);
        }
      }
    } else if (type === 'comment') {
      const updatedComments = comments.map(comment => {
        if (comment.id === id) {
          if (!comment.reactions) {
            comment.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
          }
          
          // Remove previous reaction if exists
          if (comment.userReaction) {
            comment.reactions[comment.userReaction as keyof typeof comment.reactions]--;
          }
          
          // Add new reaction
          if (comment.userReaction !== reactionType) {
            comment.reactions[reactionType as keyof typeof comment.reactions]++;
            comment.userReaction = reactionType;
          } else {
            comment.userReaction = undefined;
          }
          
          return comment;
        }
        return comment;
      });
      
      setComments(updatedComments);
      localStorage.setItem(`comments_pickup_${pickupLineId}`, JSON.stringify(updatedComments));
    } else if (type === 'reply') {
      const updatedComments = comments.map(comment => {
        const updatedReplies = comment.replies?.map(reply => {
          if (reply.id === id) {
            if (!reply.reactions) {
              reply.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
            }
            
            // Remove previous reaction if exists
            if (reply.userReaction) {
              reply.reactions[reply.userReaction as keyof typeof reply.reactions]--;
            }
            
            // Add new reaction
            if (reply.userReaction !== reactionType) {
              reply.reactions[reactionType as keyof typeof reply.reactions]++;
              reply.userReaction = reactionType;
            } else {
              reply.userReaction = undefined;
            }
            
            return reply;
          }
          return reply;
        });
        
        return { ...comment, replies: updatedReplies };
      });
      
      setComments(updatedComments);
      localStorage.setItem(`comments_pickup_${pickupLineId}`, JSON.stringify(updatedComments));
    }
    
    setShowReactionPicker(null);
  };

  const getTotalReactions = (reactions?: {like: number; love: number; haha: number; wow: number; sad: number; angry: number;}) => {
    if (!reactions) return 0;
    return Object.values(reactions).reduce((total, count) => total + count, 0);
  };

  const getTopReactions = (reactions?: {like: number; love: number; haha: number; wow: number; sad: number; angry: number;}) => {
    if (!reactions) return [];
    return Object.entries(reactions)
      .filter(([_, count]) => count > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({
        type,
        count,
        emoji: reactionEmojis.find(r => r.type === type)?.emoji || '👍'
      }));
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'romantic':
        return { name: 'Lãng mạn', icon: 'ri-heart-fill', color: 'bg-red-100 text-red-600' };
      case 'sweet':
        return { name: 'Ngọt ngào', icon: 'ri-hearts-line', color: 'bg-pink-100 text-pink-600' };
      case 'funny':
        return { name: 'Hài hước', icon: 'ri-emotion-laugh-line', color: 'bg-yellow-100 text-yellow-600' };
      default:
        return { name: 'Khác', icon: 'ri-heart-line', color: 'bg-gray-100 text-gray-600' };
    }
  };

  if (!pickupLine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-heart-line text-2xl text-gray-400 w-6 h-6 flex items-center justify-center"></i>
          </div>
          <p className="text-gray-500">Không tìm thấy câu thả thính</p>
          <Link href="/pickup-lines" className="text-pink-500 hover:text-pink-600 mt-2 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(pickupLine.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-pink-600" style={{fontFamily: "Pacifico, serif"}}>
              Love Corner
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/pickup-lines" className="text-gray-600 hover:text-gray-800">
                <i className="ri-arrow-left-line mr-2 w-4 h-4 flex items-center justify-center inline-block"></i>
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Pickup Line Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {pickupLine.image && (
              <div className="mb-6">
                <img 
                  src={pickupLine.image} 
                  alt="Pickup line illustration" 
                  className="w-full h-64 object-cover object-top rounded-lg"
                />
              </div>
            )}

            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-chat-heart-line text-pink-500 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="flex-1">
                <p className="text-xl text-gray-800 font-medium leading-relaxed mb-4">
                  "{pickupLine.content}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                      <i className={`${categoryInfo.icon} mr-1 w-4 h-4 flex items-center justify-center inline-block`}></i>
                      {categoryInfo.name}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <i className="ri-user-line w-4 h-4 flex items-center justify-center"></i>
                      <span>{pickupLine.author}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <i className="ri-time-line w-4 h-4 flex items-center justify-center"></i>
                    <span>{new Date(pickupLine.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Reactions */}
            <div className="border-t pt-4">
              {getTotalReactions(pickupLine.reactions) > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-1">
                      {getTopReactions(pickupLine.reactions).map((reaction, index) => (
                        <span key={index} className="text-lg bg-white rounded-full w-6 h-6 flex items-center justify-center border">
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">
                      {getTotalReactions(pickupLine.reactions)} cảm xúc
                    </span>
                  </div>
                  <span className="text-gray-600 text-sm">{comments.length} bình luận</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-b py-2">
                <div className="relative">
                  <button
                    onClick={() => setShowReactionPicker(showReactionPicker?.type === 'post' && showReactionPicker?.id === 'main' ? null : {type: 'post', id: 'main'})}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      pickupLine.userReaction ? 'text-pink-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">
                      {pickupLine.userReaction 
                        ? reactionEmojis.find(r => r.type === pickupLine.userReaction)?.emoji 
                        : '👍'
                      }
                    </span>
                    <span className="whitespace-nowrap">
                      {pickupLine.userReaction 
                        ? reactionEmojis.find(r => r.type === pickupLine.userReaction)?.label 
                        : 'Thích'
                      }
                    </span>
                  </button>

                  {showReactionPicker?.type === 'post' && showReactionPicker?.id === 'main' && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl border p-2 flex space-x-1 z-10">
                      {reactionEmojis.map((reaction) => (
                        <button
                          key={reaction.type}
                          onClick={() => handleReaction('post', 'main', reaction.type)}
                          className="p-2 rounded hover:bg-gray-100 transition"
                          title={reaction.label}
                        >
                          <span className="text-lg">{reaction.emoji}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition whitespace-nowrap">
                  <i className="ri-chat-3-line w-4 h-4 flex items-center justify-center"></i>
                  <span>Bình luận</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition whitespace-nowrap">
                  <i className="ri-share-line w-4 h-4 flex items-center justify-center"></i>
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <i className="ri-chat-3-line mr-3 w-6 h-6 flex items-center justify-center"></i>
              Bình luận ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {currentUser ? (
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-user-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Chia sẻ cảm nghĩ của bạn..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-sm"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">{newComment.length}/500</span>
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Bình luận
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center mb-8">
                <p className="text-gray-600 mb-4">Bạn cần đăng nhập để bình luận</p>
                <Link href="/login" className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition whitespace-nowrap">
                  Đăng nhập
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="space-y-4">
                  {/* Main Comment */}
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      {comment.avatar ? (
                        <img src={comment.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-user-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{comment.author}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>

                        {/* Comment Reactions */}
                        {getTotalReactions(comment.reactions) > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex -space-x-1">
                              {getTopReactions(comment.reactions).map((reaction, index) => (
                                <span key={index} className="text-sm bg-white rounded-full w-5 h-5 flex items-center justify-center border">
                                  {reaction.emoji}
                                </span>
                              ))}
                            </div>
                            <span className="text-gray-600 text-xs">
                              {getTotalReactions(comment.reactions)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <div className="relative">
                          <button
                            onClick={() => setShowReactionPicker(showReactionPicker?.type === 'comment' && showReactionPicker?.id === comment.id ? null : {type: 'comment', id: comment.id})}
                            className={`hover:underline ${comment.userReaction ? 'text-pink-600 font-medium' : 'text-gray-500'}`}
                          >
                            {comment.userReaction 
                              ? reactionEmojis.find(r => r.type === comment.userReaction)?.label 
                              : 'Thích'
                            }
                          </button>

                          {showReactionPicker?.type === 'comment' && showReactionPicker?.id === comment.id && (
                            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl border p-2 flex space-x-1 z-10">
                              {reactionEmojis.map((reaction) => (
                                <button
                                  key={reaction.type}
                                  onClick={() => handleReaction('comment', comment.id, reaction.type)}
                                  className="p-1 rounded hover:bg-gray-100 transition"
                                  title={reaction.label}
                                >
                                  <span className="text-sm">{reaction.emoji}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-gray-500 hover:underline"
                        >
                          Trả lời
                        </button>
                      </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && currentUser && (
                        <div className="mt-3 flex space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                            {currentUser.avatar ? (
                              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="ri-user-line text-gray-400 w-3 h-3 flex items-center justify-center"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Trả lời ${comment.author}...`}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-sm"
                              rows={2}
                              maxLength={500}
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500">{replyContent.length}/500</span>
                              <div className="space-x-2">
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyContent('');
                                  }}
                                  className="text-gray-500 text-sm hover:text-gray-700"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleAddReply(comment.id)}
                                  disabled={!replyContent.trim()}
                                  className="bg-pink-500 text-white px-4 py-1 rounded text-sm hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  Trả lời
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3 ml-4 border-l-2 border-gray-200 pl-4">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="flex space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                {reply.avatar ? (
                                  <img src={reply.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <i className="ri-user-line text-gray-400 w-3 h-3 flex items-center justify-center"></i>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-medium text-gray-800 text-sm">{reply.author}</h5>
                                    <span className="text-xs text-gray-500">
                                      {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>

                                  {/* Reply Reactions */}
                                  {getTotalReactions(reply.reactions) > 0 && (
                                    <div className="flex items-center space-x-2 mt-2">
                                      <div className="flex -space-x-1">
                                        {getTopReactions(reply.reactions).map((reaction, index) => (
                                          <span key={index} className="text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center border">
                                            {reaction.emoji}
                                          </span>
                                        ))}
                                      </div>
                                      <span className="text-gray-600 text-xs">
                                        {getTotalReactions(reply.reactions)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="relative mt-1">
                                  <button
                                    onClick={() => setShowReactionPicker(showReactionPicker?.type === 'reply' && showReactionPicker?.id === reply.id ? null : {type: 'reply', id: reply.id})}
                                    className={`text-xs hover:underline ${reply.userReaction ? 'text-pink-600 font-medium' : 'text-gray-500'}`}
                                  >
                                    {reply.userReaction 
                                      ? reactionEmojis.find(r => r.type === reply.userReaction)?.label 
                                      : 'Thích'
                                    }
                                  </button>

                                  {showReactionPicker?.type === 'reply' && showReactionPicker?.id === reply.id && (
                                    <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl border p-2 flex space-x-1 z-10">
                                      {reactionEmojis.map((reaction) => (
                                        <button
                                          key={reaction.type}
                                          onClick={() => handleReaction('reply', reply.id, reaction.type)}
                                          className="p-1 rounded hover:bg-gray-100 transition"
                                          title={reaction.label}
                                        >
                                          <span className="text-xs">{reaction.emoji}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-chat-3-line text-2xl text-gray-400 w-6 h-6 flex items-center justify-center"></i>
                  </div>
                  <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}