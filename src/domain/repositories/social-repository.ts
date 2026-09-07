/**
 * 社交Repository接口（联系人/圈子/动态）
 */

import { Person, Circle, Post, Comment, CreatePersonInput, CreateCircleInput, CreatePostInput } from '../models/social';

export interface ISocialRepository {
  // 联系人
  getPersonById(id: string): Promise<Person | null>;
  getAllPersons(): Promise<Person[]>;
  getPersonsByTag(tagId: string): Promise<Person[]>;
  searchPersons(keyword: string): Promise<Person[]>;
  createPerson(input: CreatePersonInput): Promise<Person>;
  updatePerson(id: string, updates: Partial<Person>): Promise<Person>;
  deletePerson(id: string): Promise<void>;
  hardDeletePerson(id: string): Promise<void>;

  // 圈子
  getCircleById(id: string): Promise<Circle | null>;
  getAllCircles(): Promise<Circle[]>;
  getMyCircles(): Promise<Circle[]>;
  createCircle(input: CreateCircleInput): Promise<Circle>;
  updateCircle(id: string, updates: Partial<Circle>): Promise<Circle>;
  deleteCircle(id: string): Promise<void>;
  joinCircle(circleId: string): Promise<Circle>;
  leaveCircle(circleId: string): Promise<void>;

  // 动态
  getPostById(id: string): Promise<Post | null>;
  getPostsByCircle(circleId: string, limit?: number, offset?: number): Promise<Post[]>;
  getAllPosts(limit?: number, offset?: number): Promise<Post[]>;
  createPost(input: CreatePostInput): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  likePost(postId: string, userId: string): Promise<Post>;
  unlikePost(postId: string, userId: string): Promise<Post>;

  // 评论
  addComment(postId: string, content: string, authorId: string, authorName: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  likeComment(commentId: string, userId: string): Promise<Comment>;

  clear(): Promise<void>;
}
