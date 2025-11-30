# API Requirements for Sundays With Mom

This document lists all the API endpoints you need to implement to replace the stub API.

## Authentication Endpoints

### `auth.isAuthenticated()`
- **Purpose**: Check if user is authenticated
- **Returns**: `boolean`
- **Method**: GET
- **Endpoint**: `/api/auth/check` or check token validity

### `auth.me()`
- **Purpose**: Get current user data
- **Returns**: User object with fields: `id`, `email`, `display_name`, `full_name`, `avatar`, `bio`, `profile_type`, `role`, `is_admin`, `claimed_location_id`
- **Method**: GET
- **Endpoint**: `/api/auth/me`
- **Auth**: Required (Bearer token)

### `auth.updateMe(data)`
- **Purpose**: Update current user profile
- **Parameters**: `{ display_name, bio, profile_type, avatar, ... }`
- **Returns**: Updated user object
- **Method**: PUT/PATCH
- **Endpoint**: `/api/auth/me`
- **Auth**: Required

### `auth.logout()`
- **Purpose**: Logout user
- **Method**: POST
- **Endpoint**: `/api/auth/logout`
- **Auth**: Required

### `auth.redirectToLogin(url)`
- **Purpose**: Redirect to login page (client-side only, no API needed)

---

## Location Endpoints

### `Location.filter(filters, sortBy, limit)`
- **Purpose**: Get filtered list of locations
- **Parameters**: 
  - `filters`: `{ is_approved: true, created_by: email, id: id, ... }`
  - `sortBy`: `'-created_date'` or `'created_date'`
  - `limit`: number (optional)
- **Returns**: Array of location objects
- **Method**: GET
- **Endpoint**: `/api/locations?is_approved=true&sort=-created_date&limit=6`
- **Fields**: `id`, `name`, `address`, `description`, `phone`, `website`, `hours`, `images`, `is_approved`, `is_featured`, `created_by`, `average_rating`, `total_reviews`, `created_date`, etc.

### `Location.list(sortBy, limit)`
- **Purpose**: Get all locations (admin)
- **Parameters**: `sortBy`, `limit`
- **Returns**: Array of location objects
- **Method**: GET
- **Endpoint**: `/api/locations?sort=-created_date`

### `Location.create(data)`
- **Purpose**: Create new location
- **Parameters**: Location object with all fields
- **Returns**: Created location object with `id`
- **Method**: POST
- **Endpoint**: `/api/locations`
- **Auth**: Required

### `Location.update(id, data)`
- **Purpose**: Update location
- **Parameters**: `id`, `data` (partial location object)
- **Returns**: Updated location object
- **Method**: PUT/PATCH
- **Endpoint**: `/api/locations/:id`
- **Auth**: Required (owner or admin)

### `Location.delete(id)`
- **Purpose**: Delete location
- **Parameters**: `id`
- **Returns**: Success status
- **Method**: DELETE
- **Endpoint**: `/api/locations/:id`
- **Auth**: Required (owner or admin)

---

## Event Endpoints

### `Event.filter(filters, sortBy, limit)`
- **Purpose**: Get filtered events
- **Parameters**: 
  - `filters`: `{ is_approved: true, created_by: email, organizer_email: email, ... }`
  - `sortBy`: `'start_date'` or `'-start_date'`
  - `limit`: number
- **Returns**: Array of event objects
- **Method**: GET
- **Endpoint**: `/api/events?is_approved=true&sort=start_date&limit=4`
- **Fields**: `id`, `title`, `description`, `start_date`, `end_date`, `location_id`, `organizer_email`, `organizer_name`, `image`, `is_approved`, `created_by`, `created_date`, etc.

### `Event.list(sortBy, limit)`
- **Purpose**: Get all events (admin)
- **Method**: GET
- **Endpoint**: `/api/events?sort=-created_date`

### `Event.create(data)`
- **Purpose**: Create new event
- **Method**: POST
- **Endpoint**: `/api/events`
- **Auth**: Required

### `Event.update(id, data)`
- **Purpose**: Update event
- **Method**: PUT/PATCH
- **Endpoint**: `/api/events/:id`
- **Auth**: Required (owner or admin)

### `Event.delete(id)`
- **Purpose**: Delete event
- **Method**: DELETE
- **Endpoint**: `/api/events/:id`
- **Auth**: Required (owner or admin)

---

## Review Endpoints

### `Review.filter(filters, sortBy)`
- **Purpose**: Get filtered reviews
- **Parameters**: 
  - `filters`: `{ location_id: id, user_email: email, ... }`
  - `sortBy`: `'-created_date'`
- **Returns**: Array of review objects
- **Method**: GET
- **Endpoint**: `/api/reviews?location_id=123&sort=-created_date`
- **Fields**: `id`, `location_id`, `user_email`, `user_name`, `rating`, `comment`, `photos`, `created_date`, etc.

### `Review.list(sortBy, limit)`
- **Purpose**: Get all reviews (admin)
- **Method**: GET
- **Endpoint**: `/api/reviews?sort=-created_date&limit=50`

### `Review.create(data)`
- **Purpose**: Create new review
- **Parameters**: `{ location_id, rating, comment, photos, user_name, user_email }`
- **Method**: POST
- **Endpoint**: `/api/reviews`
- **Auth**: Required

### `Review.update(id, data)`
- **Purpose**: Update review
- **Method**: PUT/PATCH
- **Endpoint**: `/api/reviews/:id`
- **Auth**: Required (owner or admin)

### `Review.delete(id)`
- **Purpose**: Delete review
- **Method**: DELETE
- **Endpoint**: `/api/reviews/:id`
- **Auth**: Required (owner or admin)

---

## Message & Conversation Endpoints

### `Conversation.list(sortBy)`
- **Purpose**: Get all conversations for current user
- **Parameters**: `sortBy`: `'-last_message_date'`
- **Returns**: Array of conversation objects
- **Method**: GET
- **Endpoint**: `/api/conversations?sort=-last_message_date`
- **Auth**: Required
- **Fields**: `id`, `participant_emails[]`, `participant_names[]`, `event_id`, `last_message`, `last_message_date`, `unread_count{}`

### `Conversation.create(data)`
- **Purpose**: Create new conversation
- **Parameters**: `{ participant_emails[], participant_names[], event_id, unread_count{} }`
- **Returns**: Created conversation with `id`
- **Method**: POST
- **Endpoint**: `/api/conversations`
- **Auth**: Required

### `Conversation.update(id, data)`
- **Purpose**: Update conversation (e.g., last_message, last_message_date)
- **Method**: PUT/PATCH
- **Endpoint**: `/api/conversations/:id`
- **Auth**: Required (participant)

### `Message.filter(filters, sortBy)`
- **Purpose**: Get messages for a conversation
- **Parameters**: 
  - `filters`: `{ conversation_id: id }`
  - `sortBy`: `'created_date'`
- **Returns**: Array of message objects
- **Method**: GET
- **Endpoint**: `/api/messages?conversation_id=123&sort=created_date`
- **Fields**: `id`, `conversation_id`, `sender_email`, `sender_name`, `content`, `is_read`, `created_date`

### `Message.list()`
- **Purpose**: Get all messages (for unread count)
- **Method**: GET
- **Endpoint**: `/api/messages`
- **Auth**: Required

### `Message.create(data)`
- **Purpose**: Send new message
- **Parameters**: `{ conversation_id, sender_email, sender_name, content }`
- **Returns**: Created message with `id`
- **Method**: POST
- **Endpoint**: `/api/messages`
- **Auth**: Required

### `Message.update(id, data)`
- **Purpose**: Update message (e.g., mark as read)
- **Parameters**: `{ is_read: true }`
- **Method**: PUT/PATCH
- **Endpoint**: `/api/messages/:id`
- **Auth**: Required

---

## Feed Activity Endpoints

### `FeedActivity.list(sortBy, limit)`
- **Purpose**: Get activity feed
- **Parameters**: `sortBy`: `'-created_date'`, `limit`: 20
- **Returns**: Array of activity objects
- **Method**: GET
- **Endpoint**: `/api/activities?sort=-created_date&limit=20`
- **Fields**: `id`, `activity_type`, `title`, `description`, `location_id`, `event_id`, `user_name`, `user_email`, `created_date`

### `FeedActivity.create(data)`
- **Purpose**: Create activity (when location/event/review is created)
- **Parameters**: Activity object
- **Method**: POST
- **Endpoint**: `/api/activities`
- **Auth**: Required

### `FeedActivity.delete(id)`
- **Purpose**: Delete activity (admin)
- **Method**: DELETE
- **Endpoint**: `/api/activities/:id`
- **Auth**: Required (admin)

---

## User Endpoints

### `User.filter(filters)`
- **Purpose**: Get users by filter
- **Parameters**: `{ email: email }`
- **Returns**: Array of user objects
- **Method**: GET
- **Endpoint**: `/api/users?email=user@example.com`
- **Auth**: Required

### `User.list(sortBy)`
- **Purpose**: Get all users (admin)
- **Method**: GET
- **Endpoint**: `/api/users?sort=-created_date`
- **Auth**: Required (admin)

### `User.update(id, data)`
- **Purpose**: Update user (e.g., profile_type/role)
- **Parameters**: `{ profile_type: 'organizer' }`
- **Method**: PUT/PATCH
- **Endpoint**: `/api/users/:id`
- **Auth**: Required (admin)

---

## Deal Endpoints

### `Deal.filter(filters)`
- **Purpose**: Get deals for a location
- **Parameters**: `{ location_id: id, is_active: true }`
- **Returns**: Array of deal objects
- **Method**: GET
- **Endpoint**: `/api/deals?location_id=123&is_active=true`
- **Fields**: `id`, `location_id`, `title`, `description`, `discount`, `is_active`, `created_date`

### `Deal.create(data)`
- **Purpose**: Create new deal
- **Method**: POST
- **Endpoint**: `/api/deals`
- **Auth**: Required (location owner)

---

## Offer Endpoints

### `Offer.filter(filters, sortBy)`
- **Purpose**: Get offers for user
- **Parameters**: `{ recipient_email: email }`, `sortBy`: `'-created_date'`
- **Returns**: Array of offer objects
- **Method**: GET
- **Endpoint**: `/api/offers?recipient_email=user@example.com&sort=-created_date`
- **Auth**: Required

### `Offer.update(id, data)`
- **Purpose**: Update offer (redeem, mark as read)
- **Parameters**: `{ is_redeemed: true }` or `{ is_read: true }`
- **Method**: PUT/PATCH
- **Endpoint**: `/api/offers/:id`
- **Auth**: Required

---

## Favorite Endpoints

### `Favorite.filter(filters)`
- **Purpose**: Get user's favorites
- **Parameters**: `{ user_email: email }`
- **Returns**: Array of favorite objects
- **Method**: GET
- **Endpoint**: `/api/favorites?user_email=user@example.com`
- **Fields**: `id`, `user_email`, `location_id`

---

## Notification Endpoints

### `Notification.filter(filters)`
- **Purpose**: Get user's notifications
- **Parameters**: `{ user_email: email, is_read: false }`
- **Returns**: Array of notification objects
- **Method**: GET
- **Endpoint**: `/api/notifications?user_email=user@example.com&is_read=false`
- **Fields**: `id`, `user_email`, `title`, `message`, `type`, `is_read`, `created_date`

### `Notification.update(id, data)`
- **Purpose**: Mark notification as read
- **Parameters**: `{ is_read: true }`
- **Method**: PUT/PATCH
- **Endpoint**: `/api/notifications/:id`
- **Auth**: Required

---

## Notification Preference Endpoints

### `NotificationPreference.filter(filters)`
- **Purpose**: Get user's notification preferences
- **Parameters**: `{ user_email: email }`
- **Returns**: Array of preference objects
- **Method**: GET
- **Endpoint**: `/api/notification-preferences?user_email=user@example.com`

### `NotificationPreference.create(data)`
- **Purpose**: Create notification preferences
- **Method**: POST
- **Endpoint**: `/api/notification-preferences`
- **Auth**: Required

### `NotificationPreference.update(id, data)`
- **Purpose**: Update preferences
- **Method**: PUT/PATCH
- **Endpoint**: `/api/notification-preferences/:id`
- **Auth**: Required

---

## Event Subscription Endpoints

### `EventSubscription.filter(filters)`
- **Purpose**: Get user's event subscriptions
- **Parameters**: `{ user_email: email }`
- **Returns**: Array of subscription objects
- **Method**: GET
- **Endpoint**: `/api/event-subscriptions?user_email=user@example.com`

### `EventSubscription.create(data)`
- **Purpose**: Subscribe to event
- **Method**: POST
- **Endpoint**: `/api/event-subscriptions`
- **Auth**: Required

### `EventSubscription.delete(id)`
- **Purpose**: Unsubscribe from event
- **Method**: DELETE
- **Endpoint**: `/api/event-subscriptions/:id`
- **Auth**: Required

---

## Saved Event Endpoints

### `SavedEvent.filter(filters)`
- **Purpose**: Get user's saved events
- **Parameters**: `{ user_email: email }`
- **Returns**: Array of saved event objects
- **Method**: GET
- **Endpoint**: `/api/saved-events?user_email=user@example.com`

### `SavedEvent.delete(id)`
- **Purpose**: Remove saved event
- **Method**: DELETE
- **Endpoint**: `/api/saved-events/:id`
- **Auth**: Required

---

## Organizer Follow Endpoints

### `OrganizerFollow.filter(filters)`
- **Purpose**: Get followers for organizer
- **Parameters**: `{ organizer_email: email }`
- **Returns**: Array of follow objects
- **Method**: GET
- **Endpoint**: `/api/organizer-follows?organizer_email=organizer@example.com`

---

## Hidden Content Endpoints

### `HiddenContent.filter(filters)`
- **Purpose**: Get user's hidden content
- **Parameters**: `{ user_email: email }`
- **Returns**: Array of hidden content objects
- **Method**: GET
- **Endpoint**: `/api/hidden-content?user_email=user@example.com`

### `HiddenContent.delete(id)`
- **Purpose**: Delete hidden content
- **Method**: DELETE
- **Endpoint**: `/api/hidden-content/:id`
- **Auth**: Required

---

## Report Endpoints

### `Report.filter(filters, sortBy)`
- **Purpose**: Get user's reports
- **Parameters**: `{ reporter_email: email }`, `sortBy`: `'-created_date'`
- **Returns**: Array of report objects
- **Method**: GET
- **Endpoint**: `/api/reports?reporter_email=user@example.com&sort=-created_date`

---

## File Upload Endpoint

### `integrations.Core.UploadFile({ file })`
- **Purpose**: Upload image/file
- **Parameters**: `{ file: File }`
- **Returns**: `{ file_url: 'https://...' }`
- **Method**: POST (multipart/form-data)
- **Endpoint**: `/api/upload`
- **Auth**: Required

---

## Notes

1. **Authentication**: Most endpoints require authentication. Use Bearer token in `Authorization` header.

2. **Filtering**: The `filter()` method accepts an object with key-value pairs that should be converted to query parameters.

3. **Sorting**: Sort parameters like `'-created_date'` mean descending order. Remove the `-` prefix and use `sort=-created_date` in query string.

4. **Pagination**: Consider adding pagination for list endpoints (limit/offset or page/pageSize).

5. **Error Handling**: Return appropriate HTTP status codes:
   - `200` - Success
   - `201` - Created
   - `400` - Bad Request
   - `401` - Unauthorized
   - `403` - Forbidden
   - `404` - Not Found
   - `500` - Server Error

6. **CORS**: Make sure your API allows requests from `sundayswithmom.com`.

7. **Rate Limiting**: Consider implementing rate limiting for public endpoints.

