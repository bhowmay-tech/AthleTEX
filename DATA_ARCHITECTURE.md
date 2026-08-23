# AthleTEX — Data Architecture & Persistence Map

## Storage Backend
| Mode | Description |
|------|-------------|
| MongoDB | Primary production store. Connects via MONGODB_URI. |
| FileMongoClient (fallback) | Transparent JSON-file fallback at backend/athletex_db.json. |

## Collection Index Map
| Collection | Unique Index |
|------------|-------------|
| users | email |
| match_participants | (match_id, user_id) |
| tournament_participants | (tournament_id, user_id) |
| team_members | (team_id, user_id) |
| post_likes | (post_id, user_id) |

## Auth: /api/v1/auth/
- signup -> users, athlete_profiles/mentor_profiles, user_settings
- login -> read-only
- change-password -> users

## Athletes: /api/v1/athletes/
- PUT /profile -> athlete_profiles
- POST /sport -> athlete_sports
- PUT /sport/{sport_name} -> athlete_sports
- POST /achievement -> achievements

## Matches: /api/v1/matches/
- POST /create -> matches, match_participants (auto-join organizer)
- POST /{id}/join -> match_participants
- DELETE /{id}/leave -> match_participants
- POST /{id}/score -> matches

## Tournaments: /api/v1/tournaments/
- POST /create -> tournaments
- POST /{id}/register -> tournament_participants
- POST /{id}/approve/{part_id} -> tournament_participants
- POST /{id}/start -> tournament_matches, tournaments
- POST /match/{id}/score -> tournament_matches (winner advances to next round)

## Teams: /api/v1/teams/
- POST /create -> teams, team_members (captain)
- POST /{id}/join -> team_members
- DELETE /{id}/leave -> team_members

## Events: /api/v1/events/
- POST /{id}/register -> event_participants

## Community: /api/v1/community/
- POST /posts -> posts
- POST /posts/{id}/like -> post_likes, posts.likes
- DELETE /posts/{id}/like -> post_likes, posts.likes
- POST /posts/{id}/comments -> comments

## Messaging: /api/v1/messages/
- POST /send -> messages
- GET /chat/{user_id} -> messages.is_read (marks as read)

## Notifications: /api/v1/notifications/
- PUT /{id}/read -> notifications.is_read
- PUT /read-all -> notifications.is_read

## Connections: /api/v1/connections/
- POST /request/{target_id} -> connections
- PUT /respond/{id} -> connections.status

## Settings: /api/v1/settings/
- PUT / -> user_settings

## AI: /api/v1/ai/
- POST /motion-guard -> videos, reports
- POST /match-lens -> videos, reports
- POST /open-scout/{id} -> reports
- POST /coach -> (stateless)
- POST /player-match -> (stateless)

## Persistence Guarantee
Every document persists across page refresh, logout/login, and server restart.
When MongoDB is unavailable, the FileMongoClient fallback writes all data
synchronously to backend/athletex_db.json.

## Environment Variables
- MONGODB_URI: mongodb://localhost:27017
- MONGODB_DB: athletex
- SECRET_KEY: (set in config.py)
- ACCESS_TOKEN_EXPIRE_MINUTES: 60
