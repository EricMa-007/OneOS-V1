import type { Person, Circle, Post, Comment, PersonCreateInput, PostCreateInput, CommentCreateInput } from '../../../domain/models/social';
import type { SocialRepository } from '../../../domain/repositories/social-repository';
import { eventBus, EVENTS } from '../../../shared/kernel/event-bus';
import { logger } from '../../../shared/kernel/logger';

export class SocialService {
  constructor(private repository: SocialRepository) {}

  async createPost(input: PostCreateInput): Promise<Post> {
    const post = await this.repository.createPost(input);
    eventBus.emit(EVENTS.SOCIAL.POST_CREATED, post);
    logger.info('动态已发布', { id: post.id });
    return post;
  }

  async listPosts() {
    return this.repository.findPosts();
  }

  async toggleLike(postId: string): Promise<Post> {
    const post = await this.repository.findPostById(postId);
    if (!post) throw new Error('动态不存在');
    return this.repository.updatePost(postId, { liked: !post.liked, likeCount: (post.likeCount || 0) + (post.liked ? -1 : 1) });
  }

  async addComment(postId: string, input: CommentCreateInput): Promise<Comment> {
    return this.repository.createComment(postId, input);
  }

  async listPersons() {
    return this.repository.findPersons();
  }

  async listCircles() {
    return this.repository.findCircles();
  }

  async joinCircle(circleId: string): Promise<Circle> {
    const circle = await this.repository.findCircleById(circleId);
    if (!circle) throw new Error('圈子不存在');
    return this.repository.updateCircle(circleId, { joined: !circle.joined, memberCount: (circle.memberCount || 0) + (circle.joined ? -1 : 1) });
  }

  async getStats() {
    const [posts, persons, circles] = await Promise.all([
      this.repository.findPosts(),
      this.repository.findPersons(),
      this.repository.findCircles(),
    ]);
    return { totalPosts: posts.length, totalPersons: persons.length, totalCircles: circles.length };
  }
}
