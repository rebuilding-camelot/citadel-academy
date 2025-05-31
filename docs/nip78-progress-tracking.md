# NIP-78 Progress Tracking Implementation

This document outlines the implementation of NIP-78 application-specific data for student progress tracking in the Citadel Academy platform.

## Overview

We've implemented a system that uses Nostr's NIP-78 specification for application-specific data to track and display student progress in courses. This allows for decentralized progress tracking that can be verified and shared across different Nostr clients.

## Components

### 1. Progress Data Structure

The `StudentProgress` interface defines the structure for tracking student progress:

```typescript
interface StudentProgress {
  studentPubkey: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string;
  progressPercentage: number;
  timeSpent: number; // minutes
  lastAccessed: Date;
}
```

### 2. NIP-78 Event Structure

Progress data is stored in Nostr events with kind `30078` (NIP-78 application-specific data). The event structure includes:

- **Tags**:
  - `d`: Unique identifier for the progress record (`progress-{courseId}`)
  - `course`: Course identifier
  - `student`: Student's public key
  - `progress`: Percentage of course completed
  - `current_lesson`: Identifier of the current lesson
  - `time_spent`: Total time spent in minutes
  - `last_accessed`: ISO timestamp of last access

- **Content**: JSON string containing:
  - `completedLessons`: Array of completed lesson IDs
  - `achievements`: Array of earned achievements (future expansion)
  - `notes`: Student notes (future expansion)

### 3. Core Functions

The implementation provides several key functions:

- `updateStudentProgress`: Creates and signs a NIP-78 event for student progress
- `fetchStudentProgress`: Retrieves progress events for a student
- `parseProgressEvent`: Converts a Nostr event into a StudentProgress object
- `publishProgressEvent`: Publishes progress events to relays

## Integration Points

### 1. Course Lesson Component

The `CourseLesson` component has been updated to:
- Track time spent on lessons
- Allow students to mark lessons as complete
- Create and publish progress events when lessons are completed

### 2. Progress Dashboard

The `ProgressDashboard` component displays:
- Overall course progress with progress bars
- Time spent on each course
- Current lesson information
- Last access dates

### 3. Cohort Management

The `CohortManager` component now includes:
- A progress view for instructors to monitor student progress
- Visual indicators of progress percentage
- Time tracking information
- Last activity timestamps

## Benefits

1. **Decentralized**: Progress data is stored on the Nostr network, not centralized servers
2. **Portable**: Students can access their progress from any compatible client
3. **Verifiable**: Progress events are signed, ensuring authenticity
4. **Privacy-focused**: Students control their own data

## Future Enhancements

1. **Achievements**: Add support for course-specific achievements
2. **Detailed Analytics**: Provide more detailed learning analytics
3. **Progress Verification**: Allow instructors to verify and certify progress
4. **Offline Support**: Cache progress data for offline access
5. **Progress Sharing**: Enable students to share their progress with peers

## Technical Notes

- Progress events use the student's pubkey as the author
- Events are signed either with the student's private key or via NIP-07 extension
- The `d` tag with `progress-{courseId}` format allows for efficient filtering
- Time tracking is done client-side and reported in minutes