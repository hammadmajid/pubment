import {
  postCreateResponse,
  postErrorResponse,
  postListResponse,
} from '@repo/schemas/post';
import { data, redirect, useNavigate, useSearchParams } from 'react-router';
import { Post } from '~/components/app/post';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination';
import { safeFetch } from '~/lib/fetch';
import { commitSession, getSession } from '~/session.server';
import type { Route } from './+types/feed';

export function meta() {
  return [{ title: 'Feed | Social Media' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    return redirect('/login');
  }

  // Get page from query params
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10);

  const result = await safeFetch(
    { endpoint: `/post?page=${page}` },
    postListResponse,
    postErrorResponse,
    session.get('token'),
  );

  if (result.ok === false) {
    throw data(result.error.message, 500);
  }

  const { data: posts, pagination } = result.value;

  return {
    username: session.get('username'),
    userId: session.get('userId'),
    posts,
    pagination,
    page,
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };
}

export default function Feed({ loaderData }: Route.ComponentProps) {
  const { page = 1, pagination, posts, userId, username } = loaderData;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (loaderData instanceof Error) {
    return (
      <div className='bg-red-100 text-red-700 border border-red-300 rounded-md p-4 mx-auto mt-8'>
        <strong>Error:</strong> {loaderData.message}
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', String(newPage));
    navigate({ search: searchParams.toString() });
  };

  return (
    <div className='flex flex-col gap-3 px-8 py-2 mb-12'>
      {posts.length === 0 ? (
        <div className='text-center text-muted-foreground'>No posts yet.</div>
      ) : (
        posts.map((post) => (
          <Post
            key={post._id}
            isClickable={true}
            post={post}
            username={username}
            isLiked={post.likes.includes(userId)}
          />
        ))
      )}
      {pagination && pagination.pages > 1 && (
        <Pagination className='mt-8'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={
                  page > 1 ? () => handlePageChange(page - 1) : undefined
                }
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
                to={`?page=${page - 1}`}
              />
            </PaginationItem>
            {Array.from({ length: pagination.pages }).map((_, idx) => {
              const p = idx + 1;
              // Show first, last, current, and neighbors; ellipsis for gaps
              if (
                p === 1 ||
                p === pagination.pages ||
                Math.abs(p - page) <= 1
              ) {
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => handlePageChange(p)}
                      to={`?page=${p}`}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (
                (p === page - 2 && page > 3) ||
                (p === page + 2 && page < pagination.pages - 2)
              ) {
                return (
                  <PaginationItem key={`ellipsis-${p}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                onClick={
                  page < pagination.pages
                    ? () => handlePageChange(page + 1)
                    : undefined
                }
                aria-disabled={page === pagination.pages}
                tabIndex={page === pagination.pages ? -1 : 0}
                to={`?page=${page + 1}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const authorId = session.get('userId');

  const formData = await request.formData();
  const pathname = formData.get('pathname') as string;
  const content = formData.get('content') as string;

  const result = await safeFetch(
    {
      endpoint: '/post/create',
      body: {
        authorId,
        content,
      },
    },
    postCreateResponse,
    postErrorResponse,
    session.get('token'),
  );

  if (result.ok !== true) {
    throw data(result.error.message, 500);
  }

  return {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  };
}
