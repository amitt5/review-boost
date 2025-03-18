import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  businessName: varchar('business_name', { length: 255 }),
  googlePlaceId: varchar('google_place_id', { length: 255 }),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  messageTemplates: jsonb('message_templates').$type<{
    initialRequest: string;
    positiveResponse: string;
    negativeResponse: string;
  }>(),
  automationSettings: jsonb('automation_settings').$type<{
    enableFollowUp: boolean;
    followUpDays: number;
    maxFollowUps: number;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reviewRequests = pgTable('review_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  customerName: varchar('customer_name', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  rating: integer('rating'),
  feedback: text('feedback'),
  convertedToGoogle: boolean('converted_to_google').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ReviewRequest = typeof reviewRequests.$inferSelect;
export type NewReviewRequest = typeof reviewRequests.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  SEND_REVIEW_REQUEST = 'SEND_REVIEW_REQUEST',
  RECEIVE_REVIEW = 'RECEIVE_REVIEW',
  GOOGLE_REVIEW_CONVERTED = 'GOOGLE_REVIEW_CONVERTED'
}
