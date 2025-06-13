// Utility to normalize user object
export function normalizeUser(user: any) {
  if (!user) return user;
  return {
    _id: user._id?.toString?.() || user._id,
    username: user.username,
    name: user.name,
    profilePicture: user.profilePicture ?? null,
  };
}

// Utility to normalize comment object
export function normalizeComment(comment: any) {
  if (!comment) return comment;
  return {
    _id: comment._id?.toString?.() || comment._id,
    author: normalizeUser(comment.author),
    post: comment.post?.toString?.() || comment.post,
    content: comment.content,
    createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
    updatedAt: comment.updatedAt instanceof Date ? comment.updatedAt.toISOString() : comment.updatedAt,
  };
}

// Utility to normalize post object
export function normalizePost(post: unknown): Record<string, unknown> | undefined {
  if (!post) return post as undefined;
  let obj: Record<string, unknown>;
  if (
    typeof post === 'object' &&
    post !== null &&
    typeof (post as { toObject?: () => unknown }).toObject === 'function'
  ) {
    obj = (post as { toObject: () => unknown }).toObject() as Record<string, unknown>;
  } else {
    obj = post as Record<string, unknown>;
  }
  // Normalize author
  let author = obj.author;
  if (author && typeof author === 'object' && author !== null) {
    const authorObj = author as Record<string, unknown>;
    author = {
      ...(authorObj as Record<string, unknown>),
      _id:
        authorObj._id &&
        typeof authorObj._id === 'object' &&
        authorObj._id !== null &&
        'toString' in authorObj._id
          ? (authorObj._id as { toString: () => string }).toString()
          : authorObj._id,
    };
  }
  // Normalize likes
  let likes = obj.likes;
  if (Array.isArray(likes)) {
    likes = (likes as unknown[]).map((like) => {
      if (
        typeof like === 'object' &&
        like !== null &&
        '_id' in like &&
        typeof (like as Record<string, unknown>)._id === 'object' &&
        (like as Record<string, unknown>)._id !== null &&
        'toString' in (like as Record<string, unknown>)._id
      ) {
        return (
          (like as Record<string, unknown>)._id as { toString: () => string }
        ).toString();
      }
      return typeof like === 'object' && like !== null && 'toString' in like
        ? (like as { toString: () => string }).toString()
        : like;
    });
  }
  return {
    ...obj,
    _id:
      obj._id &&
      typeof obj._id === 'object' &&
      obj._id !== null &&
      'toString' in obj._id
        ? (obj._id as { toString: () => string }).toString()
        : obj._id,
    author,
    likes,
  };
}
