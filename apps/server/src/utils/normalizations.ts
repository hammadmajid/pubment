export function normalizeUser(user: any) {
  if (!user) return null;
  return {
    _id: user._id?.toString?.() ?? '',
    username: user.username,
    name: user.name,
    profilePicture: user.profilePicture ?? null,
  };
}

export function normalizePost(post: any) {
  if (!post) return null;
  return {
    _id: post._id?.toString?.() ?? '',
    content: post.content,
    author: normalizeUser(post.author),
    likes: Array.isArray(post.likes)
      ? post.likes.map((id: any) => id?.toString?.() ?? '')
      : [],
    createdAt:
      post.createdAt instanceof Date
        ? post.createdAt.toISOString()
        : String(post.createdAt),
    updatedAt:
      post.updatedAt instanceof Date
        ? post.updatedAt.toISOString()
        : String(post.updatedAt),
  };
}export function normalizeComment(comment: any) {
    if (!comment) return null;
    return {
        _id: comment._id?.toString?.() ?? '',
        author: normalizeUser(comment.author),
        post: comment.post?.toString?.() ?? '',
        content: comment.content,
        createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : String(comment.createdAt),
        updatedAt: comment.updatedAt instanceof Date ? comment.updatedAt.toISOString() : String(comment.updatedAt),
    };
}

