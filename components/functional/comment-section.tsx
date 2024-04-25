import React, { useState } from "react";

interface Comment {
  id: number;
  text: string;
  replies: Reply[];
}

interface Reply {
  id: number;
  text: string;
}

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      text: "First comment",
      replies: [
        { id: 1, text: "Reply to first comment" },
        { id: 2, text: "Another reply to first comment" },
      ],
    },
    {
      id: 2,
      text: "Second comment",
      replies: [],
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [newReply, setNewReply] = useState("");

  const handleCommentSubmit = () => {
    if (newComment.trim() !== "") {
      const newComments: Comment[] = [
        ...comments,
        {
          id: comments.length + 1,
          text: newComment,
          replies: [],
        },
      ];
      setComments(newComments);
      setNewComment("");
    }
  };

  const handleReplySubmit = () => {
    if (newReply.trim() !== "" && replyTo !== null) {
      const updatedComments: Comment[] = comments.map((comment) => {
        if (comment.id === replyTo) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: comment.replies.length + 1,
                text: newReply,
              },
            ],
          };
        }
        return comment;
      });
      setComments(updatedComments);
      setReplyTo(null);
      setNewReply("");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Comment Section</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a new comment"
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
        <button
          onClick={handleCommentSubmit}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Comment
        </button>
      </div>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id} className="mb-4">
            <div className="bg-gray-100 p-3 rounded-md">
              <div className="font-semibold">{comment.text}</div>
              <ul className="mt-2">
                {comment.replies.map((reply) => (
                  <li key={reply.id} className="ml-4 mb-2">
                    {reply.text}
                  </li>
                ))}
              </ul>
              <div className="mt-2">
                <input
                  type="text"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Reply to this comment"
                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                />
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="ml-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400"
                >
                  Reply
                </button>
                {replyTo === comment.id && (
                  <button
                    onClick={handleReplySubmit}
                    className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Submit Reply
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;
